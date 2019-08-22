#change the target file path by yourself 

if [ $# != 2 ] ; then
    echo "Usage:./js_configs_replace.sh resPath branch"
    exit 1
fi

resPath=$1
branch=$2

echo $resPath

debugAppId=`jq -r '.debugInfo.facebookAppId' ../$resPath/resource_dirs.json`
releaseAppId=`jq -r '.releaseInfo.facebookAppId' ../$resPath/resource_dirs.json`
debugVersion=`jq -r '.debugInfo.commonVersion' ../$resPath/resource_dirs.json`
releaseVersion=`jq -r '.releaseInfo.commonVersion' ../$resPath/resource_dirs.json`

echo $branch
if [ $branch == "LOCAL" ]
then
	sed  -e 's/'$releaseAppId'/'$debugAppId'/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/\"debugMode\" : 0,/\"debugMode\" : 1,/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/version: VersionStatus.VERSION_DEBUG/version: VersionStatus.VERSION_LOCAL/'  -i '' ../src/common/util/Config.js
	sed  -e 's/version: VersionStatus.VERSION_RELEASE/version: VersionStatus.VERSION_LOCAL/'  -i '' ../src/common/util/Config.js
	sed  -i '' '21,20 s/.*/    debugVersion: \"L'$debugVersion'\",/' ../src/common/util/Config.js
elif [ $branch == "DEBUG" ]
then
	sed  -e 's/'$releaseAppId'/'$debugAppId'/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/\"debugMode\" : 0,/\"debugMode\" : 1,/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/version: VersionStatus.VERSION_LOCAL/version: VersionStatus.VERSION_DEBUG/'  -i '' ../src/common/util/Config.js
	sed  -e 's/version: VersionStatus.VERSION_RELEASE/version: VersionStatus.VERSION_DEBUG/'  -i '' ../src/common/util/Config.js
	sed  -i '' '21,20 s/.*/    debugVersion: \"D'$debugVersion'\",/' ../src/common/util/Config.js
else
	sed  -e 's/'$debugAppId'/'$releaseAppId'/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/\"debugMode\" : 1,/\"debugMode\" : 0,/'  -i '' ../$resPath/flavor/project.json
	sed  -e 's/version: VersionStatus.VERSION_LOCAL/version: VersionStatus.VERSION_RELEASE/'  -i '' ../src/common/util/Config.js
	sed  -e 's/version: VersionStatus.VERSION_DEBUG/version: VersionStatus.VERSION_RELEASE/'  -i '' ../src/common/util/Config.js
	sed  -i '' '22,21 s/.*/    releaseVersion: \"'$releaseVersion'\",/' ../src/common/util/Config.js
fi

