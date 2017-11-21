// Documentation and examples here:
// https://firebase.google.com/docs/firestore/extend-with-functions

const googleAuth = require('google-auth-library');
const google = require('googleapis');
const moment = require('moment');

const functions = require('firebase-functions');
const importJob = require('./job-import');

exports.handleJob = functions.firestore
    .document('jobs/{jobId}')
    .onCreate(event => {
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
                importJob.handler(job.userId, job.payload.googleAccessToken);
                break;
                default:
                console.log("Unknown job type", job.type);
                break;
            }
        } catch (err) {
            console.warn("Error executing job handler", err, job);
        }

        return removeJobData(jobId, event.data);
    });

function removeJobData(jobId, data) {
    console.log("Deleting job", jobId);
    return data.ref.delete();
}