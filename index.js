const Discord = require('discord.js');
const getJSON = require('get-json');
const ScoreBoarToken = "MzIxNDU5ODM0NjAxOTk2Mjg5.DBj69w.JHpPTKHS6mevYwy-BveTFYX_Z9Y";
const TwitchClientID = "?client_id=mhibg0lk11ectdzd623yk520uds404";
const TwitchAPI = "https://api.twitch.tv/kraken/streams/";
const SmashggAPI = "https://api.smash.gg/";
const phaseGroup = "phase_group/"
const proBracket = "379962?expand[]=sets&expand[]=standings&expand[]=seeds"
const ScoreBoar = new Discord.Client();
var channelNames = ["qldmelee", "KPKaiza", "MelbourneMelee", "PerthSmash", "ACTsmash", "downsmashed"];

var qldislive = false;

// Stores Score Boar start up time
var startTime = new Date();
var startDate = startTime.getDate();
var startMonth = startTime.getMonth()+1;
var startYear = startTime.getFullYear();
var startHour = startTime.getHours();
var startMinutes = startTime.getMinutes();
var startSeconds = startTime.getSeconds();

ScoreBoar.login(ScoreBoarToken); 

// Ready
ScoreBoar.on("ready", () => {
    console.log("Score Boar is now active...");
    let channel = 288713692533751818;
//    ScoreBoar.send("pong!");
});

//channel.send('288713692533751818', 'test');

// ScoreBoar.sendMessage('288713692533751818', 'test');

// Display start time and end time on program termination
process.on('SIGINT', function() {
    var endTime = new Date();
    var endDate = endTime.getDate();
    var endMonth = endTime.getMonth()+1;
    var endYear = endTime.getFullYear();
    var endHour = endTime.getHours();
    var endMinutes = endTime.getMinutes();
    var endSeconds = endTime.getSeconds();
    console.log("Score Boar is dead. RIP Score Boar ("  + startDate + "/" + startMonth + '/' + startYear + ' ' + startHour + ':'+ startMinutes + ':' + startSeconds + ' - ' + endDate + "/" + endMonth + '/' + endYear + ' ' + endHour + ':'+ endMinutes + ':' + endSeconds + ")");
    process.exit();
});

// Automatically deletes messages after 24 hours
ScoreBoar.on("message", function(message) {
    setTimeout(function() {
        message.delete(message)
    }, 86400000);
});

/*

// Automatically posts when an Australian Melee twitch channel goes live.
ScoreBoar.on("message", function(message) {
    for (let i = 0; i < channelNames.length; i++) { 
        getJSON(TwitchAPI+channelNames[i]+TwitchClientID, function(error, response) {
            if (response.stream != null) {                  
                if (qldislive == false) {            
                    message.channel.send(channelNames[i] + ' is currently live');
                    ScoreBoar.on('ready', () => {
              //          ScoreBoar.setStreaming('Super Smash Bros. Melee', 'https://www.twitch.tv/qldmelee', 1);
                    });
                }
                qldislive = true;
            } else {
                qldislive = false;
            }
        });
    }
});

*/

// !Live command that itterates through channelNames array and prints whether stream is currently live or not
// Example usage: !Live
ScoreBoar.on("message", function(message) {
    if (message.content === "!Live") {
        for (let i = 0; i < channelNames.length; i++) { 
            getJSON(TwitchAPI+channelNames[i]+TwitchClientID, function(error, response) {
                if (response.stream == null) {                  
                    message.channel.send(channelNames[i] + ' is currently not live');
                } else {
                    message.channel.send(channelNames[i] + ' is currently live');
                }
            });
        }
    }
});

// !bracket command to set smashgg/challonge bracket link used to access the API
// Example usage: !bracket smash.gg/tournament/uq-smash-33/
ScoreBoar.on("message", function(message) {
    if (message.content.startsWith("!bracket")) {
    let args = message.content.split(' ').slice(0);
    let bracketLink = args[1];
    message.reply(`Bracket link has been set to: ` + bracketLink); 
    }
});

