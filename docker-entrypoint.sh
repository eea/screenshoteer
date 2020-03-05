#!/bin/bash
REVISION=$(jq '.puppeteer.chromium_revision' node_modules/puppeteer/package.json |  tr -dc '0-9')
SANDBOX_PATH_CHR="node_modules/puppeteer/.local-chromium/linux-${REVISION}/chrome-linux"
cd ${SANDBOX_PATH_CHR}

cp chrome_sandbox chrome-sandbox
chown root:root chrome-sandbox
chmod 4755 chrome-sandbox

# copy sandbox executable to a shared location
# cp -p chrome-sandbox /usr/local/sbin/chrome-sandbox
