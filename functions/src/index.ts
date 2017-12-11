import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import { importJob } from './job-import';

admin.initializeApp(functions.config().firebase);

const db = admin.firestore();

exports.handleJob = functions.firestore
  .document('jobs/{jobId}')
  .onCreate(handleJob);

/*
  Note:
  It's very important to return or otherwise handle (eg await) any promises in the handler.
  Otherwise, the function might time out before it's actually finished.
*/

async function handleJob(event) {
  const job = event.data.data();
  const userId = job.userId;
  const jobId = event.params.jobId;

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
}
