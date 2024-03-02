const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
var admin = require("firebase-admin");

require('dotenv').config()

initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.SERVICEACCOUNT)),
});

const db = getFirestore();

module.exports = db
