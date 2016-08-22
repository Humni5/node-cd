#!/bin/bash

# Enable special handling to prevent expansion to a
# literal '/tmp/backup/*' when no matches are found.
shopt -s nullglob

REPOSITORIES=(*)

#this is the name of the repository
name=$1

for i in "${arrayName[@]}"
do:
    if [$i = ${name}]
    then
        bash ./${name}/build.sh
    fi
done
