#!/bin/bash

yarn cross-env NODE_ENV="development" tsup src/$1.ts ${@:2}