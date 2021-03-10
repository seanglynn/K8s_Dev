/bin/bash

export NAMESPACE=istio-system
export SERVICE_NAME=istio-ingressgateway
echo "Getting ingress ip address for istio in: ${NAMESPACE}:"

export INGRESS_IP_ADDRESS=$(kubectl --namespace $NAMESPACE get service $SERVICE_NAME -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')
#export INGRESS_IP_ADDRESS=$(kubectl --namespace istio-system get service istio-ingressgateway -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')

export FEEDBACK_CONTENT="This app is not working"

export TRIGGER_FUNC_NAME=""

echo "expect 201"

# TODO Host assignment
curl -d "{\"feedback\":\"${FEEDBACK_CONTENT}\"}" \
  -H 'Content-Type: application/json' \
  -H 'Host: http://helloworld-nodejs.default.example.com/' \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}

echo ""
echo "expect 400"
curl -H 'Content-Type: application/json' \
  -H 'Host: http://helloworld-nodejs.default.example.com/' \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}
