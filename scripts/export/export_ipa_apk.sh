#!/bin/sh

if [ $# != 2 ] ; then
    echo "Usage:./export_ipa_apk.sh platform isRelease"
    exit 1
fi
platform=$1
isRelease=$2

if [ $platform != "ios" ]
then
	cd ../../frameworks/runtime-src/proj.android
	./build_android.sh $isRelease
else
	cd ../../frameworks/runtime-src/proj.ios_DoubleWinner_Casino/
	if [ $isRelease == true ] 
	then 
		./build_ios.sh luckywin DoubleWinner_Casino_PROD DoubleWinner_Casino_AdHoc
	else
		./build_ios.sh luckywin DoubleWinner_Casino_DEV DoubleWinner_Casino_AdHoc IS_BETA
	fi
fi
