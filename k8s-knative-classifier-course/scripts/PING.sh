#!/usr/bin/env bash

export NAMESPACE=istio-system
export SERVICE_NAME=istio-ingressgateway
export APP_NAME=trigger-func
echo "Getting ingress ip address for istio in: ${NAMESPACE}"

export INGRESS_IP_ADDRESS=$(kubectl --namespace $NAMESPACE get service $SERVICE_NAME -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
export HOST_URL=$(kubectl get ksvc $APP_NAME -o=jsonpath='{.status.url}')

export FEEDBACK_CONTENT="This app is not working"

echo "expect 201"
curl -d "{\"feedback\":\"${FEEDBACK_CONTENT}\"}" \
  -H 'Content-Type: application/json' \
  -H "Host: ${HOST_URL}" \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}

echo ""
echo "expect 400"
curl -H 'Content-Type: application/json' \
  -H "Host: ${HOST_URL}" \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}
