#!/bin/sh -l

npm ci

GH_TOKEN=$GITHUB_TOKEN APP_NAME=Chronicler node ./action/adapter.js