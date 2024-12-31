async function onLoad() {
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("client_id");
  const clientSecret = urlParams.get("client_secret");
  localStorage.setItem("client_id", clientId);
  localStorage.setItem("client_secret", clientSecret);
  document.getElementById("client_id").innerHTML = clientId;

  const codeVerifier = generateRandomString(64);
  localStorage.setItem("code_verifier", codeVerifier);


  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  //const redirectUri = "http://localhost:5500/callback";
  const redirectUri = window.location.protocol + "//" + window.location.host + "/callback.html";

  const scope = "user-read-private user-read-email user-read-playback-state";
  const authUrl = new URL("https://accounts.spotify.com/authorize");

  // generated in the previous step
  window.localStorage.setItem("code_verifier", codeVerifier);

  const params = {
    response_type: "code",
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state: "e^LrT&P)(52ep57x"
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

async function onCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get("code");
  window.document.getElementById("code").innerHTML = code;
  localStorage.setItem("code", code);
  var clientId = localStorage.getItem("client_id");
  var clientSecret = localStorage.getItem("client_secret");
  var codeVerifier = localStorage.getItem("code_verifier");
  var authb64 = "Basic " + btoa(clientId + ':' + clientSecret);
  console.log(authb64)
  //const redirectUri = window.location.protocol + "//" + window.location.host + "/token.html";
  var redirect_uri = "http://localhost:5500/callback.html";

  const url = new URL("https://accounts.spotify.com/api/token");

  const payload = {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "Authorization": authb64
    },
    body: new URLSearchParams({
      "grant_type" : "authorization_code",
      "code" : code,
      "redirect_uri": redirect_uri,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  console.log(response);

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);
}

async function getDevice(){
  const urlParams = new URLSearchParams(window.location.search);
  var access_token = urlParams.get("access_token");
  var auth = "Bearer " + access_token;
  
  const url = new URL("https://api.spotify.com/v1/me/player/devices");
  const payload = {
    method: "GET",
    headers: {
      "Authorization": auth
    }
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  console.log(response);

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
