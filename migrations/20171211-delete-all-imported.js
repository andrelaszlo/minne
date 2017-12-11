/*
  Deletes all notes in the notes collection that have isImported == true.
*/

db = require('./firebase-connect');

var notes = db.collection('notes');

db.collection("notes")
  .where("isImported", "==", true)
  .get().then(snapshot => snapshot.forEach(doc => {
    doc.ref.delete()
      .then(() => console.log('Deleted imported event', doc.id))
      .catch(err => console.warn('Failed deleting', doc.id))
  }));
