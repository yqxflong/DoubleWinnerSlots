/**
 * Created by qinning on 15/4/27.
 */
var StorageController = require("../storage/StorageController");
var Util = require("../util/Util");
var Config = require("../util/Config");

var ACTION_TYPE = {
    ACTION_NULL: 0,
    ACTION_PAUSE: 1,
    ACTION_RESUME: 2,
    ACTION_LOWER: 3,
    ACTION_LOUDER: 4
};

var MAX_MUSIC_VOLUME = 1;

var AudioPlayer = cc.Class.extend({
    lastMusicVolume: 0,
    lastEffectVolume: 0,
    suffix: null,
    slotSuffix: null,
    effectMap: null,
    actionType: ACTION_TYPE.ACTION_NULL,
    ctor: function () {
        this.suffix = "audio_mp3/%s.mp3";
        this.slotSuffix = "slot_mp3/%s.mp3";
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            this.suffix = "audio_ogg/%s.ogg";
            this.slotSuffix = "slot_ogg/%s.ogg";
        }
        this.effectMap = {};
        var isOn = StorageController.getInstance().getItem("audio_on", "true");
        this.lastEffectVolume = MAX_MUSIC_VOLUME;
        this.lastMusicVolume = MAX_MUSIC_VOLUME;
        if (isOn != "true") {
            this.setAudioOn(false);
        }
    },

    beginSchedule: function () {
        cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 0.1, cc.REPEAT_FOREVER, 0, false);
    },

    stopSchedule: function () {
        cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
    },

    update: function (dt) {
        dt *= 0.5;
        var isFinish = false;
        var volume = cc.audioEngine.getMusicVolume();
        if (volume > 0.001) {
            if (this.actionType == ACTION_TYPE.ACTION_PAUSE) {
                volume -= dt * 2;
                if (volume < 0.001) {
                    volume = 0.01;
                    isFinish = true;
                    this.pauseMusic();
                }
                cc.audioEngine.setMusicVolume(volume);
            }
            else if (this.actionType == ACTION_TYPE.ACTION_RESUME) {
                volume += dt * 2;
                if (volume > 0.99) {
                    volume = 0.99;
                    isFinish = true;
                }
                cc.audioEngine.setMusicVolume(volume);
            }
            else if(this.actionType == ACTION_TYPE.ACTION_LOWER) {
                volume -= dt * 2;
                if (volume < 0.4) {
                    volume = 0.4;
                    isFinish = true;
                }
                cc.audioEngine.setMusicVolume(volume);
            }
            else if(this.actionType == ACTION_TYPE.ACTION_LOUDER) {
                volume += dt * 2;
                if (volume > 0.99) {
                    volume = 0.99;
                    isFinish = true;
                }
                cc.audioEngine.setMusicVolume(volume);
            }
            else {
                this.stopSchedule();
            }
        } else {
            isFinish = true;
        }
        if (isFinish) {
            this.actionType = ACTION_TYPE.ACTION_NULL;
            this.stopSchedule();
        }
    },

    playEffectByKey: function (effectName, loop, isSlot) {
        var fileName = this.getAudioFileName(effectName, isSlot);
        this._showMusicName(fileName);
        var key = "";
        if (cc.sys.isNative) {
            if (jsb.fileUtils.isFileExist(fileName)) {
                key = cc.audioEngine.playEffect(fileName, loop);
            } else {
                cc.log(Util.sprintf("effect file %s not found", fileName));
            }
        } else {
            if (cc.loader.getRes(fileName)) {
                key = cc.audioEngine.playEffect(fileName, loop);
            }
        }
        if (key) {
            this.effectMap[fileName] = key;
        }
    },

    playMusicByKey: function (musicName, loop, isSlot) {
        this.actionType = ACTION_TYPE.ACTION_NULL;
        if (this.isAudioOn()) {
            cc.audioEngine.setMusicVolume(MAX_MUSIC_VOLUME);
        }
        var fileName = this.getAudioFileName(musicName, isSlot);
        this._showMusicName(fileName);
        if (cc.sys.isNative) {
            if (jsb.fileUtils.isFileExist(fileName)) {
                cc.audioEngine.playMusic(fileName, loop);
            } else {
                cc.log(Util.sprintf("music file %s not found", fileName));
            }
        } else {
            if (cc.loader.getRes(fileName)) {
                cc.audioEngine.playMusic(fileName, loop);
            }
        }
    },

    isPlayingMusic: function () {
        return cc.audioEngine.isMusicPlaying();
    },

    resumeMusic: function () {
        cc.audioEngine.resumeMusic();
    },

    resumeMusicSlowly: function () {
        var volume = cc.audioEngine.getMusicVolume();
        if (volume < 0.0001 || volume >= 0.99) {
            return;
        }
        if (this.actionType == ACTION_TYPE.ACTION_NULL) {
            this.beginSchedule();
        }
        cc.audioEngine.setMusicVolume(0.01);
        this.resumeMusic();
        this.actionType = ACTION_TYPE.ACTION_RESUME;
    },

    stopMusic: function () {
        this.actionType = ACTION_TYPE.ACTION_NULL;
        cc.audioEngine.stopMusic();
    },

    lowerMusicVolumeSlowly: function () {
        if (!this.isPlayingMusic()) {
            return;
        }
        if (cc.audioEngine.getMusicVolume() < 0.0001) {
            return;
        }
        if (this.actionType == ACTION_TYPE.ACTION_NULL) {
            this.beginSchedule();
        }
        cc.audioEngine.setMusicVolume(0.99);
        this.actionType = ACTION_TYPE.ACTION_LOWER;
    },

    louderMusicVolumeSlowly: function () {
        var volume = cc.audioEngine.getMusicVolume();
        if (volume < 0.0001 || volume >= 0.99) {
            return;
        }
        if (this.actionType == ACTION_TYPE.ACTION_NULL) {
            this.beginSchedule();
        }
        cc.audioEngine.setMusicVolume(0.4);
        this.actionType = ACTION_TYPE.ACTION_LOUDER;
    },

    stopEffect: function (effectName, isSlot) {
        var fileName = this.getAudioFileName(effectName, isSlot);
        var effectKey = this.effectMap[fileName];
        if (effectKey) {
            cc.audioEngine.stopEffect(effectKey);
            delete this.effectMap[fileName];
        }
    },

    stopAllEffects: function () {
        cc.audioEngine.stopAllEffects();
    },

    isAudioOn: function () {
        var isOn = StorageController.getInstance().getItem("audio_on", "true");
        if (isOn == "true") {
            return true;
        }
        return false;
    },

    pauseMusic: function () {
        cc.audioEngine.pauseMusic();
    },

    pauseMusicSlowly: function () {
        if (!this.isPlayingMusic()) {
            return;
        }
        if (cc.audioEngine.getMusicVolume() < 0.0001) {
            return;
        }
        if (this.actionType == ACTION_TYPE.ACTION_NULL) {
            this.beginSchedule();
        }
        cc.audioEngine.setMusicVolume(0.99);
        this.actionType = ACTION_TYPE.ACTION_PAUSE;
    },
    
    setAudioOn: function (isOn) {
        if (isOn) {
            cc.audioEngine.setMusicVolume(this.lastMusicVolume);
            if (this.lastEffectVolume != 0) {
                cc.audioEngine.setEffectsVolume(this.lastEffectVolume);
                cc.audioEngine.setMusicVolume(this.lastMusicVolume);
            } else {
                cc.audioEngine.setEffectsVolume(MAX_MUSIC_VOLUME);
                cc.audioEngine.setMusicVolume(MAX_MUSIC_VOLUME);
            }
        } else {
            this.lastEffectVolume = cc.audioEngine.getEffectsVolume();
            this.lastMusicVolume = cc.audioEngine.getMusicVolume();
            cc.audioEngine.setMusicVolume(0);
            cc.audioEngine.setEffectsVolume(0);
        }
        StorageController.getInstance().setItem("audio_on", "" + isOn);
    },

    getAudioFileName: function (musicName, isSlot) {
        if (isSlot) {
            return Util.sprintf(this.slotSuffix, musicName);
        } else {
            return Util.sprintf(this.suffix, musicName);
        }
    },

    _popupLabelQueue: [],
    _showMusicName: function (musicName) {
        return;
        if (!Config.isLocal()) {
            return;
        }
        var GameDirector = require("../model/GameDirector");
        var popupScene = GameDirector.getInstance().popupScene;
        var newLabel = new cc.LabelTTF(musicName, "Arial", 20);
        newLabel.setColor(cc.color.RED);
        popupScene.addChild(newLabel, 50000);
        for (var i = this._popupLabelQueue.length - 1; i >= 0; --i) {
            var label = this._popupLabelQueue[i];
            label.runAction(cc.moveBy(0.1, 0, 30));
            if (label.y > cc.winSize.height / 2 - 100) {
                label.removeFromParent();
                this._popupLabelQueue.splice(i, 1);
            }
        }
        this._popupLabelQueue.push(newLabel);
    }
});

AudioPlayer._instance = null;
AudioPlayer._firstUseInstance = true;

/**
 *
 * @returns {AudioPlayer}
 */
AudioPlayer.getInstance = function () {
    if (AudioPlayer._firstUseInstance) {
        AudioPlayer._firstUseInstance = false;
        AudioPlayer._instance = new AudioPlayer();
    }
    return AudioPlayer._instance;
};

module.exports = AudioPlayer;