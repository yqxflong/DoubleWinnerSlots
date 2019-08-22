#!/usr/bin/env bash
#change the target file path by yourself

if [ $# != 1 ] ; then
    echo "Usage:./gen_res_list.sh resPath"
    exit 1
fi

resPath=$1
configPath=resource_list
lagLoadConfigPath=lag_load_resource_list
slotAudioPath=slot_mp3/slots
subjectTmplPath=config/subject_tmpl_list

commonResourceFiles=()
lagLoadResourceFiles=()
chapterResourceFiles=()
magicWorldLevels=()
magicWorldAudios=()
blackListExt=("manifest" "svn" "DS_Store" "js")


commonLen=`jq '.facebookDirs|length' ../$resPath/resource_dirs.json`
for((i=0;i<$commonLen;++i))
do
    dirCmd="jq -r .facebookDirs|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    commonResourceFiles=("${commonResourceFiles[@]}" $dirName)
done

lagLoadFileLen=`jq '.facebookLagLoadDirs|length' ../$resPath/resource_dirs.json`
for((i=0;i<$lagLoadFileLen;++i))
do
    dirCmd="jq -r .facebookLagLoadDirs|.[$i] ../$resPath/resource_dirs.json"
    dirName=`$dirCmd`
    lagLoadResourceFiles=("${lagLoadResourceFiles[@]}" $dirName)
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


calResourceFile() {
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
    echo "\"${PWD##*$resPath/}/$file\"" >>  $outputfile
    else
    echo "\"$file\"" >>  $outputfile
    fi
}

loopDir() {  
    for file in find *
    do
    if [ -d $file ]
    then
    echo "$file is directory"
    cd ./$file
    loopDir
    cd ..


    elif [ -f $file ]
    then
    echo "$file is file"
    calResourceFile $file
    fi
    done
}

echoFile() {
    outputDir=$1
    outputFileName=$3
    outputfile=$outputDir/"$outputFileName.json"
    rm -rf $outputfile
    touch $outputfile
    local chapterDir=$2
    # Release the resource array to js file.
    isFirst=true
    echo "[" >> $outputfile
    resDir=${PWD}
    for fileName in ${nowResourceFile[@]} 
    do
        fullFile=$resDir/$fileName
        echo $fullFile
        if [ -f $fullFile ]
        then
            calResourceFile $fileName
        elif [ -d $fullFile ]
        then
            cd $fullFile
            loopDir
            cd ..
        fi
    done
    echo "]" >> $outputfile
}

cd ../$resPath
rootResDir=${PWD}
# cd $rootResDir/$configPath
#echo common resource
commonManifestDir=$rootResDir/$configPath

#rm -rf $commonManifestDir
#mkdir $commonManifestDir

nowResourceFile=${commonResourceFiles[@]}
echoFile $commonManifestDir "" $configPath

nowResourceFile=${lagLoadResourceFiles[@]}
echoFile $commonManifestDir "" $lagLoadConfigPath

# echo chapter resource
for chapterDir in ${chapterResourceFiles[@]} 
do
    chapterManifestDir=$rootResDir/$configPath/$chapterDir
    rm -rf $chapterManifestDir
    mkdir $chapterManifestDir
    nowResourceFile=($chapterDir $slotAudioPath/$chapterDir)
    echoFile $chapterManifestDir $chapterDir"/" $configPath
    cd $rootResDir
done

# echo new world resource
for magicWorldLevel in ${magicWorldLevels[@]}
do
    levelName=magic_world
    levelFolderName=$levelName"_"$magicWorldLevel
    levelDir=$rootResDir/$configPath/$levelFolderName
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

    nowResourceFile=("${nowResourceFile[@]}" $slotAudioPath/$levelName$magicWorldLevel)

    echoFile $levelDir $levelName"/" $configPath
    cd $rootResDir
done

# echo magic world audio resource
for magicWorldAudio in ${magicWorldAudios[@]}
do
    audioFolderName=$magicWorldAudio
    audioDir=$rootResDir/$configPath/$audioFolderName
    rm -rf $audioDir
    mkdir $audioDir

    nowResourceFile=($slotAudioPath/$audioFolderName)

    echoFile $audioDir $audioFolderName"/" $configPath
    cd $rootResDir
done

cd $rootResDir
echo "gen_res_list.sh Finish."