// List all players entered in bracket
// Example usage: !GetPlayers
ScoreBoar.on("message", function(message) {
    if (message.content === "!GetPlayers") {
        getJSON(SmashggAPI+phaseGroup+proBracket, function(error, response) {
            let entrants = response.entities.seeds;
            for (let i = 0; i < entrants.length; i++) { 
                let entrantID = response.entities.seeds[i].entrantId;
                let participantID = response.entities.seeds[i].mutations.entrants[entrantID].participantIds;
                let playerID = response.entities.seeds[i].mutations.participants[participantID].playerId;
                let seed = response.entities.seeds[i].seedNum;
                let gamerTag = response.entities.seeds[i].mutations.entrants[entrantID].name;
                let firstName = response.entities.seeds[i].mutations.participants[participantID].contactInfo.nameFirst
                let lastName = response.entities.seeds[i].mutations.participants[participantID].contactInfo.nameLast;
                let countryOrigin = response.entities.seeds[i].mutations.players[playerID].country;          
                message.channel.send(`entrantID is: ` + playerID);
                message.channel.send('ParticipantID is: ' + participantID)
                // Current Power Rankings as of 12/06/2017
                if (gamerTag == "smopup"  || gamerTag == "Syke" || gamerTag == "AussieRob" || gamerTag == "Kami" || gamerTag == "Niko" || gamerTag == "Auro" || gamerTag == "JediLink" || gamerTag == "Russell") {
                    message.channel.send ('Player Name is: ' + gamerTag + ' [PR] ' + ', seeded: ' + seed);
                } else {
                    message.channel.send ('Player Name is: ' + gamerTag + ' , seeded: ' + seed);
                }   
                message.channel.send(gamerTag + ` is ` + firstName + ' ' + lastName + ' and they are from ' + countryOrigin);
                message.channel.send('---------------------------------------------------');
             }
        });
    }
});

// Get player specific info
// Example usage: !PlayerInfo 2
ScoreBoar.on("message", function(message) {
    if (message.content.startsWith("!PlayerInfo")) {
        let args = message.content.split (' ').slice(0);
        getJSON(SmashggAPI+phaseGroup+proBracket, function(error, response) {
            if(isNaN(args[1])){
                // Do nothing as a number was not entered
            } else {
                let x = args[1]-1;
                let currentPlayer = response.entities.seeds[x].entrantId;
                message.reply('Player Name is: ' + (response.entities.seeds[x].mutations.entrants[currentPlayer].name)); 
            }
        });
    }
});

// Prints standings after the bracket has completed
// Example usage: !Results
ScoreBoar.on("message", function(message) {
    if (message.content === "!Results") {
        getJSON(SmashggAPI+phaseGroup+proBracket, function(error, response) {
            let entrants = response.entities.seeds;
            let gamerTag = "";
            for (let i = 0; i < entrants.length; i++) { 
                let entrantID = response.entities.standings[i].entrantId;
                for (let x = 0; x < entrants.length; x++) {  
                    if (entrantID == response.entities.seeds[x].entrantId) {
                        gamerTag = response.entities.seeds[x].mutations.entrants[entrantID].name;
                    } 
                }
                let placement = response.entities.standings[i].placement;
                var j = placement % 10,
                    k = placement % 100;
                if (j == 1 && k != 11) {
                  message.channel.send(placement + 'st ' + gamerTag);
                } else if (j == 2 && k != 12) {
                  message.channel.send(placement + 'nd ' + gamerTag);
                } else if (j == 3 && k != 13) {
                  message.channel.send(placement + 'rd ' + gamerTag);
                } else {
                  message.channel.send(placement + 'th ' + gamerTag);
                }
             }
        });
    }
});

