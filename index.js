const TwitchBot = require('twitch-bot'); //https://github.com/kritzware/twitch-bot
const Login = require('./twitch-login.js');

//Login Info
const Bot = new TwitchBot({
  username: Login.username,
  oauth: Login.oauth,
  channels: [Login.channels]
})

const Commands = {
  lowGravity: ['sv_gravity 300','Low Gravity'],
  regularGravity: ['sv_gravity 750','Regular Gravity'],
  highGravity: ['sv_gravity 900','High Gravity']
}

function generateCommands() {
  Bot.say("!1 - "+Commands.lowGravity[1]);
  Bot.say("!2 - "+Commands.regularGravity[1]);
  Bot.say("!3 - "+Commands.highGravity[1]);
}

Bot.on('join', () => {

  Bot.on('message', chatter => {

    // Look for a command
    if ((chatter.message).includes("!")) {
      switch (chatter.message) {
        case '!1':
          Bot.say("You have chosen 1");
          break;
        case '!2':
          Bot.say("You have chosen 2");
          break;
        case '!3':
          Bot.say("You have chosen 3");
          break;
        default:
          Bot.say("Sorry that isn't a command");
      }
    }
  })
})

Bot.on('error', err => {
  console.log(err)
})
