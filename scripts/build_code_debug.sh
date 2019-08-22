#!/bin/sh

resPath=res

npm install
cd ../src
ulimit -n 4096
browserify -d gameLoader.js > ../$resPath/gameLoader.js

browserify -d main.js > ../$resPath/game.js
