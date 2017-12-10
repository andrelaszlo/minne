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
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const job_import_1 = require("./job-import");
// Create and Deploy Cloud Function with TypeScript using script that is
// defined in functions/package.json:
//    cd functions
//    npm run deploy
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send('Hello from Firebase!\n\n');
});
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
exports.handleJob = functions.firestore
    .document('jobs/{jobId}')
    .onCreate(handleJob);
function handleJob(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = event.data.data();
        const userId = job.userId;
        const jobId = event.params.jobId;
        if (!userId) {
            console.error("Unknown user id", job);
            return;
        }
        try {
            switch (job.type) {
                case "import":
                    yield job_import_1.importJob(db, job.userId, job.payload.googleAccessToken);
                    break;
                default:
                    console.log("Unknown job type", job.type);
                    break;
            }
        }
        catch (err) {
            console.warn("Error executing job handler", err, job);
        }
        yield removeJobData(jobId, event.data);
    });
}
function removeJobData(jobId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Deleting job", jobId);
        yield data.ref.delete();
    });
}
//# sourceMappingURL=index.js.map