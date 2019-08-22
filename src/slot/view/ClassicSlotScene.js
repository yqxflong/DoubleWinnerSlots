/**
 * Created by qinning on 15/4/30.
 */
var Util = require("../../common/util/Util");
var NormalSlotScene = require("./NormalSlotScene");
var Constants = require("../../common/enum/Constants");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var DeviceInfo = require("../../common/util/DeviceInfo");
var SpinStep = require("../enum/SpinStep");
var SlotFunctionControllerFactory = require("../controller/SlotFunctionControllerFactory");

var ClassicSlotScene = NormalSlotScene.extend({
    createExtraUI: function() {
        this._super();
        this.addLogoSprite();
    },

    addLogoSprite: function () {
        var titleFileName = "";
        var yOffset = 0;
        if(DeviceInfo.isHighResolution()) {
            titleFileName = "%s/reels/bg/%s_title.png";
            yOffset = 10;
        } else {
            titleFileName = "%s/reels/bg/%s_title2.png";
        }
        var fileName = Util.sprintf(titleFileName, this.subjectTmpl.resRootDir, this.subjectTmpl.resRootDir);
        if (Util.isFileExist(fileName)) {
            var platformOffset = DeviceInfo.getPlatformOffset();
            var logoSprite = new cc.Sprite(fileName);
            logoSprite.setAnchorPoint(cc.p(0.5, 0));
            logoSprite.setPosition(cc.p(573 + platformOffset.x, 520 + yOffset + platformOffset.y));
            this.addChild(logoSprite);
        }
    },

    getSpinRowInterval: function () {
        return this.subjectTmpl.reelRow * 2;
    }
});

module.exports = ClassicSlotScene;