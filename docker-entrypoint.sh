#!/bin/bash 

set -e

function do_exit() {
  echo "Exiting ..."
  echo "Done."
}

trap do_exit SIGTERM SIGINT SIGHUP


# If DEVELOPMENT is set (and non-empty), run Vite’s preview server
if [ -n "${DEVELOPMENT}" ]; then
  echo "🛠️  DEVELOPMENT mode: starting Vite preview…"
  npm run preview &
else
  echo "🚀  PRODUCTION mode: starting Express server…"
  # path to your compiled server entrypoint
  npm run serve &
fi


sleep infinity &
wait $!
