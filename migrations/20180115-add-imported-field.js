/*
   Adds the imported: false field to existing users
*/

db = require('./firebase-connect');

var notes = db.collection('users');

notes.get().then(snapshot => snapshot.forEach(updateUser));

function updateUser(doc) {
  let user = doc.data();
  let userRef = doc.ref;
  let dirty = false;
  console.log("********************************************************************************");
  console.log(user);
  if (typeof user['imported'] == 'undefined') {
    user['imported'] = false;
    dirty = true;
  }
  if (dirty) {
    console.log(user);
    doc.ref.update(user)
      .then(() => console.log('Updated!', doc.id))
      .catch(err => console.warn('Failed updating', doc.id, err));
  } else {
    console.log('Skipping user', doc.id);
  }
}
