#!/usr/bin/env bash
# Deploys Cloud Functions in small batches instead of all at once.
#
# A change anywhere in functions/ changes every function's source hash, so a plain
# `firebase deploy --only functions` updates all ~60 functions in parallel — which runs into
# Google Cloud's per-project limit on function updates and fails a random set of them.
# Batches of BATCH_SIZE with a pause in between stay under that limit; a failed batch is
# retried once. A final full `deploy --only functions` then skips everything already up to
# date ("No changes detected"), retries anything still failing, and keeps the full deploy's
# handling of functions removed from the code. Its exit status is the job's.
set -uo pipefail

PROJECT="${PROJECT:?PROJECT is required}"
BATCH_SIZE="${BATCH_SIZE:-10}"
PAUSE="${PAUSE:-30}"
FIREBASE=(npx --yes firebase-tools@latest)

mapfile -t NAMES < <(cd functions && GCLOUD_PROJECT="$PROJECT" node -e "
  const f = require('./index.js');
  Object.keys(f).filter(k => typeof f[k] === 'function').forEach(k => console.log(k));
")
if [ "${#NAMES[@]}" -eq 0 ]; then echo "::error::No functions found in functions/index.js"; exit 1; fi
echo "Deploying ${#NAMES[@]} functions in batches of $BATCH_SIZE"

failed=()
for ((i = 0; i < ${#NAMES[@]}; i += BATCH_SIZE)); do
  batch=("${NAMES[@]:i:BATCH_SIZE}")
  only=$(printf 'functions:%s,' "${batch[@]}"); only="${only%,}"
  n=$((i / BATCH_SIZE + 1))
  echo "::group::Batch $n: ${batch[*]}"
  if ! "${FIREBASE[@]}" deploy --only "$only" --project "$PROJECT" --non-interactive; then
    echo "Batch $n failed — retrying once in 60s"
    sleep 60
    "${FIREBASE[@]}" deploy --only "$only" --project "$PROJECT" --non-interactive || failed+=("batch $n")
  fi
  echo "::endgroup::"
  [ $((i + BATCH_SIZE)) -lt ${#NAMES[@]} ] && sleep "$PAUSE"
done

[ ${#failed[@]} -gt 0 ] && echo "::warning::Still failing after retry: ${failed[*]} — the final full deploy retries them"
echo "::group::Final full functions deploy (skips unchanged functions)"
"${FIREBASE[@]}" deploy --only functions --project "$PROJECT" --non-interactive
status=$?
echo "::endgroup::"
exit $status
