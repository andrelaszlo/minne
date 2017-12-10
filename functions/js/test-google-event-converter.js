'use strict';
const fs = require('fs');
const gec = require('./google-event-converter');

var events = JSON.parse(fs.readFileSync('events.json', 'utf8'));

let config = {
    user: "gcc2LArFDhcZSzOzPwWtds58z6l1"
}

for (let i in events) {
    let event = events[i];
    let converted = gec.convert(config, event);
    console.log("Event " + i);
    console.log(converted);
}
