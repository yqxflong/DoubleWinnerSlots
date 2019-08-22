#!/bin/sh

if [ $# != 1 ] ; then
    echo "Usage:./sync_src.sh resPath"
    exit 1
fi
resPath=$1

./sync_flavor.sh $resPath
./build_native.sh
./gen_res_md5_client.sh true

cd ../frameworks/runtime-src/proj.android-studio/app/jni
rm -r Includes.mk
rm -r Sources.mk
sh mksrc.command
cd ../../../../

cocos compile -p android -m release --android-studio

adb uninstall com.zentertain.grandwinslots
adb install ../frameworks/runtime-src/proj.android-studio/app/build/outputs/apk/GrandWinSlots-googleplay_grandwin-debug.apk
adb shell am start -n com.zentertain.grandwinslots/com.zentertain.worldtourcasino.Main
