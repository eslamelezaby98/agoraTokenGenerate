const express = require('express');
const { RtmTokenBuilder, RtcRole } = require('agora-access-token')


const PORT = 8080;
const APP_ID = "bc1bf71f5d514306b84b4f4d29f6f37a";
const APP_CERTIFCTION = "22f86ae3ee1740a0a5eadc6bbd623f54";



const app = express();

const nocache = (_, resp, next) => {
  resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  resp.header('Expires', '-1');
  resp.header('Pragma', 'no-cache');
  next();
}

const generateRTCToken = (req, resp) => {
  // set response 
  resp.header('Access-Control-Allow-Origin', '*');
  // get channel name
  const channelName = req.params.channel;
  if (!channelName) {
    return resp.status(500).json({ 'error': 'channel is required' });
  }

  let uid = req.params.uid;
  if (!uid || uid === '') {
    return resp.status(500).json({ 'error': 'uid is required' });
  }
  // get role
  let role;
  if (req.params.role === 'publisher') {
    role = RtcRole.PUBLISHER;
  } else if (req.params.role === 'audience') {
    role = RtcRole.SUBSCRIBER
  } else {
    return resp.status(500).json({ 'error': 'role is incorrect' });
  }

  // get expire time
  let expireTime = req.query.expiry;
  if (!expireTime || expireTime === '') {
    expireTime = 3600;
  } else {
    expireTime = parseInt(expireTime, 10);
  }

  // calc
  const currentTime = Math.floor(Date.now() / 1000);
  const privilegeExpireTime = currentTime + expireTime;

  // build token
  let token;
  if (req.params.tokentype === 'userAccount') {
    token = RtmTokenBuilder.buildTokenWithAccount(APP_ID, APP_CERTIFCTION, channelName, uid, role, privilegeExpireTime);
  } else if (req.params.tokentype === 'uid') {
    token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFCTION, channelName, uid, role, privilegeExpireTime);
  } else {
    return resp.status(500).json({ 'error': 'token type is invalid' });
  }

  return resp.json({ "token": token });

}


app.get('/rtc/:channel/:role/:tokentype/:uid', nocache, generateRTCToken)
app.listen(PORT, () => {
  console.log('Listen on port: ${PORT}')
});

//* endpoint => get
// http://localhost:8080/rtc/test/publisher/uid/1

//* source:
//  https://www.agora.io/en/blog/how-to-build-a-token-server-for-agora-applications-using-nodejs/
