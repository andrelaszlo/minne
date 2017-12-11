const googleAuth = require('google-auth-library');
const google = require('googleapis');
const moment = require('moment');
const functions = require('firebase-functions');
const converter = require('./google-event-converter');

var CLIENT_ID = '***REMOVED***-qrp39t94cog9j2o9c2rn0djn6um8iv4***REMOVED***';
var CLIENT_SECRET = '***REMOVED***';
var REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed

async function importJob(db, userId, accessToken) {
  console.log("Running import job for user", userId);

  let auth = createAuth(accessToken);
  let calendar = google.calendar('v3');

  let calendars = await listCalendars(auth);

  let importedEvents = [];
  for (let calendar of calendars) {
    let title = calendar.summary + (calendar.hidden ? " [hidden]":"");
    console.log(`Listing events in ${title}`);
    let events = await listEvents(auth, calendar.id);
    console.log(`Got ${events.length} events from ${title}`);
    importedEvents.concat(events);
  }

  console.log("importedEvents", importedEvents.length);
  await saveEvents(db, userId, importedEvents);

  await setImported(db, userId);
}

function createAuth(accessToken) {
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  oauth2Client.credentials = {
    access_token: accessToken
  };

  return oauth2Client;
}

function listEvents(auth, id) {
  var calendar = google.calendar('v3');
  return new Promise((accept, reject) => {
    calendar.events.list({
      auth: auth,
      calendarId: id,
      timeMin: moment().subtract(1, 'month').toDate().toISOString(),
      timeMax: moment().add(2, 'years').toDate().toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    }, function(err, response) {
      if (err) {
        reject(err);
      }
      accept(response.items);
    });
  });
}

function listCalendars(auth) {
  var calendar = google.calendar('v3');
  return new Promise((resolve, reject) => {
    calendar.calendarList.list({
      auth: auth,
      //showHidden: true
      minAccessRole: 'owner'
    }, function(err, response) {
      if (err) {
        console.log('The API returned an error', err);
        reject(err);
      }
      var calendars = response.items;
      console.log(`Returned ${calendars.length} calendars`);
      resolve(calendars);
    });    
  });
}

async function saveEvents(db, userId, events) {
  var convertConfig = {user: userId};
  for (var event of events) {
    try {
      var converted = converter.convert(convertConfig, event);
      console.log('Saving converted event', converted);
      await db.collection('notes').add(converted);
    } catch (err) {
      console.warn('Error converting/saving event', err);
    }
  }
  console.log(`Imported ${count} events`);
}

function setImported(db, userId) {
  return db.collection('users').doc(userId).update({importing: false});
}

module.exports = {
  handler: importJob
};