// List all sets played in bracket
// Example usage: !GetSets
ScoreBoar.on("message", function(message) {
    if (message.content === "!GetSets") {
        getJSON(SmashggAPI+phaseGroup+proBracket, function(error, response) {
            let entrants = response.entities.seeds;
            let sets = response.entities.sets;
            for (let i = 0; i < sets.length; i++) { 
                let setID = response.entities.sets[i].id;
                let player1Id = response.entities.sets[i].entrant1Id;
                let player2Id = response.entities.sets[i].entrant2Id;
                let player1Score = response.entities.sets[i].entrant1Score;
                let player2Score = response.entities.sets[i].entrant2Score;
                let winner = response.entities.sets[i].winnerId;
                let loser = response.entities.sets[i].loserId;
                
                let player1Tag = "";
                for (let x = 0; x < entrants.length; x++) {  
                    if (player1Id == response.entities.seeds[x].entrantId) {
                        player1Tag = response.entities.seeds[x].mutations.entrants[player1Id].name;
                    } 
                }

                let player2Tag = "";
                for (let x = 0; x < entrants.length; x++) {  
                    if (player2Id == response.entities.seeds[x].entrantId) {
                        player2Tag = response.entities.seeds[x].mutations.entrants[player2Id].name;
                    } 
                }

                if (player2Id != null) {
                    message.channel.send(`set: ` + i);
                    message.channel.send(`set ID is: ` + setID);
                    message.channel.send('Player 1 ID is: ' + player1Id + ' and is ' + player1Tag);
                    message.channel.send('Player 2 ID is: ' + player2Id + ' and is ' + player2Tag);
                    
                    if (winner == player1Id) {
                        message.channel.send('Score was: ' + player1Score + " - " + player2Score);
                        message.channel.send('Winner was: ' + player1Tag + '  Loser was: ' + player2Tag);
                    } else {
                        message.channel.send('Score was: ' + player2Score + " - " + player1Score);
                        message.channel.send('Winner was: ' + player2Tag + '  Loser was: ' + player1Tag);
                    }

                    message.channel.send('---------------------------------------------------');
                }
             }
        });
    }
});

// player1 vs player2 is now live 
// add 2 emoji reaction here to support players

// Get events in tournament
// Example usage: !events
ScoreBoar.on("message", function(message) {
    if (message.content === "!events") {

        const eventExpander = "?expand[]=event&expand[]=phase?expand[]=groups"; // Add on expand to end or url
        const phaseExpander = "?expand[]=phase&expand[]=groups";
        const smashggAPI = "https://api.smash.gg/"
        var bracket = "https://smash.gg/tournament/uq-smash-33"; // Replace with whatever user sets with !bracket
        var eventExpanded = bracket+eventExpander; 
        var eventReplaced = eventExpanded.replace(/.*gg\//g,smashggAPI); // replaces https://smash.gg/ with https://api.smash.gg/
        var finalLinks = [];
        let x = 0;

        getJSON(eventReplaced, function(error, response) {
            let eventArray = response.entities.event;
            for (let i = 0; i < eventArray.length; i++) { 
                let game = response.entities.event[i].videogameId;
                if (game == "1") {
                    let event = response.entities.event[i].name;
    //                message.channel.send('Event Id: ' + response.entities.event[i].id);
    //                message.channel.send('Tournament Id is: ' + response.entities.event[i].tournamentId);                                        
    //                message.channel.send('Event is: ' + event);
    //                message.channel.send('url: ' + response.entities.event[i].slug); // Gives us event URL we need    
    //                message.channel.send('test link: ' + eventReplaced);
                    let getPhase = smashggAPI + response.entities.event[i].slug + phaseExpander;
    //                message.channel.send('Link to get phase: ' + getPhase);         

                    // Get phases and phase id's
                     getJSON(getPhase, function(error, response) {
                        let phaseArray = response.entities.phase;
                        var totalGroups = response.entities.groups.length;
                        x = 0; // Reset x (index) upon phase changing
                        message.channel.send(event + ' contains ' + phaseArray.length + ' phase(s).');
                        for (let j = 0; j < phaseArray.length; j++) {
                                let phaseGroups = response.entities.phase[j].groupCount;
    //                            message.channel.send('groupCount is: ' + phaseGroups);
                                for (let k = 0; k < totalGroups-(totalGroups-phaseGroups); k++) {
    //                                message.channel.send('k is ' + k + ' x is ' + x);
                                    message.channel.send(response.entities.phase[j].name + ' - group id ' + k + ' is ' + response.entities.groups[x].id);
                                    let finalBracketLink = getPhase.replace(/tournament.*/g, 'phase_group/' + response.entities.groups[x].id + '?expand[]=sets&expand[]=standings&expand[]=seeds');
                                    finalLinks.push(finalBracketLink); 
                                    message.channel.send('Bracket with phase id: ' + finalBracketLink);
                                    x++;
                                }
                        }
                     });
    //                message.channel.send('---------------------------------------------------');
                }
            }
        });
    }
});

/*
for (let z = 0; z < 5; z++) {
    console.log();
}
*/