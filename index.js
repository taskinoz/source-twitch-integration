// LIBRARY IMPORTS
// ------------------------------------------------------
const TwitchBot = require('twitch-bot'); // https://github.com/kritzware/twitch-bot
var fs = require('fs');
var http = require('http');
var url = require('url');
const pipe = '\\\\.\\pipe\\TTF2SDK'; // Titanfall Pipe
const Login = JSON.parse(fs.readFileSync('twitch-login.json', 'utf8'));
const Config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
// ------------------------------------------------------

//TWITCH CONFIG
// ------------------------------------------------------
//Login Info
const Bot = new TwitchBot({
  username: Login.username,
  oauth: Login.oauth,
  channels: [Login.channels]
})
// ------------------------------------------------------

// TITANFALL COMMANDS
// ------------------------------------------------------
// Find the commands in the commands.json
const Commands = JSON.parse(fs.readFileSync('commands.json', 'utf8'));
const Gifts = JSON.parse(fs.readFileSync('gifts.json', 'utf8'));
// Bind the reset command
setTimeout(function() {
  fs.writeFileSync(pipe, `CGetLocalClientPlayer().ClientCommand("alias resCMD ${Commands.reset}")`)
},100);
setTimeout(function() {
  fs.writeFileSync(pipe, `CGetLocalClientPlayer().ClientCommand("alias resMVM ${Commands.resetMV}")`)
},200);
setTimeout(function() {
  fs.writeFileSync(pipe, `CGetLocalClientPlayer().ClientCommand("bind ${Config.resetKey} resCMD;resMVM;")`)
},300);
// FOV SCALE
// 1.55 - 110
// 1.42003 - 100
// 1.28442 - 90
// 1.13185 - 80
// 1 - 70
// ------------------------------------------------------

// FLAGS AND VARIABLES
// ------------------------------------------------------
var voting = false;
var votes1 = 0, votes2 = 0, votes3 = 0; // Vote counts
var voteStor = []; // Current vote storage
var winning;
var temp = [];
var foo = 0;
var tempCounting = [];
const keys = Object.keys(Commands);
var x;
// ------------------------------------------------------

// FUNCTIONS
// ------------------------------------------------------
// Runs through the Commands object and picks 3 random ones
function generateCommands() {
  for (let i = 0; i < 3; i++) {
    x=Math.floor(Math.random() * (keys.length-2));
    do {
      x=Math.floor(Math.random() * (keys.length-2));
    }
    while (temp.includes(x));
    temp.push(x);
    // Make 2D array for the commands
    voteStor.push([Commands[keys[temp[i]]][0]]);
    voteStor[i].push(Commands[keys[temp[i]]][1]);
  }
}

// Say the currently chosen commands in twitch chat
function sayCommands() {
  Bot.say("Use ! to choose an Command");
  Bot.say("!1 - "+voteStor[0][1]);
  Bot.say("!2 - "+voteStor[1][1]);
  Bot.say("!3 - "+voteStor[2][1]);
}

// Run a command in Titanfall
function generalCmd(a) {
  fs.writeFileSync(pipe, 'CGetLocalClientPlayer().ClientCommand("'+a+'")');
}

// The same as generalCmd but adds a + and a - to
// start and stop a movement command
function movementCmd(a) {
  fs.writeFileSync(pipe, 'CGetLocalClientPlayer().ClientCommand("+'+a+'")');
  setTimeout(function () {
    fs.writeFileSync(pipe, 'CGetLocalClientPlayer().ClientCommand("-'+a+'")');
  }, 1000)
}

function compareVotes(x,y,z) {
  tempCounting=[x,y,z];
  for (let i = 0; i < tempCounting.length; i++) {
    if (tempCounting[i]==Math.max(x,y,z)){
      // Futureproofing for using movement commands like +jump
      if ((voteStor[i][0]).includes("+") || (voteStor[i][0]).includes("-")){
        movementCmd(Commands[keys[temp[i]]][0]);
        winning = voteStor[i][1];
        return voteStor[i][1];
      }
      else {
        generalCmd(Commands[keys[temp[i]]][0]);
        winning = voteStor[i][1];
        return voteStor[i][1];
      }
    }
  }
}

