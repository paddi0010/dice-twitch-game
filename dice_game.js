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
let attempts = 7;
let lastGameTime = 0;
const cooldownDuration = 60000; // 1 minute cooldown

client.on('message', (channel, userstate, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!dice start' && !diceActive) {
        const currentTime = Date.now();

        if (currentTime - lastGameTime >= cooldownDuration) {
            lastGameTime = currentTime;
            attempts = 5;
            diceActive = true;
            client.say(channel, 'Dice has been begun! Type a Number between 1 and 100 in the Chat! You have 5 Attempts!');
        } else {
            const remainingCooldown = Math.ceil((cooldownDuration - (currentTime - lastGameTime)) / 1000);
            client.say(channel, `Please wait ${remainingCooldown} seconds before starting a new game.`);
        }
    }

    if (message.toLowerCase() === '!dice stop' && diceActive) {
        client.say(channel, 'Dice game has been stopped.');
        diceActive = false;
        attempts = 7;
    }

    if (diceActive) {
        const type = parseInt(message);

        if (!isNaN(type) && Number.isInteger(type) && type >= 1 && type <= 100) {
            if (type === winNumber) {
                client.say(channel, `${userstate['display-name']} has won the Dice! The Number was: ${winNumber}.`);
                diceActive = false;
            } else {
                const hint = type < winNumber ? 'Higher' : 'Lower';
                client.say(channel, `${userstate['display-name']}, ${hint}. You have ${--attempts} attempts remaining.`);

                if (attempts === 0) {
                    client.say(channel, `You have spent all the attempts! The Number was ${winNumber}.`);
                    diceActive = false;
                }
            }
        }
    }
});

client.connect().catch(console.error);
