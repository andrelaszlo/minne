/*
  Converts all dates to a UTC date object.
  Previously, dates were stored as strings with different tz info.
*/

db = require('./firebase-connect');
moment = require('moment');

var notes = db.collection('notes');

db.collection("notes").get().then(snapshot => snapshot.forEach(updateNote));

function updateNote(doc) {
  let note = doc.data();
  let noteRef = doc.ref;
  console.log("********************************************************************************");
  console.log(note);
  note['date'] = convertDate(note['date']);
  if (note['endDate']) {
    note['endDate'] = convertDate(note['endDate']);
  }
  console.log(note);
  doc.ref.update(note)
    .then(() => console.log('Updated!', doc.id))
    .catch(err => console.warn('Failed updating', doc.id, err))
}

function convertDate(datelike) {
  return moment(datelike).utc().toDate();
}