function pingPongReset(c) {
  if (voting && foo<3) {
    generalCmd(Commands["reset"+c]);
    setTimeout(function(){
      pongPingReset(c)
    },3000);
    foo++;
  }
}

function pongPingReset(b) {
  if (voting && foo<3) {
    generalCmd(Commands["reset"+b]);
    setTimeout(function(){
      pingPongReset(b)
    },3000);
    foo++;
  }
}

// Reset all the variables
function reset(a) {
  temp=[];
  winning="";
  voteStor=[];
  tempCounting = [];
  votes1 = 0, votes2 = 0, votes3 = 0; // Vote counts
  foo=0;
  setTimeout(function(){
    pingPongReset(a)
  },1000);
}

function startVoting() {
  voting = true;
  console.log("Voting starts now");
  generateCommands();
  sayCommands();
  setTimeout(function () {
    endVoting();
  },Config.votingTime*1000);
}

function endVoting() {
  voting = false;
  compareVotes(votes1,votes2,votes3);
  Bot.say(winning+" won with "+Math.max(votes1,votes2,votes3)+" votes");
  setTimeout(function(){
    if (winning=="invertedControls") {reset("MV");}
    else {reset("");}
    startVoting();
  },Config.playTime*1000);
}
// ------------------------------------------------------

// HTTP SERVER
// ------------------------------------------------------
// https://stackoverflow.com/questions/6011984/basic-ajax-send-receive-with-node-js
// https://nodejs.org/en/docs/guides/anatomy-of-an-http-transaction/

http.createServer(function(request, response){
  var path = url.parse(request.url).pathname;
  if(path=="/getstring"){
    if (voting){
      var obsGraphics = {
        vote1: [voteStor[0][1],votes1],
        vote2: [voteStor[1][1],votes2],
        vote3: [voteStor[2][1],votes3],
        winning: winning,
        time: Config.votingTime
      };
    }
    else if (voting==false && winning) {
      var obsGraphics = {
        winning: winning,
        time: Config.votingTime
      };
    }
    else {
      var obsGraphics = {
        // Dummy Variables
        vote1: ['loading...','0'],
        vote2: ['loading...','0'],
        vote3: ['loading...','0'],
        winning: '',
        time: Config.votingTime
      };
    }
    var obsGraphicsJson = JSON.stringify(obsGraphics);
    response.writeHead(200, {'content-type':'application/json','Content-Length' : Buffer.byteLength(obsGraphicsJson, 'utf8')});
    response.end(obsGraphicsJson);
  }
  else{
    // Write the HTML file to the server
    fs.readFile('graphics/index.html', function(err, file) {
      if(err) {
        // write an error response or nothing here
        return;
      }
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end(file, "utf-8");
    });
  }
}).listen(80); // ;)
console.log("OBS Graphics Server Initialized: localhost");
// ------------------------------------------------------


Bot.on('join', () => {
  startVoting();
  Bot.on('message', chatter => {
    // Developer Commands
    if (chatter.username=="taskinoz" && (chatter.message).slice(0,1)=="!" && /1|2|3/.test((chatter.message).slice(1,2))==false) {
      generalCmd((chatter.message).slice(1));
    }
    // Look for a command
    if ((chatter.message).includes("!") && voting) {
      switch (chatter.message) {
        case '!1':
          //Bot.say("You have chosen 1");
          votes1++;
          break;
        case '!2':
          //Bot.say("You have chosen 2");
          votes2++;
          break;
        case '!3':
          //Bot.say("You have chosen 3");
          votes3++;
          break;
      }
    }
    if (chatter.bits==Config.bitGiftAmount) {
      let x = (chatter.message).split("give ")[1];
      generalCmd(Gifts[x]);
    }
  })
})

Bot.on('error', err => {
  console.log(err)
})
