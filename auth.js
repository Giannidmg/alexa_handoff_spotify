async function onLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("client_id");
  const clientSecret = urlParams.get("client_secret");
  document.getElementById("client_id").innerHTML = clientId;
  document.getElementById("client_secret").innerHTML = clientSecret;

  const codeVerifier = generateRandomString(64);

  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  //const redirectUri = "http://localhost:5500/callback";
  const redirectUri = window.location.protocol + window.location.host + "/callback.html";

  const scope = "user-read-private user-read-email";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // generated in the previous step
  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();

}

function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}
