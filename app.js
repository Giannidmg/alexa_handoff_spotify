async function onLoad() {

  // recuper informazioni dalla chiamata
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get("client_id");
  const clientSecret = urlParams.get("client_secret");
  const deviceName = decodeURIComponent(urlParams.get("device_name"));

  // salvataggio in local storage
  localStorage.setItem("client_id", clientId);
  localStorage.setItem("client_secret", clientSecret);
  localStorage.setItem("device_name", deviceName);

  document.getElementById("client_id").innerHTML = clientId;

  // const codeVerifier = generateRandomString(64);
  // localStorage.setItem("code_verifier", codeVerifier);

  // const hashed = await sha256(codeVerifier);
  // const codeChallenge = base64encode(hashed);

  //genero chiamata REst per AUTH
  const redirectUri = window.location.protocol + "//" + window.location.host + "/callback.html";

  const scope = `user-read-private
                  user-read-email 
                  user-read-playback-state 
                  user-modify-playback-state
                `;
  const authUrl = new URL("https://accounts.spotify.com/authorize");

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

  // recupero il code generato da URL
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get("code");
  window.document.getElementById("code").innerHTML = code;

  // salvo il codice in local storage
  localStorage.setItem("code", code);

  // recupero i dati da local storage
  var clientId = localStorage.getItem("client_id");
  var clientSecret = localStorage.getItem("client_secret");
  var deviceName = localStorage.getItem("device_name");

  // genero la Basic per Autenticazione
  var authb64 = "Basic " + btoa(clientId + ':' + clientSecret);

  var redirectUri = window.location.protocol + "//" + window.location.host + "/callback.html";
  //var redirect_uri = "http://localhost:5500/callback.html";

  // avvio la chiamata per il token
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
      "redirect_uri": redirectUri,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  // salvo i token in local storage
  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);

  const deviceUrl = new URL(window.location.protocol + "//" + window.location.host + "/getdevices.html");
  const params = {
    access_token: response.access_token,
    device_name: deviceName
  };

  deviceUrl.search = new URLSearchParams(params).toString();
  window.location.href = deviceUrl.toString();

}

async function getDevices(){

  // recupero access token da URL
  const urlParams = new URLSearchParams(window.location.search);
  var accessToken = urlParams.get("access_token");
  var deviceName = urlParams.get("device_name");
  var auth = "Bearer " + accessToken;
  
  // avvio recuper dei dispositivi
  const url = new URL("https://api.spotify.com/v1/me/player/devices");
  const payload = {
    method: "GET",
    headers: {
      "Authorization": auth
    }
  };

  const body = await fetch(url, payload);
  const response = await body.json();
  const devices = await response.devices;

  var deviceID = devices.map(dev => dev.name == deviceName ? dev.id : null ).filter(id => id != null)[0];

  localStorage.setItem("device_id", deviceID);

  const setDeviceUrl = new URL(window.location.protocol + "//" + window.location.host + "/setdevice.html");
  const params = {
    access_token: accessToken,
    device_id: deviceID
  };

  setDeviceUrl.search = new URLSearchParams(params).toString();
  window.location.href = setDeviceUrl.toString();


}

async function setNewDevice(){

  // recupero access token da URL
  const urlParams = new URLSearchParams(window.location.search);
  var accessToken = urlParams.get("access_token");
  var deviceID = urlParams.get("device_id");
  var auth = "Bearer " + accessToken;
  
  // avvio recuper dei dispositivi
  const url = new URL("https://api.spotify.com/v1/me/player");
  const payload = {
    method: "PUT",
    headers: {
      "Authorization": auth,
      "Content-Type" : "application/json"
    },
    body: JSON.stringify({
      "device_ids": [deviceID]
    })
  };

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
