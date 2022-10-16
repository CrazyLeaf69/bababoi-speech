import axios from "axios";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { code } = req.body;
    if (code) {
      try {
        const params = new URLSearchParams();
        params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID);
        params.append("client_secret", process.env.NEXT_PUBLIC_CLIENT_SECRET);
        params.append("grant_type", "authorization_code");
        params.append("code", code.toString());
        params.append("redirect_uri", process.env.NEXT_PUBLIC_REDIRECT_URI);

        const response = await axios.post(
          "https://discord.com/api/v8/oauth2/token",
          params.toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        const { access_token, refresh_token, expires_in } = response.data;
        res.send({
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresIn: expires_in,
        });
      } catch (err) {
        console.log(err.response);
      }
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
