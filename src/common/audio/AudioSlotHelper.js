/**
 * Created by ZenQhy on 16/6/27.
 */

var AudioPlayer =  require("./AudioPlayer");
var Util = require("../util/Util");
var SlotMan = require("../../slot/model/SlotMan");
var ResourceMan = require("../../common/model/ResourceMan");
var LogMan = require("../../log/model/LogMan");
var UserStepId = require("../../log/enum/UserStepId");

var AudioSlotHelper = {
    downloadSlotAudioRes: function (folderName) {
        if(cc.sys.isNative) {
            var audioManifestName;
            if(cc.sys.os == cc.sys.OS_IOS) {
                audioManifestName = folderName + "_ios";
            }
            else {
                audioManifestName = folderName + "_android";
            }
            cc.log("Slot audio Start Download!  " + audioManifestName);
            ResourceMan.getInstance().chapterAssetsBegin(audioManifestName, function(error) {
                if(!error) {
                    SlotMan.getCurrent().hasDownloadAudioRes = true;
                    cc.log("load slot audio resource completed");

                    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_DOWNLOAD_SOUND_RES_SUCCESS, -1);
                }
                else {
                    cc.log("load slot audio resource error");
                }
            }, false);
        }
        else {
            var jsonFile = Util.sprintf("resource_list/%s/resource_list.json", folderName);
            cc.log("Slot audio Start Download!  " + jsonFile);
            cc.loader.loadJson(cc.loader.resPath + jsonFile, function(error, resultArr) {
                if(!error) {
                    cc.loader.load(resultArr,
                        function (result, count, loadedCount) {
                        },
                        function () {
                            SlotMan.getCurrent().hasDownloadAudioRes = true;
                            cc.log("load slot audio resource completed");

                            LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_DOWNLOAD_SOUND_RES_SUCCESS, -1);
                        });
                }
                else {
                    cc.log("load slot audio resource error");
                }
            });
        }

        LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_DOWNLOAD_SOUND_RES, -1);
    },

    playSlotBgMusic: function (musicName) {
        if(SlotMan.getCurrent().hasDownloadAudioRes) {
            AudioPlayer.getInstance().playMusicByKey(musicName, true, true);
            return true;
        }
        return false;
    },

    playSlotWinEffect: function (effectName) {
        if(SlotMan.getCurrent().hasDownloadAudioRes) {
            AudioPlayer.getInstance().playEffectByKey(effectName, false, true);
        }
    },

    playSlotEffect: function (effectName) {
        AudioPlayer.getInstance().playEffectByKey(effectName, false, true);
    }
};

module.exports = AudioSlotHelper;