#!/bin/bash

yarn cross-env NODE_ENV=\"production\" tsup ${@:1}