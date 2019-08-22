#!/bin/sh

if [ $# != 2 ] ; then
    echo "Usage:./build_native.sh resPath isRelease"
    exit 1
fi

resPath=$1
isRelease=$2

if [ -z "$isRelease" ]
then
	isRelease="false"
fi

npm install

cd ../src
ulimit -n 4096

if [ $isRelease == "false" ]
then
    echo "build js native debug version"
    browserify -d gameLoader.js > ../$resPath/gameLoader.js
    browserify -d main.js > ../$resPath/game.js
else
    echo "build js native release version"
    browserify -d gameLoader.js > ../$resPath/gameLoader_normal.js
    uglifyjs ../$resPath/gameLoader_normal.js > ../$resPath/gameLoader.js
    rm -r ../$resPath/gameLoader_normal.js

    browserify -d main.js > ../$resPath/game_normal.js
    uglifyjs ../$resPath/game_normal.js > ../$resPath/game.js
    rm -r ../$resPath/game_normal.js
fi