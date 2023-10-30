#!/bin/bash
# This script generates a new db migration script in the `migrations/` directory
if [ $# -eq 0 ];
then
  echo 'Requires a single argument as the migration title'
else
  if [ $# -gt 1 ];
  then
    echo 'Can only take one string argument.'
  else
    python -m alembic revision --autogenerate -m "$1"
    echo 'Success!'
    echo 'Now go to `migrations/` directory and update your migration script.'
    echo 'Then run `yarn db-upgrade` to upgrade the database.'
  fi
fi
