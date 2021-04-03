#!/bin/bash

export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/sglynnbot-key.json"
gcloud auth activate-service-account sglynnbot@k8s-knative-classifier-306811.iam.gserviceaccount.com --key-file=./sglynnbot-key.json
