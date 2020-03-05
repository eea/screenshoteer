#!/bin/bash
REVISION=$(jq '.puppeteer.chromium_revision' node_modules/puppeteer/package.json |  tr -dc '0-9')
SANDBOX_PATH_CHR="node_modules/puppeteer/.local-chromium/linux-${REVISION}/chrome-linux"
cd ${SANDBOX_PATH_CHR}

chown root:root chrome_sandbox
chmod 4755 chrome_sandbox
# copy sandbox executable to a shared location
cp -p chrome_sandbox /usr/local/sbin/chrome-devel-sandbox
# export CHROME_DEVEL_SANDBOX env variable
export CHROME_DEVEL_SANDBOX="/usr/local/sbin/chrome-devel-sandbox"
echo "EXPORTED"
