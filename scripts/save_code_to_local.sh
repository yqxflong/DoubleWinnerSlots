# save game.js code file to local

if [ $# != 2 ] ; then
    echo "Usage:./save_code_to_local.sh resPath isRelease"
    exit 1
fi

resPath=$1
isRelease=$2

echo "--SaveToLocal------------------------"

versionName=""
saveFolder=""

if [ $isRelease == "false" ]
then
    versionName=`jq -r '.debugInfo.commonVersion' ../$resPath/resource_dirs.json`
    saveFolder=savedVersionCode/debug
else
    versionName=`jq -r '.releaseInfo.commonVersion' ../$resPath/resource_dirs.json`
    saveFolder=savedVersionCode/release
fi

savePath=../$saveFolder/$versionName
rm -rf $savePath
mkdir $savePath

rsync -av ../$resPath/game.js $savePath"/"
rsync -av ../$resPath/gameLoader.js $savePath"/"