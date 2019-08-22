#!/bin/sh

if [ $# != 2 ] ; then
    echo "Usage:./build_fb_alpha.sh resPath branch"
    exit 1
fi

resPath=$1
branch=$2

releaseFBId=`jq -r '.releaseInfo.facebookAppId' ../$resPath/resource_dirs.json`
debugFBId=`jq -r '.debugInfo.facebookAppId' ../$resPath/resource_dirs.json`

sed  -e 's/\"debugMode\" : 0,/\"debugMode\" : 1,/'  -i '' ../project.json
sed  -e 's/'$releaseFBId'/'$debugFBId'/'  -i '' ../project.json

npm install

cd ../src
ulimit -n 4096

browserify -d gameLoader.js > ../main.js
browserify -d main.js > ../$resPath/game.js

cd ..

if [ $branch != "LOCAL" ]
then
    rm -rf publish
    frameworks/cocos2d-x/tools/cocos2d-console/bin/cocos compile -p web -m release
fi

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
