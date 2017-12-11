// Documentation and examples here:
// https://firebase.google.com/docs/firestore/extend-with-functions

const googleAuth = require('google-auth-library');
const google = require('googleapis');
const moment = require('moment');

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const importJob = require('./job-import');

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
      await importJob.handler(db, job.userId, job.payload.googleAccessToken);
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
}
