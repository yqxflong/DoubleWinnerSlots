#!/bin/sh

if [ $# != 1 ] ; then
    echo "Usage:./build_fb.sh resPath"
    exit 1
fi

resPath=$1

npm install

cd ../src
ulimit -n 4096
browserify -d gameLoader.js > ../$resPath/gameLoader_normal.js
uglifyjs ../$resPath/gameLoader_normal.js > ../main.js
rm -r ../$resPath/gameLoader_normal.js

browserify -d main.js > ../$resPath/game_normal.js
uglifyjs ../$resPath/game_normal.js > ../$resPath/game.js
rm -r ../$resPath/game_normal.js

cd ..
rm -rf publish
frameworks/cocos2d-x/tools/cocos2d-console/bin/cocos compile -p web -m release

externalJsLen=`jq '.externalJsList|length' $resPath/resource_dirs.json`
for((i=0;i<externalJsLen;++i))
do
    jsName="jq -r .externalJsList|.[$i] $resPath/resource_dirs.json"
    jsRealName=`$jsName`
    echo $jsRealName
    rsync -av $jsRealName publish/html5/
done

rsync -av $resPath publish/html5/
rsync -av $resPath/images publish/html5/
rsync -av main.css publish/html5/
