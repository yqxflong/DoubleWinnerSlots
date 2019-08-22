#!/bin/sh

if [ $# != 1 ] ; then
    echo "Usage:./build_native_alpha.sh resPath"
    exit 1
fi

resPath=$1

npm install

cd ../src
ulimit -n 4096
browserify -d gameLoader.js > ../$resPath/gameLoader.js

browserify -d main.js > ../$resPath/game.js
