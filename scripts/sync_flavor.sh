#!/bin/sh

if [ $# != 1 ] ; then
    echo "Usage:./sync_src.sh resPath"
    exit 1
fi
resPath=$1

rsync -av ../$resPath/flavor/index.html ../
rsync -av ../$resPath/flavor/main.css ../
rsync -av ../$resPath/flavor/project.json ../