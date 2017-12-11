
import * as google from 'googleapis';
import * as moment from 'moment';
import googleAuth = require('google-auth-library'); // https://stackoverflow.com/a/39415662/98057
import { OAuth2Client } from 'google-auth-library/types/lib/auth/oauth2client';

import { convert } from './google-event-converter';

const CLIENT_ID = '442132493927-qrp39t94cog9j2o9c2rn0djn6um8iv4q.apps.googleusercontent.com';
const CLIENT_SECRET = '9wJYogkqMVG_NIr-BFlt8q-t';
const REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed

export async function importJob(db, userId, accessToken): Promise<any> {
  console.log("Running import job for user", userId);

  const auth = createAuth(accessToken);
  let calendars;
  try {
    calendars = await listCalendars(auth);
  } catch (err) {
    console.warn();
    return setImported(db, userId);
  }

  const importedEvents = [];
  for (const calendar of calendars) {
    const title = calendar.summary + (calendar.hidden ? " [hidden]":"");
    console.log(`Listing events in ${title}`);
    try {
      const events = await listEvents(auth, calendar.id);
      console.log(`Got ${events.length} events from ${title}`);
      importedEvents.push(...events);
    } catch (err) {
      console.warn(`Error listing events in ${title}`, err);
    }
  }

  console.log(`Imported ${importedEvents.length} events`);
  try {
    await saveEvents(db, userId, importedEvents);
  } catch (err) {
    console.warn(`Error saving ${importedEvents.length} events`);
  }

  return setImported(db, userId);
}

function createAuth(accessToken): OAuth2Client {
  const auth = new googleAuth();
  const oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  oauth2Client.credentials = {
    access_token: accessToken
  };

  return oauth2Client;
}

function listEvents(auth, id): Promise<any[]> {
  const calendar = google.calendar('v3');
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

function listCalendars(auth): Promise<any[]> {
  const calendar = google.calendar('v3');
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
      const calendars = response.items;
      console.log(`Returned ${calendars.length} calendars`);
      resolve(calendars);
    });    
  });
}

async function saveEvents(db, userId, events: any[]): Promise<any> {
  console.log(`Starting save of ${events.length} events`);
  const convertConfig = {user: userId};
  for (const event of events) {
    try {
      const converted = convert(convertConfig, event);
      await db.collection('notes').add(converted);
    } catch (err) {
      console.warn('Error converting/saving event', err);
    }
  }
}

function setImported(db, userId): Promise<any> {
  return db.collection('users').doc(userId).update({importing: false});
}
