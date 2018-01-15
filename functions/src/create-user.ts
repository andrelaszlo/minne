export async function createUser(event) {
  const userId = event.params.userId;
  try {
    return event.data.ref.set({
      importing: false,
      imported: false
    }, {merge: true});
  } catch (err) {
    console.warn("Error creating user", err, userId);
  }
}
