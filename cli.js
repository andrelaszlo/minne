#!/usr/bin/env node

const repl = require('repl');
const admin = require('firebase-admin');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

var db = admin.firestore();
var notes = db.collection('notes');
var users = db.collection('users');

console.log('Available variables:');
console.log('db - A firebase admin instance');
console.log('notes - The notes collection');
console.log('users - The users collection');

let repl_instance = repl.start('> ');
let context = repl_instance.context;
context.db = db;
context.notes = notes;
context.users = users;
