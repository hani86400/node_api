#!/usr/bin/env bash
#######################################################################
# source api_test.sh             [ 2025_11_08 ] #
#######################################################################

# Strict mode so failures actually FAIL.
set -Eeuo pipefail

# If any command errors, show line number
trap 'fail "Test failed at line $LINENO"' ERR






#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
# [begin] _EXPORT
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
THIS_SCRIPT='api_test.sh'
LOG_FILE='/tmp/api_test.log'

BASE_URL=${BASE_URL:-"http://localhost:3000"}
API_TOKEN=${API_TOKEN:-"12345"}     # must match your server env
CURL=(curl -fsS -H "Authorization: Bearer ${API_TOKEN}" -H "Content-Type: application/json")


# [end  ] _EXPORT ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#


#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#
# [begin] _ALIAS
#~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

# [end  ] _ALIAS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~#

# Pretty output helpers
pass() { echo -e "\n✅ $*"; }
fail() { echo -e "❌ $*" >&2; exit 1; }


#######################################################################
# f u n c t i o n                                      [ 2025_11_08 ] #
                  test123(){
# $1: ARG_1 (required - filename)
# $2: ARG_2 (optional)
#######################################################################
echo '1'
} # f u n c t i o n [END] #############################################


# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# : [initialize] 
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
echo -e "\n$(date +%Y_%m_%d_%H_%M_%S)  BEGIN: ${THIS_SCRIPT} " | tee -a ${LOG_FILE}


# Ensure jq exists (we want real JSON checks)
command -v jq >/dev/null || fail "jq is required. Install it: sudo dnf/apt install jq"

# Optional: wait for server to be up (tries 10x)
for i in {1..10}; do
  if "${CURL[@]}" -X GET "${BASE_URL}/api/v1/request-info?type=json" >/dev/null 2>&1; then
    pass "Server is up"
    break
  fi
  sleep 0.3
  [[ $i -eq 10 ]] && fail "Server did not respond at ${BASE_URL}"
done
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
#
#
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# : [ M A I N ] 
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

echo -e "\e[1;93m[Running basic API sanity checks...]\e[0m\n"

T_ENDPOINT='/'
T_NAME='Root (/)'
echo -e "\n\e[1;95mTesting endpoint: [${T_NAME}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"

T_ENDPOINT='/health'
T_NAME='Health (/health)'
echo -e "\n\e[1;95mTesting endpoint: [${T_NAME}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" | jq && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"


T_ENDPOINT='/api/v1/request-info'
T_NAME='(/api/v1/request-info)'
echo -e "\n\e[1;95mTesting endpoint: [${T_NAME}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" | jq && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"


T_ENDPOINT='/api/v1/squares/perimeter?side=5&unit=cm'
T_NAME="${T_ENDPOINT}"
echo -e "\n\e[1;95mTesting endpoint: [${BASE_URL}${T_ENDPOINT}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" | jq && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"

T_ENDPOINT='/api/v1/squares/area?side=5&unit=cm'
T_NAME="${T_ENDPOINT}"
echo -e "\n\e[1;95mTesting endpoint: [${BASE_URL}${T_ENDPOINT}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" | jq && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"


T_ENDPOINT='/api/v1/squares/area'
T_NAME="${T_ENDPOINT}"
T_PAYLOAD='{"side":6,"unit":"cm"}'
echo -e "\n\e[1;95mTesting endpoint: POST [${BASE_URL}${T_ENDPOINT} -d ${T_PAYLOAD}]\e[0m"
"${CURL[@]}" -X POST "${BASE_URL}${T_ENDPOINT}" -d "${T_PAYLOAD}" | jq && pass "Testing endpoint: POST  [${T_NAME}] OK" || fail "Testing endpoint: POST [${T_NAME}] FAIL"


T_ENDPOINT='/api/v1/commands/least-used'
T_NAME="${T_ENDPOINT}"
echo -e "\n\e[1;95mTesting endpoint: [${BASE_URL}${T_ENDPOINT}]\e[0m"
"${CURL[@]}" -X GET "${BASE_URL}${T_ENDPOINT}" | jq && pass "Testing endpoint: [${T_NAME}] OK" || fail "Testing endpoint: [${T_NAME}] FAIL"

T_ENDPOINT='/api/v1/commands'
T_NAME="${T_ENDPOINT}"
T_PAYLOAD='{"C":"ip a","R":"Show IPs","D":"2025-11-08","V":3}' 
echo -e "\n\e[1;95mTesting endpoint: POST [${BASE_URL}${T_ENDPOINT} -d ${T_PAYLOAD}]\e[0m"
"${CURL[@]}" -X POST "${BASE_URL}${T_ENDPOINT}" -d "${T_PAYLOAD}" | jq && pass "Testing endpoint: POST  [${T_NAME}] OK" || fail "Testing endpoint: POST [${T_NAME}] FAIL"






#echo -e "\e[1;90m[black_90]\e[0m" echo -e "\e[1;91m[red_91]\e[0m" echo -e "\e[1;92m[green_92]\e[0m" echo -e "\e[1;93m[yellow_93]\e[0m" echo -e "\e[1;94m[blue_94]\e[0m" echo -e "\e[1;95m[purble_95]\e[0m" echo -e "\e[1;96m[cyan_96]\e[0m" echo -e "\e[1;97m[white_97]\e[0m"
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
# : [finalize] 
# :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
echo -e "\n$(date +%Y_%m_%d_%H_%M_%S)    END: ${THIS_SCRIPT} " | tee -a ${LOG_FILE}