echo "getting ingress ip address:"
export INGRESS_IP_ADDRESS=$(kubectl --namespace istio-system get service istio-ingressgateway -o=jsonpath='{.status.loadBalancer.ingress[0].ip}')

export FEEDBACK_CONTENT="This app is not working"

export TRIGGER_FUNC_NAME=""

echo "expect 201"

curl -d "{\"feedback\":\"${FEEDBACK_CONTENT}\"}" \
  -H 'Content-Type: application/json' \
  -H 'Host: trigger-func.default.example.com' \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}

echo ""
echo "expect 400"
curl -H 'Content-Type: application/json' \
  -H 'Host: trigger-func.default.example.com' \
  -s -o /dev/null -w "%{http_code}" \
  -X POST ${INGRESS_IP_ADDRESS}
