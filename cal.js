var googleAuth = require('google-auth-library');
var google = require('googleapis');
var moment = require('moment');

var CLIENT_ID = '442132493927-qrp39t94cog9j2o9c2rn0djn6um8iv4q.apps.googleusercontent.com';
var CLIENT_SECRET = '9wJYogkqMVG_NIr-BFlt8q-t';
var REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed
//var API_KEY = 'AIzaSyB_I_6Tn2bVZLESe2BHC5aAtxuVv4qcL08';
//var CLIENT_SECRET = 'x0HHBrJ5EeYYtuiVWf5hBItv';
//var REDIRECT_URL = 'https://calico-fs-dev-aaf97.firebaseapp.com/__/auth/handler'; // Not sure if needed


id_token="ya29.GlwTBRef8IBZFh8wrdsp2kGVSWFzZckJxj42Iht57llZdTiZRLCQQWQddreNpwqiJEol5gS5dCz-8p9XtaZ2L3wLfhyri_-LDS1I5lxq33AfMuAyTdFlfn3NRM8x5w";

var auth = new googleAuth();

var oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
oauth2Client.credentials = {
  access_token: id_token
};

var calendar = google.calendar('v3');

function listEvents(auth, id, title) {
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
      //console.log(title + ': No upcoming events found.');
    } else {
      //console.log(title + ':');
      for (var i = 0; i < events.length; i++) {
        var event = events[i];
        var start = event.start.dateTime || event.start.date;
        //console.log('%s - %s', start, event.summary);
        console.log(JSON.stringify(event));
      }
    }
  });
}

function listCalendars(auth) {
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
      //console.log('Returned calendars:');
      for (var i = 0; i < calendars.length; i++) {
        var calendar = calendars[i];
        var title = calendar.summary + (calendar.hidden ? " [hidden]":"");
        listEvents(auth, calendar.id, title);
      }
    }
  });
}

//listEvents(oauth2Client);
listCalendars(oauth2Client);
