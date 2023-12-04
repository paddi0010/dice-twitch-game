const tmi = require('tmi.js');
const config = require('./data/config.json');

const client = new tmi.Client({
    options: {
        debug: true
    },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: config.identify,
    channels: config.channels
});

const winNumber = Math.floor(Math.random() * 100) + 1;
let diceActive = false;
let attemps = 7;

client.on('message', (channel, userstate, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!dice start' && !diceActive) {
        diceActive = true;
        trys = 5;
        client.say(channel, 'Dice has been begun! Type a Number between 1 and 100 in the Chat! You have 5 Attemps!');
    }

    if (diceActive) {
        const type = parseInt(message);

        if (!isNaN(type) && type >= 1 && type <= 100) {
            if (type == winNumber) {
                client.say(channel, `${userstate['display-name']} has win the Dice! The Number was: ${winNumber}.`);
                diceActive = false;
            } else {
                const hint = type < winNumber ? 'Higher' : 'Lower';
                client.say(channel, `${userstate['display-name']}, ${hint} You have ${--attemps} Attemps.`);

                if (attemps === 0) {
                    client.say(channel, `You have spent all the attempts! The Number was ${winNumber}.`);
                    diceActive = false;
                }
            }
        }
    }
});


client.connect().catch(console.error);