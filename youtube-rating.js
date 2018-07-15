const snekfetch = require("snekfetch")

const authURL = "https://accounts.google.com/o/oauth2/auth?client_id=340653516483-6g62fc176suh84esvq5aq760scditkgp.apps.googleusercontent.com&redirect_uri=http%3A%2F%2Flocalhost%2Foauth2callback&scope=https://www.googleapis.com/auth/youtube.force-ssl&response_type=code&access_type=offline"
const revogueTokenURL = "https://accounts.google.com/b/0/IssuedAuthSubTokens"

function authenticate (url){
    if (!url) {
        console.log("Url not defined")
        return
    }
    var uncodedCode = url.split("code=")[1]
    var code = decodeURIComponent(uncodedCode)
    
    var postURL = "https://accounts.google.com/o/oauth2/token"
    var payload = {
        code: code,
        client_id: "340653516483-6g62fc176suh84esvq5aq760scditkgp.apps.googleusercontent.com",
        client_secret: "ozP_O27aeLXWEiLnanYdXWOs",
        redirect_uri: "http://localhost/oauth2callback",
        grant_type: "authorization_code"
    }
    return snekfetch.post(postURL, {headers:{"Content-Type" : "application/x-www-form-urlencoded"}})
        .send(payload)
}

function refreshToken(refreshToken){
    if(!refreshToken){
        console.log("refreshToken not defined")
        return
    }
    var postURL = "https://accounts.google.com/o/oauth2/token"
    var payload = {
        refresh_token: refreshToken,
        client_id: "340653516483-6g62fc176suh84esvq5aq760scditkgp.apps.googleusercontent.com",
        client_secret: "ozP_O27aeLXWEiLnanYdXWOs",  
        grant_type: "refresh_token"
    }
    return snekfetch.post(postURL, {headers:{"Content-Type" : "application/x-www-form-urlencoded"}})
        .send(payload)
}

function revogueToken(token){
    if(!token){
        console.log("Token not defined")
        return
    }
    return snekfetch.get("https://accounts.google.com/o/oauth2/revoke?token=" + token)
}

function rate(id,rate,token){
    if(!id){
        console.log("Id not defined")
        return
    }
    if(!rate){
        console.log("Rate not defined")
        return
    }
    if(!token){
        console.log("Token not defined")
        return
    }
    return snekfetch.post(`https://www.googleapis.com/youtube/v3/videos/rate?id=${id}&rating=${rate}&key=AIzaSyAjRQYSwcvSA9-BXkZx4wAXmb1-sEpZAbw&access_token=${token}`)
}

function getRate(id,token){
    if(!id){
        console.log("Id not defined")
        return
    }
    if(!token){
        console.log("Token not defined")
        return
    }
    return snekfetch.post(`https://developers.google.com/apis-explorer/#p/youtube/v3/youtube.videos.getRating?id=${id}&key=AIzaSyAjRQYSwcvSA9-BXkZx4wAXmb1-sEpZAbw&access_token=${token}`)
}

function addComment(id,text,token){
    if(!text){
        console.log("Text not defined")
        return
    }
    if(!id){
        console.log("Id not defined")
        return
    }
    if(!token){
        console.log("Token not defined")
        return
    }
    var channelId
    snekfetch.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id="+id+"&key=AIzaSyAjRQYSwcvSA9-BXkZx4wAXmb1-sEpZAbw&access_token="+token)
        .then(r=>{
            var items = r.body.items[0]
            channelId = items.snippet.channelId
        })
    return snekfetch.post("https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&key=AIzaSyAjRQYSwcvSA9-BXkZx4wAXmb1-sEpZAbw&access_token="+token)
        .send({
            "snippet": {
                "channelId": channelId,
                "topLevelComment": {
                 "snippet": {
                  "textOriginal": text
                 }
                },
                "videoId": id
               }
        })
}

module.exports = {
    authURL:authURL,
    revogueTokenURL:revogueTokenURL,
    authenticate:authenticate,
    refreshToken:refreshToken,
    revogueToken:revogueToken,
    rate:rate,
    getRate:getRate,
    addComment:addComment
}