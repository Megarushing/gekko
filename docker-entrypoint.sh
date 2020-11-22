#!/bin/bash

cp -rn /usr/src/node_modules /usr/src/app/node_modules
cp -rn /usr/src/node_modules_exchange /usr/src/app/exchange/node_modules

sed -i 's/127.0.0.1/0.0.0.0/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/localhost/'${HOST}'/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/3000/'${PORT}'/g' /usr/src/app/web/vue/dist/UIconfig.js
if [[ "${USE_SSL:-0}" == "1" ]] ; then
    sed -i 's/ssl: false/ssl: true/g' /usr/src/app/web/vue/dist/UIconfig.js
fi
#tail -f /usr/src/app/web/vue/dist/UIconfig.js
exec node gekko "$@"

