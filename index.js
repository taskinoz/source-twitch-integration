const TwitchBot = require('twitch-bot'); //https://github.com/kritzware/twitch-bot
const Login = require('./twitch-login.js');
const ks = require('node-key-sender'); //https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html


//Login Info
const Bot = new TwitchBot({
  username: Login.username,
  oauth: Login.oauth,
  channels: [Login.channels]
})

const Commands = {
  lowGravity: ['sv_gravity 300','Low Gravity'],
  regularGravity: ['sv_gravity 750','Regular Gravity'],
  highGravity: ['sv_gravity 900','High Gravity'],
  inverted: ['m_invert_pitch 1','Inverted'],
  fov: ['cl_fovScale 0.5', 'Change FOV'],
  difficultyEasy: ['sp_difficulty 0', 'Easy Difficulty'],
  difficultyRegular: ['sp_difficulty 1', 'Regular Difficulty'],
  difficultyHard: ['sp_difficulty 2', 'Hard Difficulty'],
  difficultyMaster: ['sp_difficulty 3', 'Master Difficulty']
}

// FOV SCALE
// 1.55 - 110
// 1.42003 - 100
// 1.28442 - 90
// 1.13185 - 80
// 1 - 70

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
          ks.sendKey('equals');
          break;
        case '!2':
          Bot.say("You have chosen 2");
          ks.sendKey('space');
          break;
        case '!3':
          Bot.say("You have chosen 3");
          ks.sendKey('q');
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
