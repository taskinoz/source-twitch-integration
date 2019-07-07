// LIBRARY IMPORTS
// ------------------------------------------------------
const TwitchBot = require('twitch-bot'); // https://github.com/kritzware/twitch-bot
var fs = require('fs');
var http = require('http');
var url = require('url');
const Login = JSON.parse(fs.readFileSync('twitch-login.json', 'utf8'));
const Config = require('./config.js');
// Pipe Config
if (Config.game == "tfall2") {
  var pipe = '\\\\.\\pipe\\TTF2SDK'; // Titanfall Pipe
}
else {
  var pipe = '\\\\.\\pipe\\SourceCommands'; // Source Games Pipe
}
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

// GAME COMMANDS
// ------------------------------------------------------
// Find the commands in the commands.json
const CommandFile = JSON.parse(fs.readFileSync('commands.json', 'utf8'));
const Commands = CommandFile[Config.game];
//console.log(Commands);

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
// Item function
// Get Items Config
if (Config.enableItems && Config.game=="tfall2") {
  var Items = JSON.parse(fs.readFileSync('items.json', 'utf8'));
  var freeItem = "";

  setInterval(function() {
    //freeItem="";
    setTimeout(function () {
      Bot.say("Find out how to give the streamer items - https://github.com/taskinoz/titanfall-twitch-integration/blob/master/Items.md");
    },Math.floor(Math.random()*Math.floor(100))*1000);
    if (freeItem!="") {
      Bot.say("Find out how to give the streamer items - https://github.com/taskinoz/titanfall-twitch-integration/blob/master/Items.md");
    }
    else {
      Bot.say("Free item command !claim");
    }
  },(Config.freeBitItemsInterval).split("s")[0]*1000);
}

// Runs through the Commands object and picks 3 random ones
function generateCommands() {
  for (let i = 0; i < 3; i++) {
    x=Math.floor(Math.random() * (keys.length-1));
    do {
      x=Math.floor(Math.random() * (keys.length-1));
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

// Write commands to Source games
function sourceCmd(a) {
  fs.writeFileSync(pipe, a);
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
        if (Cotfig.game=="tfall2") {
          movementCmd(Commands[keys[temp[i]]][0]);
        }
        winning = voteStor[i][1];
        return voteStor[i][1];
      }
      else {
        if (Config.game=="tfall2") {
          generalCmd(Commands[keys[temp[i]]][0]);
        }
        else {
          sourceCmd(Commands[keys[temp[i]]][0]);
        }
        winning = voteStor[i][1];
        return voteStor[i][1];
      }
    }
  }
}

function pingPongReset() {
  if (voting && foo<3) {
    if (Config.game=="tfall2") {
      generalCmd(Commands["reset"]);
    }
    else {
      sourceCmd(Commands["reset"]);
    }
    setTimeout(function(){
      pongPingReset()
    },3000);
    foo++;
  }
}

function pongPingReset() {
  if (voting && foo<3) {
    if (Config.game=="tfall2") {
      generalCmd(Commands["reset"]);
    }
    else {
      sourceCmd(Commands["reset"]);
    }
    setTimeout(function(){
      pingPongReset()
    },3000);
    foo++;
  }
}

// Reset all the variables
function reset() {
  temp=[];
  winning="";
  voteStor=[];
  tempCounting = [];
  votes1 = 0, votes2 = 0, votes3 = 0; // Vote counts
  foo=0;
  setTimeout(function(){
    pingPongReset()
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
    reset();
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
console.log("OBS Graphics Server Initialized: localhost:80");
// ------------------------------------------------------


Bot.on('join', () => {
  startVoting();
  Bot.on('message', chatter => {
    // Developer Commands
    if (chatter.username=="taskinoz" &&
       (chatter.message).split(" ")[0]=="!cmd" &&
       freeItem!="taskinoz") {
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
    if (Config.enableItems) {
      if (chatter.bits==Config.bitItemsAmount) {
        let x = (chatter.message).split("give ")[1];
        generalCmd(Items[x]);
      }
      if ((chatter.message).includes("!give") && chatter.username==freeItem) {
        let x = (chatter.message).split("give ")[1];
        generalCmd(Items[x]);
        freeItem="";
      }
      if ((chatter.message).includes("!claim") && freeItem=="") {
        freeItem=chatter.username;
        Bot.say(`${freeItem} use !give to give the streamer an item. Look at the items list https://github.com/taskinoz/titanfall-twitch-integration/blob/master/Items.md`);
      }
    }

  })
})

Bot.on('error', err => {
  console.log(err)
})
