#!/bin/bash

yarn cross-env NODE_ENV=\"development\" tsup ${@:1}