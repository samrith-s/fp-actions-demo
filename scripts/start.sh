#!/bin/bash

export FOLDER=${1:-'src/index'}
yarn node $FOLDER/dist/index.js ${@:2}