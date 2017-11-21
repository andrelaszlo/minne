const googleAuth = require('google-auth-library');
const google = require('googleapis');
const moment = require('moment');
const functions = require('firebase-functions');

var CLIENT_ID = '442132493927-qrp39t94cog9j2o9c2rn0djn6um8iv4q.apps.googleusercontent.com';
var CLIENT_SECRET = '9wJYogkqMVG_NIr-BFlt8q-t';
var REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed

function importJob(userId, accessToken) {
    console.log("Running import job for user", userId);

    let auth = createAuth(accessToken);
    let calendar = google.calendar('v3');

    listCalendars(auth);
}

function createAuth(accessToken) {
    var auth = new googleAuth();
    console.log("Creating auth", CLIENT_ID, CLIENT_SECRET, REDIRECT_URL, accessToken);
    var oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    oauth2Client.credentials = {
        access_token: accessToken
    };

    return oauth2Client;
}

function listEvents(auth, id, title) {
    var calendar = google.calendar('v3');
    calendar.events.list({
        auth: auth,
        calendarId: id,
        timeMin: moment().subtract(1, 'month').toDate().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err, id, title);
            return;
        }
        var events = response.items;
        if (events.length == 0) {
            console.log(title + ': No upcoming events found.');
        } else {
            console.log(title + ':');
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime || event.start.date;
                console.log('%s - %s', start, event.summary);
            }
        }
    });
}

function listCalendars(auth) {
    var calendar = google.calendar('v3');
    calendar.calendarList.list({
        auth: auth,
        //showHidden: true
        minAccessRole: 'owner'
    }, function(err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var calendars = response.items;
        if (calendars.length == 0) {
            console.log('No calendars found.');
        } else {
            console.log('Returned calendars:');
            for (var i = 0; i < calendars.length; i++) {
                var calendar = calendars[i];
                var title = calendar.summary + (calendar.hidden ? " [hidden]":"");
                listEvents(auth, calendar.id, title);
            }
        }
    });
}

module.exports = {
    handler: importJob
};