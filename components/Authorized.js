import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
// import WebSocket from "ws";
import useAuth from "../hooks/useAuth";

const Authorized = ({ code, guildId }) => {
  // const accessToken = useAuth(code);
  // console.log(accessToken);

  const numbers = ["ett", "två", "tre", "fyra", "fem", "one", "two", "three", "four", "five"];
  const commands = ["add from search", "add song", "play", "pausa", "resume", "search", "leave", "skip"];
  const botCommands = ["addfromsearch", "addtoqueue", "play", "pausa", "resume", "search", "leave", "skip"];

  function startDictation(data) {
    console.log(data);
    if (window.hasOwnProperty("webkitSpeechRecognition")) {
      var recognition = new webkitSpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "sv";
      recognition.start();
      recognition.onresult = function (e) {
        if (e.results[e.results.length - 1].isFinal) {
          understand(e.results[e.results.length - 1][0]?.transcript.trim(), data);
        }
      };

      // var button = document.querySelector("button");
      var status = document.querySelector("h1>div");

      recognition.addEventListener("audiostart", (e) => {
        // button.disabled = true;
        status.className = "blink_me";
        status.innerHTML = "Listening...";
      });
      recognition.addEventListener("audioend", (e) => {
        // button.disabled = false;
        status.className = "not_listening";
        status.innerHTML = "Not Listening";
        recognition.stop();
        handleActivate(data);
      });

      recognition.onerror = function (e) {
        // console.log(e);
        // recognition.start();
      };
    }
  }
  function handleActivate(data) {
    startDictation(data);
  }
  function understand(msg, data) {
    const lowercased = msg.toLowerCase();
    document.querySelector(".transcription").innerHTML = "What I heard: " + lowercased;

    let command;
    if (lowercased.includes(commands[0])) {
      command = "addfromsearch";
    } else if (lowercased.includes(commands[1])) {
      command = "addtoqueue";
    } else {
      command = lowercased.split(" ")[0];
    }
    const isCommand = botCommands.indexOf(command) > -1;

    if (isCommand) {
      const results = document.querySelector(".result_container");
      results.innerHTML += `<div>${lowercased}</div>`;
      if (results.children.length > 10) {
        results.removeChild(results.childNodes[2]);
      }

      let args = lowercased;

      switch (command) {
        case "addfromsearch":
          numbers.forEach((num, i) => {
            if (args.includes(num)) {
              args = i + 1;
            }
          });
          runCommand(data, `!${command} ${args.split(" ")[3] || args}`);
          break;
        case "addtoqueue":
          args = args.split(" ");
          args.shift();
          args = args.join(" ");
          runCommand(data, `!${command} ${args}`);
          break;
        case "play":
          args = args.split(" ");
          args.shift();
          args = args.join(" ");
          runCommand(data, `!${command} ${args}`);
          break;
        case "search":
          args = args.split(" ");
          args.shift();
          args = args.join(" ");
          runCommand(data, `!${command} ${args}`);
          break;
        case "pausa":
          runCommand(data, `!${command}`);
          break;
        case "resume":
          runCommand(data, `!${command}`);
          break;
        case "leave":
          runCommand(data, `!${command}`);
          break;
        case "skip":
          runCommand(data, `!${command}`);
          break;

        default:
          break;
      }
    }
  }

  function runCommand(data, command) {
    // console.log(userInfo);
    fetch(
      "https://discord.com/api/webhooks/1030313656086450277/jgPp2cQ3XyHlFV_FhRbn_GeYdKeOOo8XPpRb5AqpUVrv8wPFLjzb4czeVZj2LLGy60p4",
      {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.nick,
          avatar_url: `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png`,
          content: command,
        }),
      }
    );
  }

  const [errorMessage, setErrorMessage] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  // useEffect(() => {
  //   startDictation();
  // }, []);
  useEffect(() => {
    const authToken = new URLSearchParams(window.location.search).get("authtoken");
    async function fetchData() {
      if (authToken && !userInfo) {
        try {
          const response = await axios.get("https://discord.com/api/v10/users/@me/guilds/693042214875430954/member", {
            headers: {
              "Authorization": `Bearer ${authToken}`,
            },
          });
          const url = new URL(window.location);
          console.log("bruh");
          url.searchParams.delete("code");
          window.history.pushState({}, "", url);
          window.history.pushState({}, null, "");
          startDictation(response.data);
          setUserInfo(response.data);
        } catch (err) {
          console.log(err);
          console.log(err.response?.data.retry_after);
          setErrorMessage(err.response?.data.retry_after);
        }
      } else if (code) {
        try {
          axios
            .post("/api/auth", {
              code,
            })
            .then(async (res) => {
              // setAccessToken(res.data.accessToken);
              // setRefreshToken(res.data.refreshToken);
              // setExpiresIn(res.data.expiresIn);
              const token = res.data.accessToken;
              console.log(token);
              const response = await axios.get(
                "https://discord.com/api/v10/users/@me/guilds/693042214875430954/member",
                {
                  headers: {
                    "Authorization": `Bearer ${token}`,
                  },
                }
              );
              setUserInfo(response.data);
              console.log(response.data);
              startDictation(response.data);
              const url = new URL(window.location);
              url.searchParams.delete("code");
              url.searchParams.set("authtoken", token);
              // window.history.pushState({}, "", url);
              window.history.pushState({}, null, "");
            })
            .catch((err) => {
              console.log(err);
              console.log(err.response?.data.retry_after);
              setErrorMessage(err.response?.data.retry_after);
              window.location = "/";
            });
        } catch (err) {
          console.log(err);
          // console.log(err.response?.data.retry_after);
          // setErrorMessage(err.response?.data.retry_after);
        }
      }
    }
    fetchData();
  }, []);

  return (
    <>
      {errorMessage && <h1>Try again in {errorMessage} seconds</h1>}
      {userInfo && <h3>Logged in as: {userInfo.nick}</h3>}
      <h1>
        Status:<div className="blink_me"> Listening...</div>
      </h1>
      <div>
        Commands: Play, Pausa, Resume, Add song (adds a song to the queue), Search, Add from search, Skip, Leave
      </div>
      <h3 className="transcription">What I heard: </h3>
      <div className="result_container" height="80%" width="50%">
        <h3>Commands</h3>
      </div>
    </>
  );
};

export default Authorized;

// export async function getServerSideProps(context) {
//   const authToken = new URLSearchParams(window.location.search).get("authtoken");
//   return {
//     props: {}, // will be passed to the page component as props
//   };
// }
