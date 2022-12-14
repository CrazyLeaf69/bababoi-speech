import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Authorized from "../components/Authorized";

export default function Home() {
  const [code, setCode] = useState(null);
  const [guild_id, setGuild_id] = useState(null);

  const AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_REDIRECT_URI}&response_type=code&scope=identify`;

  const router = useRouter();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    if (!code) {
      router.push(AUTH_URL);
    } else {
      setCode(code);
      setGuild_id(guild_id);
    }
  }, []);

  return (
    <div>
      <Head>
        <title>Bababoi Voice</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {code && <Authorized code={code} guildId={guild_id} />};
    </div>
  );
}
