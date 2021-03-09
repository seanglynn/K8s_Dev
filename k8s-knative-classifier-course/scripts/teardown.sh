#!/usr/bin/env bash

echo "preparing..."
export GCLOUD_PROJECT=$(gcloud config get-value project)
export INSTANCE_REGION=us-central1
export INSTANCE_ZONE=us-central1-a
export PROJECT_NAME=istio
export CLUSTER_NAME=${PROJECT_NAME}-cluster
export CONTAINER_NAME=${PROJECT_NAME}-container

echo "setup"
gcloud config set compute/zone ${INSTANCE_ZONE}

echo "cleanup istio"
export ISTIO_VERSION=1.0.0
kubectl delete -f istio-${ISTIO_VERSION}/install/kubernetes/helm/istio/templates/crds.yaml -n istio-system
rm istio-${ISTIO_VERSION} -rf

echo "remove cluster"
gcloud container clusters delete ${CLUSTER_NAME} --quiet
gcloud container clusters list

echo "cleanup files"
rm $(helm home) -rf
rm ca.* tiller.* helm.* istio.*
rm mtls-go-example -rf
rm httpbin.example.com -rf

echo "teardown complete"