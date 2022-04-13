#!/usr/bin/env bash

set -euo pipefail

.buildkite/scripts/bootstrap.sh

source .buildkite/scripts/steps/artifacts/env.sh

echo "--- Build Kibana artifacts"
node scripts/build --all-platforms --debug --docker-cross-compile $(echo "$BUILD_ARGS")

echo "--- Extract default i18n messages"
mkdir -p target/i18n
node scripts/i18n_extract

echo "--- Build and upload dependencies report"
node scripts/licenses_csv_report "--csv=target/dependencies-$FULL_VERSION.csv"
cd target
sha512sum "dependencies-$FULL_VERSION.csv" > "dependencies-$FULL_VERSION.csv.sha512.txt"
buildkite-agent artifact upload "*"
cd -
