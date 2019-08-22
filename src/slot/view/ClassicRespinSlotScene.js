var RespinSlotScene = require("./RespinSlotScene");
var Util = require("../../common/util/Util");
var DeviceInfo = require("../../common/util/DeviceInfo");
var SpinStep = require("../enum/SpinStep");
var SlotFunctionControllerFactory = require("../controller/SlotFunctionControllerFactory");

/**
 * Created by alanmars on 15/8/17.
 */
var ClassicRespinSlotScene = RespinSlotScene.extend({
    createExtraUI: function() {
        this._super();
        this.addLogoSprite();
    },

    createFunctionNode: function () {
        var platformOffset = DeviceInfo.getPlatformOffset();
        var offsetY = platformOffset.y;
        this.functionNode = SlotFunctionControllerFactory.create(Util.sprintf("%s.ccbi", this.subjectTmpl.spinUiBottomName), this.subjectTmpl.functionType);
        this.functionNode.setPosition(cc.winSize.width * 0.5, offsetY);
        this.addChild(this.functionNode, this.ZORDER_SPIN_UI);

        if (this.slotMan.isInFreeSpin) {
            this.functionNode.controller.enableStop();
            this.titleNode.controller.disableButton();
        }
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
        var platformOffset = DeviceInfo.getPlatformOffset();
        var logoSprite = new cc.Sprite(Util.sprintf(titleFileName, this.subjectTmpl.resRootDir, this.subjectTmpl.resRootDir));
        logoSprite.setAnchorPoint(cc.p(0.5, 0));
        logoSprite.setPosition(cc.p(573 + platformOffset.x, 520 + yOffset + platformOffset.y));
        this.addChild(logoSprite);
    },

    //onSpinEnd: function () {
    //    AudioPlayer.getInstance().stopMusic();
    //    this._super();
    //},
    //
    //playBgMusic: function () {
    //    AudioPlayer.getInstance().playMusicByKey(this.subjectTmpl.spinBgMusic, false);
    //},

    getSpinRowInterval: function () {
        return this.subjectTmpl.reelRow * 2;
    }
});

module.exports = ClassicRespinSlotScene;