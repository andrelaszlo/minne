import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as google from 'googleapis';
import * as moment from 'moment';
import googleAuth = require('google-auth-library'); // https://stackoverflow.com/a/39415662/98057

import { importJob } from './job-import';

// Create and Deploy Cloud Function with TypeScript using script that is
// defined in functions/package.json:
//    cd functions
//    npm run deploy
export const helloWorld = functions.https.onRequest((request, response) => {
 response.send('Hello from Firebase!\n\n');
});



admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

exports.handleJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(handleJob);

async function handleJob(event) {
  var job = event.data.data();
  var userId = job.userId;
  var jobId = event.params.jobId;

  if (!userId) {
    console.error("Unknown user id", job);
    return;
  }

  try {
    switch(job.type) {
    case "import":
      await importJob(db, job.userId, job.payload.googleAccessToken);
      break;
    default:
      console.log("Unknown job type", job.type);
      break;
    }
  } catch (err) {
    console.warn("Error executing job handler", err, job);
  }
  
  await removeJobData(jobId, event.data);
}

async function removeJobData(jobId, data) {
  console.log("Deleting job", jobId);
  await data.ref.delete();
