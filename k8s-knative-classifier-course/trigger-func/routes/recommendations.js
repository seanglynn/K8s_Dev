'use strict'

require('dotenv').config()

const express = require('express')
const router = express.Router()

const uid = require('uid');


// [START firestore_limit_to_last_query]
const {Firestore} = require('@google-cloud/firestore');

var admin = require("firebase-admin");

var serviceAccount = require("../sglynnbot-key.json");

// TODO - align svc accounts
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Imports the Google Cloud client library
const { PubSub, v1 } = require('@google-cloud/pubsub');

const projectId = process.env.PUBSUB_PROJECT_ID;// Your Google Cloud Platform project ID
const topicName = process.env.TOPIC_NAME; // Name for the new topic to create
const subscriptionName = process.env.SUBSCRIPTION_NAME; // Name for the new topic to create
// const subscriptionName = 'feedback-subscription'; // Name for the new subscription to create
console.log(`projectId: ${projectId}`);
console.log(`topicName: ${topicName}`);
console.log(`subscriptionName: ${subscriptionName}`);


// TODO - Init location
let pubSubClasifierSubscriberClient = new v1.SubscriberClient();
const pubSubClient = new PubSub({projectId});

const topic_name = process.env.TOPIC_NAME || 'topic_1';
// const topic =  pubSubClient.topic(topic_name);



async function getISOTimestamp() { 
    var isoDateTs = new Date().toISOString()
    console.debug(`Generated ts: ${isoDateTs}`)
    return isoDateTs
  }
  
  
  
  async function pushToTopic(topicName, message) { 
      // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
    const dataBuffer = Buffer.from(message.toString());
  
    var response = "";
    const pushTimestamp= await getISOTimestamp()
  
    try {
      const messageId = await pubSubClient.topic(topicName).publish(dataBuffer);
      response = `Message ${messageId} published at ${pushTimestamp}.`
      console.log(response);
    } catch (error) {
      console.error(`Received error while publishing: ${error.message}`);
      process.exitCode = 1;
    }
    // return response
  }
  
  // WARN - Creates new subscription instance each invocation
  async function createPubSubSubscription(subscriptionName) {
  
    // let topicSubscriptionName = subscriptionName + '-subsciption' + uid.toString()
    // console.log(`topicSubscriptionName: ${topicSubscriptionName}`)
  
    // Creates a subscription on that new topic
    // const [subscription] = topic.createSubscription(subscriptionName);
    const [subscription] =   await pubSubClient.topic(topicName).createSubscription(subscriptionName);
  
    console.log('subscription:')
    console.log(subscription.toString())
  
    return subscription
  
   }
  
  // WARN - Creates new subscription instance each invocation
  async function getPubSubSubscription(subscriptionName) {
  
    // let topicSubscriptionName = subscriptionName + '-subsciption' + uid.toString()
    // console.log(`topicSubscriptionName: ${topicSubscriptionName}`)
  
    // Creates a subscription on that new topic
    // const [subscription] = topic.createSubscription(subscriptionName);
    const subscription = await pubSubClient.subscription(subscriptionName);
  
    console.log('subscription:')
    console.log(subscription.toString())
  
    return subscription
  
   }
  
  
  async function consumeFromTopic(subscription) { 
    console.log(typeof(subscription))
    // Receive callbacks for new messages on the subscription
    await subscription.on('message', message => {
      console.log(`Message received: `);
      console.log(message.data.toString('utf8'));
    });
  
  }
  
  
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
  async function mapRecord(feedback) {
  
    var writeToDbIsoDate = new Date().toISOString()
  
    // TODO - Update rec
    const rec = {
      createdAt: writeToDbIsoDate,
      feedback: feedback,
      classified: true,
      classifiedAt: writeToDbIsoDate,
      sentimentScore: 0.0,
      sentimentMagnitude: 0.0,
    }
  
    return rec
  }
  
  async function writeFirebaseRecord(rec, uid) {
    // Obtain a document reference.
    const collection = process.env.COLLECTION_NAME
    // const document = firestore.doc(doc_ref);
  
    const docRef = db.collection(collection).doc(uid);
  
    console.log(`rec type: ${typeof(rec)}`)
    console.log(rec)
  
    console.log(`New data into the document: ${rec}`);
  
    // Enter new data into the document.
    await docRef.set(rec);
    console.log(`Written to FB`);
    return rec
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
  
  
  
  
  
  // ==============================
  // 2. PUBSUB FUNCTIONALITY START
  // ==============================
  
  // Publish message to GCP PubSub
  async function publish_message(message) {
  
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



router
  .get('/', async (req, res) => { 
    console.log('Trigger_func received a GET request.');
    res.send('<h3>Please start by posting valid recommendation json data</h3>')
  })

  .post('/', async (req, res, next) => { 
    // dont process if empty object posted
    if (Object.keys(req.body).length !== 0) { 

      let rec_body = req.body
      console.debug(`rec_body of type: ${typeof(rec_body)}. Value:`)
      console.debug(rec_body)

      let feedbackJson = rec_body.feedback;
      console.debug(`feedbackJson of type: ${typeof(feedbackJson)}. Value`)
      console.debug(feedbackJson)

      // Instance UID
      const instance_uid = uid.uid(16)

      // Map feedback to JSON record
      var rec = await mapRecord(feedbackJson)

      // Write out JSON record to FB
      const record = await writeFirebaseRecord( rec, instance_uid )

      // Get topic subscription - Consume & print messages to sdtout while running service
      var subscription = await getPubSubSubscription(subscriptionName) 
      // Tmp: to ensure messages are pushed to topic
      await consumeFromTopic(subscription);
    
      // Push to PubSub Topic
      await pushToTopic(topic_name, record);
      // console.debug(`pushToTopic: ${resp_msg} `);
      
      res.status(201).send(rec);
    //   res.send(feedbackJson)
    } else {
      res.send({'error': 'post request is empty'})
    }

  })
module.exports = router
