'use strict';

const express = require('express');
const uid = require('uid');
const app = express();
// import { uid } from 'uid';

// [START firestore_limit_to_last_query]
const {Firestore} = require('@google-cloud/firestore');

const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});


// Imports the Google Cloud client library
const {PubSub} = require('@google-cloud/pubsub');
projectId = 'your-project-id', // Your Google Cloud Platform project ID
topicName = 'my-topic', // Name for the new topic to create
subscriptionName = 'my-sub' // Name for the new subscription to create



// constpubsub = require('@google-cloud/pubsub')({
//   // Set pubsub project ID
//   projectId: process.env.PUBSUB_PROJECT_ID
// });


// TODO - Probably not the safest but for now
const db = admin.firestore();

// // Create a new client
// const firestore = new Firestore();

// ==============================
// 1. WRITE TO FIREBASE
// ==============================
async function mapRecord() {

  var writeToDbIsoDate = new Date().toISOString()

  // TODO - Update rec
  const rec = {
    createdAt: writeToDbIsoDate,
    feedback: 'It was alright yeah',
    classified: true,
    classifiedAt: writeToDbIsoDate,
    sentimentScore: 0.0,
    sentimentMagnitude: 0.0,
  }
}

async function writeFirebaseRecord(uid) {
  // Obtain a document reference.
  const collection = process.env.COLLECTION_NAME
  const document = firestore.doc(doc_ref);

  const docRef = db.collection(collection).doc(uid);

  await docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
  });


  var rec = await mapRecord()

  console.log(`New data into the document: ${rec}`);

  // Enter new data into the document.
  await document.set(docRef);
  console.log(`Written to FB`);

}

async function upsertFirebaseRecord(doc_ref, updated_record) {
  // Obtain a document reference.
  // const doc_ref = process.env.FIREBASE_DOC_REF
  const document = firestore.doc(doc_ref);


  //TODO:
  // var rec = mapRecord(updated_record)
  var rec = await mapRecord()
  console.log(`New data into the document: ${rec}`);

  // Enter new data into the document.
  await document.set(rec);
  console.log(`Written to FB`);

}



async function deleteFirebaseRecord(document) {
  // Delete the document.
  await document.delete();
  console.log('Deleted the document');
}
async function updateFirebaseRecord(document, message) {
    // Update an existing document.
    await document.update({
      body: message,
    });
    console.log('Updated an existing document');
  
}
async function readFirebaseRecord(document) {
    // Read the document.
    const doc = await document.get();
    console.log('Read the document');
  
}



// Write to Firebase instance
writeFirebaseRecord( uid(16) )


// ==============================
// 2. PUBSUB FUNCTIONALITY START
// ==============================

// Publish message to GCP PubSub
async function publish_message(projectId, subscriptionName, message) {

  const pubsub = new PubSub({projectId});

  const topic_name = process.env.TOPIC_NAME || 'topic_1';
  const topic = await pubsub.topic(topic_name);

  // Creates a subscription on that new topic
  const [subscription] = await topic.createSubscription(subscriptionName);
  // Receive callbacks for new messages on the subscription
  subscription.on('message', message => {
    console.log('Received message:', message.data.toString());
    process.exit(0);
  });

    // // Receive callbacks for errors on the subscription
    // subscription.on('error', error => {
    //   console.error('Received error:', error);
    //   process.exit(1);
    // });
  
    // // Send a message to the topic
    // topic.publish(Buffer.from('Test message!'));  


  // const message = 'Hello world!'

  topic.publish(message).then((data) => {
    const messageId = data[0][0];
    console.log(`Message was published with ID: ${messageId}`);
  });
}
// ==================================
// 2. PUBSUB FUNCTIONALITY END
// ==================================


// ================================
// 3. EXPRESS APP FUNCTIONALITY START
// ================================

//TODO - Handle invalid requests
//TODO - Security++

// GET Svc
app.get('/', (req, res) => {
  console.log('Trigger_func received a request.');

  const target = process.env.TARGET || 'World';
  res.send(`${target}!\n`);
});
// POST Svc
app.post('/', (req, res) => {
  console.log('Trigger_func received a request.');

  const target = process.env.TARGET || 'World';
  res.send(`${target}!\n`);
});
// Run App
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Trigger_func listening on port', port);
});
// ================================
// 3. EXPRESS APP FUNCTIONALITY END
// ================================
