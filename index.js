const TwitchBot = require('twitch-bot');
const Login = require('./twitch-login.js');

const Bot = new TwitchBot({
  username: Login.username,
  oauth: Login.oauth,
  channels: [Login.channels]
})

Bot.on('join', () => {

  Bot.on('message', chatter => {
    if(chatter.message === '!test') {
      Bot.say('Command executed! PogChamp')
    }
  })
})

Bot.on('error', err => {
  console.log(err)
})
