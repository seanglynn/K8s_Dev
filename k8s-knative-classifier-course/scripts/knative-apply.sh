#!/usr/bin/env bash

set -e
set -o pipefail

echo "1. Spinning up EKS instance with Istio"

export KGCP_VERSION=0.19.0
export KNATIVE_VERSION=${KGCP_VERSION}


#kubectl apply --filename https://github.com/knative/net-istio/releases/download/v${KNATIVE_VERSION}/istio.yaml
#kubectl apply --filename https://github.com/knative/net-istio/releases/download/v${KNATIVE_VERSION}/net-istio.yaml


kubectl apply --filename https://github.com/knative/serving/releases/download/v${KNATIVE_VERSION}/serving-crds.yaml
kubectl apply --filename https://github.com/knative/serving/releases/download/v${KNATIVE_VERSION}/serving-core.yaml

# DNS
kubectl apply --filename https://github.com/knative/serving/releases/download/v${KNATIVE_VERSION}/serving-default-domain.yaml

kubectl get pods --namespace knative-serving
