#!/usr/bin/env bash
#change the target file path by yourself

androidDir=common_android
iosDir=common_ios

outputfile=assets_config/project.manifest
manifestPath=assets_config
engineVersion=3.6
blackListExt=("manifest" "svn" "DS_Store")

if [ $# != 3 ] ; then
    echo "Usage:./gen_res_md5_client.sh resPath isAndroid isRelease"
    exit 1
fi

resPath=$1
isAndroid=$2
isRelease=$3

if [ $isRelease == true ]
then
    packageUrl=`jq -r '.releaseInfo.packageUrl' ../$resPath/resource_dirs.json`
    version=`jq -r '.releaseInfo.nativeVersion' ../$resPath/resource_dirs.json`
else
    packageUrl=`jq -r '.debugInfo.packageUrl' ../$resPath/resource_dirs.json`
    version=`jq -r '.debugInfo.nativeVersion' ../$resPath/resource_dirs.json`
fi

resourceFiles=()
if [ $isAndroid == true ]
then
    androidLen=`jq '.androidDirs|length' ../$resPath/resource_dirs.json`
        for((i=0;i<$androidLen;++i))
        do
            dirCmd="jq -r .androidDirs|.[$i] ../$resPath/resource_dirs.json"
            dirName=`$dirCmd`
            resourceFiles=("${resourceFiles[@]}" $dirName)
        done
    platformDir=$androidDir
else
    iosLen=`jq '.iosDirs|length' ../$resPath/resource_dirs.json`
    for((i=0;i<$iosLen;++i))
    do
        dirCmd="jq -r .iosDirs|.[$i] ../$resPath/resource_dirs.json"
        dirName=`$dirCmd`
        resourceFiles=("${resourceFiles[@]}" $dirName)
    done
    platformDir=$iosDir
fi


cd ../$resPath
outputDir=${PWD}/assets_config
rm -rf $outputDir
mkdir $outputDir

outputfile=${PWD}/$outputfile
echo $outputfile
rm -rf $outputfile
touch $outputfile


calMd5() {
    file=$1
    for ext in ${blackListExt[@]}
    do
        if [ ${file##*.} = $ext ]
        then
            return
        fi
    done


    if [ $isFirst == true ]
    then
        isFirst=false
    else
        echo "," >> $outputfile
    fi

    if [[ ${PWD} =~ "$resPath/" ]]
    then
    echo "\"${PWD##*$resPath/}/$file\" : {" >>  $outputfile
    else
    echo "\"$file\" : {" >>  $outputfile
    fi
    md5Str=`openssl md5 $file`
    echo "\"md5\" : \"${md5Str#*= }\"" >> $outputfile
    #echo "\"compressed\" : false" >> $outputfile
    echo "}" >> $outputfile
}

loopDir() {
    for file in find *
    do
    if [ -d $file ]
    then
    cd ./$file
    loopDir
    cd ..


    elif [ -f $file ]
    then
    calMd5 $file
    fi
    done
}


# Release the resource array to js file.
echo "{" >> $outputfile
echo "\"packageUrl\" : \"$packageUrl/$resPath\"," >> $outputfile
echo "\"remoteManifestUrl\" : \"$packageUrl/$manifestPath/$platformDir/project.manifest\"," >> $outputfile
echo "\"remoteVersionUrl\" : \"$packageUrl/$manifestPath/$platformDir/version.manifest\"," >> $outputfile
echo "\"version\" : \"$version\"," >> $outputfile
echo "\"engineVersion\" : \"$engineVersion\", " >> $outputfile
echo "\"assets\" : {" >> $outputfile
resDir=${PWD}
isFirst=true
for fileName in ${resourceFiles[@]} 
do
    fullFile=$resDir/$fileName
    if [ -f $fullFile ]
    then
        calMd5 $fileName
    elif [ -d $fullFile ]
    then
        cd $fullFile
        loopDir
        cd ..
    fi
done
echo "}," >> $outputfile
echo "\"searchPaths\" : [" >> $outputfile
echo "\"$path/\"" >> $outputfile
echo "]" >> $outputfile
echo "}" >> $outputfile

echo "gen_res_md5_client.sh copy to original resource dir."
fromResPath=`jq -r '.resPath' ../$resPath/resource_dirs.json`
rsync -av $manifestPath ../$fromResPath/

echo "Finish."
