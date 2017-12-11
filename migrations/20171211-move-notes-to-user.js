/*
  Moves all notes from the /notes collection to the correct /users/<user>/notes collection
 */

db = require('./firebase-connect');

var notes = db.collection('notes');
var users = db.collection('users');

notes.get().then(snapshot => snapshot.forEach(updateNote));

function updateNote(doc) {
  let note = doc.data();
  let docId = doc.id;
  let userId = note.user;
  if (!userId) {
    console.warn("Note without user id", docId, note);
    return;
  }
  let userRef = users.doc(userId);
  let userNotesCollection = userRef.collection('notes');
  userNotesCollection.doc(docId).set(note)
    .then(() => console.log(`Wrote ${docId} for ${userId}`));
}
