/**
 * Created by qinning on 15/4/23.
 */
var Util = require("../util/Util");
var AudioPlayer = require("../audio/AudioPlayer");

var NumberAnimation = cc.Class.extend({
    DEFAULT_TICK_DURATION: 1.0,
    DEFAULT_TICK_INTERVAL: 0.05,

    label: null,
    tickInterval: 0,
    tickDuration: 0,
    startNum: 0,
    endNum: 0,

    step: 0,
    elapsedTime: 0,
    totalElapsedTime: 0,
    curNum: 0,
    intStep: false,

    playSound: false,
    showDollar: false,
    maxWidth: 0,
    key: null,
    preShowStr: null,
    soundEffect: null,
    /**
     * @type {Function}
     */
    numberAnimEndCallback: null,

    ctor: function (label, intStep) {
        intStep = intStep || true;
        this.label = label;
        this.tickDuration = this.DEFAULT_TICK_DURATION;
        this.tickInterval = this.DEFAULT_TICK_INTERVAL;
        this.startNum = 0;
        this.endNum = 0;
        this.intStep = intStep;
        this.playSound = false;
        this.showDollar = false;
        this.maxWidth = 0;
        this.preShowStr = "";
        this.soundEffect = "fx-coins-update";
    },

    reset: function () {
        this.startNum = this.endNum = 0;
    },

    start: function () {
        var gap = this.endNum - this.startNum;
        if (gap == 0) {
            return;
        } else if (gap > 0) {
            var tickCount = this.tickDuration / this.tickInterval;
            this.DEFAULT_TICK_DURATION = this.tickDuration;
            if (gap >= tickCount) {
                this.step = gap / tickCount;
            } else if (gap >= 1) {
                this.step = 1;
                this.tickDuration = this.tickInterval * gap;
            } else {
                this.step = 0;
            }
            if (this.intStep) {
                this.step = Math.floor(this.step);
            }
            if (this.step == 0) {
                return;
            }
            this.elapsedTime = this.tickInterval;
            this.totalElapsedTime = this.tickDuration;
            this.curNum = this.startNum;

            this.beginSchedule();
        } else {
            //Don't animate if the change is negative
            if (this.label && cc.sys.isObjectValid(this.label)) {
                if (!this.showDollar) this.label.setString(this.preShowStr + Util.getCommaNum(parseInt(this.endNum)));
                else this.label.setString("$" + Util.getCommaNum(parseInt(this.endNum)));
                if (this.maxWidth > 0) {
                    Util.scaleCCLabelBMFont(this.label, this.maxWidth);
                }
            }
        }
    },

    stop: function () {
        this.startNum = this.endNum;
        this.curNum = this.endNum;
        this.tickDuration = this.DEFAULT_TICK_DURATION;
        if (this.label && cc.sys.isObjectValid(this.label)) {
            if (!this.showDollar) this.label.setString(this.preShowStr + Util.getCommaNum(parseInt(this.endNum)));
            else this.label.setString("$" + Util.getCommaNum(parseInt(this.endNum)));
            if (this.maxWidth > 0) {
                Util.scaleCCLabelBMFont(this.label, this.maxWidth);
            }
        }
        if (this.numberAnimEndCallback) {
            this.numberAnimEndCallback();
        }
        this.stopSchedule();
    },

    hasStopped: function () {
        return this.curNum === this.endNum;
    },

    beginSchedule: function(){
        cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
    },

    stopSchedule: function(){
        cc.director.getScheduler().unscheduleUpdateForTarget(this);
    },

    update: function (time) {
        this.elapsedTime -= time;
        if (this.elapsedTime <= 0) {
            this.elapsedTime = this.tickInterval;
            this.curNum += this.step;
            if (this.playSound) {
                AudioPlayer.getInstance().playEffectByKey(this.soundEffect);
            }
        }

        this.totalElapsedTime -= time;
        if (this.totalElapsedTime <= 0) {
            this.curNum = this.endNum;
            this.stop();
        }

        if (this.label && cc.sys.isObjectValid(this.label)) {
            if (!this.showDollar) this.label.setString(this.preShowStr + Util.getCommaNum(parseInt(this.curNum)));
            else this.label.setString("$" + Util.getCommaNum(parseInt(this.curNum)));
            if (this.maxWidth > 0) {
                Util.scaleCCLabelBMFont(this.label, this.maxWidth);
            }
        }
    },

    isCompleted: function () {
        return this.curNum == this.endNum;
    },

    setSoundEffect: function (soundEffect) {
        this.soundEffect = soundEffect;
    },

    setNumberAnimEndCallback: function (animEndCallback) {
        this.numberAnimEndCallback = animEndCallback;
    }
});

module.exports = NumberAnimation;