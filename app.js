const APIController = ( function() {

    const urlParams = new URLSearchParams(window.location.search);    
    const clientId = urlParams.get('client_id');
    const clientSecret = urlParams.get('client_secret');
    const redirectUri = "https://open.spotify.com"

    document.getElementById("client_id").innerHTML = clientId;
    document.getElementById("client_secret").innerHTML = clientSecret;

    var code = getAuth(clientId, redirectUri);
    
    //var access_token = getToken(clientId, clientSecret);
    //document.getElementById("accass_token").innerHTML = access_token;
    
    //var devices = getDevices(access_token);
    //document.getElementById("devices").innerHTML = devices
    
    
})();





async function getAuth (clientId, redirectUri) {

    const result = await fetch('https://accounts.spotify.com/authorize', {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin' : '*',
            'client_id' : clientId,
            'response_type' : 'code',
            'scope' : 'user-read-private user-read-email',
            'redirect_uri' : redirectUri,
            'state' : 'e^LrT%26P)(52ep57x'
            }    
        });

    const data = await result.json();
    console.log("data:", data)
    return data;
}

async function getToken (clientId, clientSecret) {

    const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/x-www-form-urlencoded', 
            'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
        },
        body: 'grant_type=client_credentials'
    });

    const data = await result.json();
    console.log("access_token:", data.a)
    // return data.access_token;

    const result2 = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + data.access_token}
    });
    
    const data2 = await result.json();
    return data2;
}

async function getDevices (token) {
        
    const result = await fetch(`https://api.spotify.com/v1/me/player/devices`, {
        method: 'GET',
        headers: { 'Authorization' : 'Bearer ' + token}
    });
    
    const data = await result.json();
    return data;
}