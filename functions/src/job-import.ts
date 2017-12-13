
import * as google from 'googleapis';
import * as moment from 'moment';
import googleAuth = require('google-auth-library'); // https://stackoverflow.com/a/39415662/98057
import { OAuth2Client } from 'google-auth-library/types/lib/auth/oauth2client';

import { convert } from './google-event-converter';

const CLIENT_ID = '***REMOVED***-qrp39t94cog9j2o9c2rn0djn6um8iv4***REMOVED***';
const CLIENT_SECRET = '***REMOVED***';
const REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed

const ID_PREFIX = 'gcal';

export async function importJob(db, userId, accessToken): Promise<any> {
  console.log("Running import job for user", userId, accessToken);

  const auth = createAuth(accessToken);
  let calendars;

  try {
    calendars = await listCalendars(auth);
  } catch (err) {
    console.warn("Error listing calendars", err);
    return setImported(db, userId, 'Sorry! Could not list your calendars, try signing out and signing in again.');
  }

  const importedEvents = [];
  const importedTitles = [];
  const failedTitles = [];
  for (const calendar of calendars) {
    const title = calendar.summary + (calendar.hidden ? " [hidden]":"");
    console.log(`Listing events in ${title}`);
    try {
      const events = await listEvents(auth, calendar.id);
      console.log(`Got ${events.length} events from ${title}`);
      importedEvents.push(...events);
      importedTitles.push(title);
    } catch (err) {
      console.warn(`Error listing events in ${title}`, err);
      failedTitles.push(title);
    }
  }

  console.log(`Imported ${importedEvents.length} events`);
  try {
    await saveEvents(db, userId, importedEvents);
  } catch (err) {
    console.warn(`Error saving ${importedEvents.length} events`);
  }

  let msg = `Your calendars were imported! Imported ${importedEvents.length} events
             from ${importedTitles.join(', ')}.`;
  if (failedTitles.length) {
    msg = `The import was partially successful. These calendars failed: ${failedTitles.join(', ')}.
           Imported ${importedEvents.length} events from ${importedTitles.join(', ')}.`;
  }
  return setImported(db, userId, msg);
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
        return reject(err);
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
        return reject(err);
      }
      const calendars = response.items;
      console.log(`Returned ${calendars.length} calendars`);
      resolve(calendars);
    });
  });
}

async function saveEvents(db, userId, events: any[]): Promise<any> {
  console.log(`Starting save of ${events.length} events for user ${userId}`);
  for (const event of events) {
    try {
      const converted = convert(userId, event);
      const docId = `${ID_PREFIX}:${userId}:${converted._googleEvent.id}`;
      await db.collection('users').doc(userId).collection('notes').doc(docId).set(converted, {merge: true});
    } catch (err) {
      console.warn('Error converting/saving event', err, event);
    }
  }
}

async function setImported(db, userId, msg?: string): Promise<any> {
  const userRef = db.collection('users').doc(userId);
  if (msg) {
    userRef.update({importStatus: msg});
  }
  await userRef.update({importing: false});
}