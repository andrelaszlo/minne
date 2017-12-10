"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const google = require("googleapis");
const moment = require("moment");
const googleAuth = require("google-auth-library"); // https://stackoverflow.com/a/39415662/98057
const google_event_converter_1 = require("./google-event-converter");
const CLIENT_ID = '442132493927-qrp39t94cog9j2o9c2rn0djn6um8iv4q.apps.googleusercontent.com';
const CLIENT_SECRET = '9wJYogkqMVG_NIr-BFlt8q-t';
const REDIRECT_URL = 'https://calico-dev.firebaseapp.com/__/auth/handler'; // Not sure if needed
function importJob(db, userId, accessToken) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Running import job for user", userId);
        const auth = createAuth(accessToken);
        const calendars = yield listCalendars(auth);
        const importedEvents = [];
        for (const calendar of calendars) {
            const title = calendar.summary + (calendar.hidden ? " [hidden]" : "");
            console.log(`Listing events in ${title}`);
            const events = yield listEvents(auth, calendar.id);
            console.log(`Got ${events.length} events from ${title}`);
            importedEvents.concat(events);
        }
        console.log("importedEvents", importedEvents.length);
        yield saveEvents(db, userId, importedEvents);
        yield setImported(db, userId);
    });
}
exports.importJob = importJob;
function createAuth(accessToken) {
    const auth = new googleAuth();
    const oauth2Client = new auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    oauth2Client.credentials = {
        access_token: accessToken
    };
    return oauth2Client;
}
function listEvents(auth, id) {
    const calendar = google.calendar('v3');
    return new Promise((accept, reject) => {
        calendar.events.list({
            auth: auth,
            calendarId: id,
            timeMin: moment().subtract(1, 'month').toDate().toISOString(),
            timeMax: moment().add(2, 'years').toDate().toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        }, function (err, response) {
            if (err) {
                reject(err);
            }
            accept(response.items);
        });
    });
}
function listCalendars(auth) {
    const calendar = google.calendar('v3');
    return new Promise((resolve, reject) => {
        calendar.calendarList.list({
            auth: auth,
            //showHidden: true
            minAccessRole: 'owner'
        }, function (err, response) {
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
function saveEvents(db, userId, events) {
    return __awaiter(this, void 0, void 0, function* () {
        const convertConfig = { user: userId };
        for (const event of events) {
            try {
                const converted = google_event_converter_1.convert(convertConfig, event);
                console.log('Saving converted event', converted);
                yield db.collection('notes').add(converted);
            }
            catch (err) {
                console.warn('Error converting/saving event', err);
            }
        }
    });
}
function setImported(db, userId) {
    return db.collection('users').doc(userId).update({ importing: false });
}
//# sourceMappingURL=job-import.js.map