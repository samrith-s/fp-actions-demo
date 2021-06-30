#!/bin/bash

yarn cross-env NODE_ENV=\"production\" tsup src/$1.ts ${@:2}