#!/usr/bin/env bash

set -e
set -o pipefail

# create/delete
action=$1

export TOPIC_1=feedback-created
export TOPIC_2=feedback-classified

gcloud pubsub topics $action $TOPIC_1
gcloud pubsub topics $action $TOPIC_2