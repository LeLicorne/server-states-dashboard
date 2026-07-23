#!/usr/bin/env bash
set -euo pipefail

# ---- config (adjust once, then never touch again) ----
ZBX_URL="http://localhost:8080/api_jsonrpc.php"
ZBX_USER="Admin"
ZBX_PASS="zabbix"          # default Zabbix admin pass
HOST_NAME="Zabbix server"
TEMPLATE_NAME="Linux by Zabbix agent"
CPU_KEY="system.cpu.util"
MEM_KEY="vm.memory.util"
AGENT_INTERFACE_IP="zabbix-agent"

jrpc() { curl -s -X POST "$ZBX_URL" -H 'Content-Type: application/json-rpc' -d "$1"; }
jrpc_auth() { curl -s -X POST "$ZBX_URL" -H 'Content-Type: application/json-rpc' -H "Authorization: Bearer $2" -d "$1"; }

echo "==> Starting Zabbix stack"
docker compose up -d postgres zabbix-server zabbix-web zabbix-agent

echo "==> Waiting for Zabbix API"
until jrpc '{"jsonrpc":"2.0","method":"apiinfo.version","params":{},"id":1}' | grep -q '"result"'; do sleep 3; done

echo "==> Disabling forced password change (blocks API login on first boot)"
until docker exec zabbix-postgres pg_isready -U zabbix >/dev/null 2>&1; do sleep 2; done
docker exec zabbix-postgres psql -U zabbix -d zabbix -c \
  "UPDATE users SET passwd_change_required = 0 WHERE username = '${ZBX_USER}';" >/dev/null 2>&1 || true

echo "==> Logging in"
AUTH=""
for i in $(seq 1 20); do
  AUTH=$(jrpc '{"jsonrpc":"2.0","method":"user.login","params":{"username":"'"$ZBX_USER"'","password":"'"$ZBX_PASS"'"},"id":1}' | jq -r '.result // empty')
  [ -n "$AUTH" ] && break
  sleep 3
done
[ -n "$AUTH" ] || { echo "Login failed"; exit 1; }

echo "==> Creating/reusing API token"
USERID=$(jrpc_auth '{"jsonrpc":"2.0","method":"user.get","params":{"filter":{"username":["'"$ZBX_USER"'"]}},"id":1}' "$AUTH" | jq -r '.result[0].userid')

TOKEN_ID=$(jrpc_auth '{"jsonrpc":"2.0","method":"token.get","params":{"filter":{"name":["site-frontend"]}},"id":1}' "$AUTH" | jq -r '.result[0].tokenid // empty')
if [ -z "$TOKEN_ID" ]; then
  TOKEN_ID=$(jrpc_auth '{"jsonrpc":"2.0","method":"token.create","params":{"name":"site-frontend","userid":"'"$USERID"'"},"id":1}' "$AUTH" | jq -r '.result.tokenid')
  API_TOKEN=$(jrpc_auth '{"jsonrpc":"2.0","method":"token.generate","params":["'"$TOKEN_ID"'"],"id":1}' "$AUTH" | jq -r '.result[0].token')
else
  # token already exists but the secret can't be re-fetched: regenerate it
  API_TOKEN=$(jrpc_auth '{"jsonrpc":"2.0","method":"token.generate","params":["'"$TOKEN_ID"'"],"id":1}' "$AUTH" | jq -r '.result[0].token')
fi

echo "==> Ensuring host + template exist"
GROUPID=$(jrpc_auth '{"jsonrpc":"2.0","method":"hostgroup.get","params":{"filter":{"name":["Zabbix servers"]}},"id":1}' "$AUTH" | jq -r '.result[0].groupid')
TEMPLATEID=$(jrpc_auth '{"jsonrpc":"2.0","method":"template.get","params":{"filter":{"host":["'"$TEMPLATE_NAME"'"]}},"id":1}' "$AUTH" | jq -r '.result[0].templateid')

HOSTID=$(jrpc_auth '{"jsonrpc":"2.0","method":"host.get","params":{"filter":{"host":["'"$HOST_NAME"'"]}},"id":1}' "$AUTH" | jq -r '.result[0].hostid // empty')
if [ -z "$HOSTID" ]; then
  HOSTID=$(jrpc_auth '{
    "jsonrpc":"2.0","method":"host.create",
    "params":{
      "host":"'"$HOST_NAME"'",
      "interfaces":[{"type":1,"main":1,"useip":0,"ip":"","dns":"'"$AGENT_INTERFACE_IP"'","port":"10050"}],
      "groups":[{"groupid":"'"$GROUPID"'"}],
      "templates":[{"templateid":"'"$TEMPLATEID"'"}]
    },"id":1}' "$AUTH" | jq -r '.result.hostids[0]')
fi

echo "==> Waiting for CPU/memory items to be created from template"
CPU_ID="" MEM_ID=""
for i in $(seq 1 20); do
  ITEMS=$(jrpc_auth '{"jsonrpc":"2.0","method":"item.get","params":{"hostids":["'"$HOSTID"'"],"output":["itemid","key_"]},"id":1}' "$AUTH")
  CPU_ID=$(echo "$ITEMS" | jq -r '.result[] | select(.key_ | startswith("'"$CPU_KEY"'")) | .itemid' | head -n1)
  MEM_ID=$(echo "$ITEMS" | jq -r '.result[] | select(.key_ | startswith("'"$MEM_KEY"'")) | .itemid' | head -n1)
  [ -n "$CPU_ID" ] && [ -n "$MEM_ID" ] && break
  sleep 3
done
[ -n "$CPU_ID" ] && [ -n "$MEM_ID" ] || { echo "CPU/memory items not found — check CPU_KEY/MEM_KEY/TEMPLATE_NAME"; exit 1; }

echo "==> Writing .env"
touch .env
grep -v '^VITE_ZABBIX_' .env > .env.tmp || true
cat >> .env.tmp <<EOF
VITE_ZABBIX_API_URL=${ZBX_URL}
VITE_ZABBIX_API_TOKEN=${API_TOKEN}
VITE_ZABBIX_CPU_ITEM_ID=${CPU_ID}
VITE_ZABBIX_MEMORY_ITEM_ID=${MEM_ID}
EOF
mv .env.tmp .env

echo "==> Checking Firebase env vars"
set -a; source .env; set +a
MISSING=""
for v in VITE_FIREBASE_API_KEY VITE_FIREBASE_AUTH_DOMAIN VITE_FIREBASE_PROJECT_ID VITE_FIREBASE_STORAGE_BUCKET VITE_FIREBASE_MESSAGING_SENDER_ID VITE_FIREBASE_APP_ID; do
  val="${!v:-}"
  [ -z "$val" ] && MISSING="$MISSING $v"
done
if [ -n "$MISSING" ]; then
  echo "ERROR: missing/empty Firebase vars in .env:$MISSING"
  echo "Add them to .env (no quotes) then re-run."
  exit 1
fi

echo "==> Building/starting site"
docker compose up -d --build site

echo "==> Done"