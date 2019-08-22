#!/usr/bin/env bash

manifestPath=assets_config
engineVersion=3.6
slotAudioPath_ios=slot_mp3/slots
slotAudioPath_android=slot_ogg/slots
subjectTmplPath=config/subject_tmpl_list

if [ $# != 2 ] ; then
    echo "Usage:./gen_res_md5_server.sh resPath isRelease"
    exit 1
fi
resPath=$1
isRelease=$2

if [ $isRelease == true ]
then
    packageUrl=`jq -r '.releaseInfo.packageUrl' ../$resPath/resource_dirs.json`
    commonVersion=`jq -r '.releaseInfo.commonVersion' ../$resPath/resource_dirs.json`
    chapterVersion=`jq -r '.releaseInfo.chapterVersion' ../$resPath/resource_dirs.json`
    versionName=`jq -r '.releaseInfo.versionName' ../$resPath/resource_dirs.json`
else
    packageUrl=`jq -r '.debugInfo.packageUrl' ../$resPath/resource_dirs.json`
    commonVersion=`jq -r '.debugInfo.commonVersion' ../$resPath/resource_dirs.json`
    chapterVersion=`jq -r '.debugInfo.chapterVersion' ../$resPath/resource_dirs.json`
    versionName=`jq -r '.debugInfo.versionName' ../$resPath/resource_dirs.json`
fi

androidCommonResourceFiles=()
iosCommonResourceFiles=()
chapterResourceFiles=()
magicWorldLevels=()
magicWorldAudios=()
blackListExt=("manifest" "svn" "DS_Store")

androidLen=`jq -r '.androidDirs|length' ../$resPath/resource_dirs.json`
for ((i=0;i<$androidLen;++i))
do
    dirCmd="jq -r .androidDirs|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    #echo $dirName
    androidCommonResourceFiles=("${androidCommonResourceFiles[@]}" $dirName)
done

iosLen=`jq '.iosDirs|length' ../$resPath/resource_dirs.json`
for((i=0;i<$iosLen;++i))
do
    dirCmd="jq -r .iosDirs|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    iosCommonResourceFiles=("${iosCommonResourceFiles[@]}" $dirName)
done

chapterLen=`jq '.chapterDirs|length' ../$resPath/resource_dirs.json`
for((i=0;i<$chapterLen;++i))
do
    dirCmd="jq -r .chapterDirs|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    chapterResourceFiles=("${chapterResourceFiles[@]}" $dirName)
done

magicWorldLevelLen=`jq '.magic_world|length' ../$resPath/resource_dirs.json`
for((i=0;i<$magicWorldLevelLen;++i))
do
    dirCmd="jq -r .magic_world|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    magicWorldLevels=("${magicWorldLevels[@]}" $dirName)
done

magicWorldAudioLen=`jq '.magic_world_audio|length' ../$resPath/resource_dirs.json`
for((i=0;i<$magicWorldAudioLen;++i))
do
    dirCmd="jq -r .magic_world_audio|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    magicWorldAudios=("${magicWorldAudios[@]}" $dirName)
done


cd ..

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

echoFile() {
    outputDir=$1
    outputfile=$outputDir/"project.manifest"
    rm -rf $outputfile
    touch $outputfile
    local chapterDir=$2
    # Release the resource array to js file.
    isFirst=true
    echo "{" >> $outputfile
    echo "\"packageUrl\" : \"$packageUrl/$versionName/$resPath\"," >> $outputfile
    echo "\"remoteManifestUrl\" : \"$packageUrl/$manifestPath/$chapterDir""project.manifest\"," >> $outputfile
    echo "\"remoteVersionUrl\" : \"$packageUrl/$manifestPath/$chapterDir""version.manifest\"," >> $outputfile
    echo "\"version\" : \"$nowVersion\"," >> $outputfile
    echo "\"engineVersion\" : \"$engineVersion\", " >> $outputfile
    echo "\"assets\" : {" >> $outputfile
    resDir=${PWD}
    for fileName in ${nowResourceFile[@]} 
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
    # ls -lah |sed 's/.$//' $outputfile
    # echo `sed 's/.$//' $outputfile` >> $outputfile
    # nawk '{sub(/.$/, "")};1' >> $outputfile
    # sed 's/.$//' $outputfile
    echo "}," >> $outputfile
    echo "\"searchPaths\" : [" >> $outputfile
    echo "]" >> $outputfile
    echo "}" >> $outputfile
}

versionFile() {
    outputDir=$1
    outputfile=$outputDir/"version.manifest"
    rm -rf $outputfile
    touch $outputfile
    local chapterDir=$2
    # Release the resource array to js file.
    echo "{" >> $outputfile
    echo "\"packageUrl\" : \"$packageUrl/$versionName/$resPath\"," >> $outputfile
    echo "\"remoteManifestUrl\" : \"$packageUrl/$manifestPath/$chapterDir""project.manifest\"," >> $outputfile
    echo "\"remoteVersionUrl\" : \"$packageUrl/$manifestPath/$chapterDir""version.manifest\"," >> $outputfile
    echo "\"version\" : \"$nowVersion\"," >> $outputfile
    echo "\"engineVersion\" : \"$engineVersion\", " >> $outputfile
    echo "\"assets\" : {" >> $outputfile
    echo "}," >> $outputfile
    echo "\"searchPaths\" : [" >> $outputfile
    echo "]" >> $outputfile
    echo "}" >> $outputfile
}

platformEcho()  {
    isAndroid=$1
    if [ $isAndroid == true ]
    then
        platformDir="common_android"
        nowResourceFile=${androidCommonResourceFiles[@]}
    else
        platformDir="common_ios"
        nowResourceFile=${iosCommonResourceFiles[@]}
    fi


    platformManifestDir=$commonManifestDir/$platformDir
    echo $platformManifestDir
    rm -rf $platformManifestDir
    mkdir $platformManifestDir
    echoFile $platformManifestDir $platformDir"/"
    versionFile $platformManifestDir $platformDir"/"
}


nowVersion=$commonVersion
rootResDir=${PWD}
cd $rootResDir/$resPath
#echo common resource
commonManifestDir=$rootResDir/$manifestPath
rm -rf $commonManifestDir
mkdir $commonManifestDir
commonManifestDir=$commonManifestDir/$resPath

rm -rf $commonManifestDir
mkdir $commonManifestDir
echo "commonManifestDir"$commonManifestDir
platformEcho true
platformEcho false

nowVersion=$chapterVersion
#echo chapter resource
for chapterDir in ${chapterResourceFiles[@]}
do
    cd $rootResDir/$resPath
    chapterManifestDir=$rootResDir/$manifestPath/$resPath/$chapterDir"_ios"
    rm -rf $chapterManifestDir
    mkdir $chapterManifestDir
    nowResourceFile=()
    nowResourceFile=("${nowResourceFile[@]}" $chapterDir)
    nowResourceFile=("${nowResourceFile[@]}" $slotAudioPath_ios/$chapterDir)
    echoFile $chapterManifestDir $chapterDir"_ios/"
    versionFile $chapterManifestDir $chapterDir"_ios/"
done


#echo chapter resource for android platform
for chapterDir in ${chapterResourceFiles[@]}
do
    cd $rootResDir/$resPath
    chapterManifestDir=$rootResDir/$manifestPath/$resPath/$chapterDir"_android"
    rm -rf $chapterManifestDir
    mkdir $chapterManifestDir
    nowResourceFile=()
    nowResourceFile=("${nowResourceFile[@]}" $chapterDir)
    nowResourceFile=("${nowResourceFile[@]}" $slotAudioPath_android/$chapterDir)
    echoFile $chapterManifestDir $chapterDir"_android/"
    versionFile $chapterManifestDir $chapterDir"_android/"
done



#echo magic world resource for iOS platform
for magicWorldLevel in ${magicWorldLevels[@]}
do
    cd $rootResDir/$resPath
    levelName=magic_world
    levelFolderName=$levelName"_"$magicWorldLevel"_ios"
    levelDir=$rootResDir/$manifestPath/$resPath/$levelFolderName
    rm -rf $levelDir
    mkdir $levelDir

    nowResourceFile=($levelName/"common")

    tmplJsonFile="subject_tmpl_$magicWorldLevel.json"
    levelResFolderLen=`jq '.client.reelDirs|length' ../$resPath/config/subject_tmpl_list/$tmplJsonFile`
    for((i=0;i<$levelResFolderLen;++i))
    do
        dirCmd="jq -r .client.reelDirs|.[$i] ../$resPath/config/subject_tmpl_list/$tmplJsonFile"
        dirName=`$dirCmd`
        nowResourceFile=("${nowResourceFile[@]}" "$levelName/$dirName")
    done

    nowResourceFile=("${nowResourceFile[@]}" $slotAudioPath_ios/$levelName$magicWorldLevel)

    echoFile $levelDir $levelFolderName"/"
    versionFile $levelDir $levelFolderName"/"
done

#echo magic world resource for Android platform
for magicWorldLevel in ${magicWorldLevels[@]}
do
    cd $rootResDir/$resPath
    levelName=magic_world
    levelFolderName=$levelName"_"$magicWorldLevel"_android"
    levelDir=$rootResDir/$manifestPath/$resPath/$levelFolderName
    rm -rf $levelDir
    mkdir $levelDir

    nowResourceFile=($levelName/"common")

    tmplJsonFile="subject_tmpl_$magicWorldLevel.json"
    levelResFolderLen=`jq '.client.reelDirs|length' ../$resPath/config/subject_tmpl_list/$tmplJsonFile`
    for((i=0;i<$levelResFolderLen;++i))
    do
        dirCmd="jq -r .client.reelDirs|.[$i] ../$resPath/config/subject_tmpl_list/$tmplJsonFile"
        dirName=`$dirCmd`
        nowResourceFile=("${nowResourceFile[@]}" "$levelName/$dirName")
    done

    nowResourceFile=("${nowResourceFile[@]}" $slotAudioPath_android/$levelName$magicWorldLevel)

    echoFile $levelDir $levelFolderName"/"
    versionFile $levelDir $levelFolderName"/"
done

#echo magic world sound resource for iOS platform
for magicWorldAudio in ${magicWorldAudios[@]}
do
    cd $rootResDir/$resPath
    levelName=magic_world
    audioFolderName=$magicWorldAudio"_ios"
    audioDir=$rootResDir/$manifestPath/$resPath/$audioFolderName
    rm -rf $audioDir
    mkdir $audioDir

    nowResourceFile=($slotAudioPath_ios/$magicWorldAudio)

    echoFile $audioDir $audioFolderName"/"
    versionFile $audioDir $audioFolderName"/"
done

#echo magic world sound resource for Android platform
for magicWorldAudio in ${magicWorldAudios[@]}
do
    cd $rootResDir/$resPath
    levelName=magic_world
    audioFolderName=$magicWorldAudio"_android"
    audioDir=$rootResDir/$manifestPath/$resPath/$audioFolderName
    rm -rf $audioDir
    mkdir $audioDir

    nowResourceFile=($slotAudioPath_android/$magicWorldAudio)

    echoFile $audioDir $audioFolderName"/"
    versionFile $audioDir $audioFolderName"/"
done

echo "Finish."
