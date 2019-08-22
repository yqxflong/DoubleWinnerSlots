var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var MagicWorld60106CoinBagController = require("../controller/MagicWorld60106CoinBagController");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var Util = require("../../common/util/Util");
var AudioSlotHelper = require("../../common/audio/AudioSlotHelper");
var SymbolId = require("../enum/SymbolId");
var AudioPlayer = require("../../common/audio/AudioPlayer");

GoblinController = function(index, callback, target) {
    BaseCCBController.call(this);
};

Util.inherits(GoblinController, BaseCCBController);

GoblinController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

GoblinController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

GoblinController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.useMaskLayer();
};

GoblinController.prototype.useMaskLayer = function () {
    if(this.maskLayer != null && !cc.isUndefined(this.maskLayer) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var clipParentNode = this.clipLayer.getParent();
        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);

        this.maskLayer.removeFromParent(false);
        this.maskLayer.visible = true;

        var clippingNode = new cc.ClippingNode(this.maskLayer);
        clippingNode.alphaThreshold = 0.5;
        clippingNode.addChild(this.clipLayer);
        this.clipLayer.release();

        clipParentNode.addChild(clippingNode);
    }
};

GoblinController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("magic_world/goblin/magic_world_goblin.ccbi", null, "GoblinController", new GoblinController());
    return node;
};

var MagicWorld60106SlotScene = SpecialTaskSlotScene.extend({
    ctor: function () {
        this.totalGoal = 10;
        this.curProgress = 0;
        this.collectNode = null;

        this.collectBarNode = null;
        this.collectBottom = null;
        this.collectFrame = null;
        this.collectBar = null;

        this.coinBagNode = null;

        this.isShowTaskComplete = false;

        this._super();
    },

    onEnterRoomExtraInfo: function () {
        this._super();

        var roomExtraInfo = this.slotMan.roomExtraInfo;
        if (roomExtraInfo == null) return;
        this.totalGoal = roomExtraInfo.totalGoal;
        this.curProgress = roomExtraInfo.currentGoal;
        this.initEnterRoomUI();
    },

    createExtraUI: function () {
        var spinRegion = this.subjectTmpl.panels[0].spinRegion;
        var spinRegionScale = this.subjectTmpl.panels[0].spinRegionScale;
        var collectBarScale = cc.p(spinRegionScale.x * 1.15, spinRegionScale.y * 1.15);

        var collectBarPos = cc.p(spinRegion.x + spinRegion.width * 0.5 * (1 - spinRegionScale.x) + 30 * spinRegionScale.x, spinRegion.y + spinRegion.height - spinRegion.height * 0.5 * (1 - spinRegionScale.y) + 15 * spinRegionScale.y);
        this.collectBarNode = new cc.Node();
        this.collectBarNode.setPosition(collectBarPos);
        this.addChild(this.collectBarNode, this.ZORDER_COLLECT_BAR);

        this.collectBottom = new cc.Sprite("#coin_progress_bg_2.png");
        this.collectBottom.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectBottom.setPosition(cc.p(0, 0));
        this.collectBottom.setScale(collectBarScale.x, collectBarScale.y);
        this.collectBarNode.addChild(this.collectBottom);

        var collectBarSprite = new cc.Sprite("#coin_progress.png");
        this.collectBar = new cc.ProgressTimer(collectBarSprite);
        this.collectBar.type = cc.ProgressTimer.TYPE_BAR;
        this.collectBar.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectBar.midPoint = cc.p(0, 0.5);
        this.collectBar.barChangeRate = cc.p(1, 0);
        this.collectBar.setPosition(cc.p(3, 0));
        this.collectBar.setScale(collectBarScale.x, collectBarScale.y);
        this.collectBar.setPercentage(100);
        this.collectBarNode.addChild(this.collectBar);

        this.collectFrame = new cc.Sprite("#coin_progress_bg_1.png");
        this.collectFrame.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectFrame.setPosition(cc.p(0, 0));
        this.collectFrame.setScale(collectBarScale.x, collectBarScale.y);
        this.collectBarNode.addChild(this.collectFrame);

        this.coinBagNode = MagicWorld60106CoinBagController.createFromCCB();
        this.coinBagNode.setPosition(cc.p(collectBarPos.x + (spinRegion.width - 160) * spinRegionScale.x, collectBarPos.y + 40 * spinRegionScale.y));
        this.coinBagNode.setScale(collectBarScale.x, collectBarScale.y);
        this.addChild(this.coinBagNode, this.ZORDER_COLLECT_BAR);
        this.showCoinBagNormal();
    },

    onCheckSpecialInfo: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo == null) return;

        if (spinExtraInfo.currentGoal > 0) {// || spinExtraInfo.godTreasureMoney > 0) {
            this.addSpecialAnimation();
        }
    },

    onSpecialAnimation: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo == null) return;

        if (spinExtraInfo.currentGoal > 0) {
            this.showMegaPot();
        }
    },

    showMegaPot: function () {
        var animNode = GoblinController.createFromCCB();
        var symbolPos = cc.pAdd(this.spinLayers[0].getSymbolPos(1, 1), cc.p(0, this.spinLayers[0].gridHeight * 0.5));
        var animPos = this.spinLayers[0].convertToWorldSpace(symbolPos);
        //var posX = this.spinLayers[0].getSymbolPos(1, this.subjectTmpl.panels[0].slotRows / 2).x + 27;
        //var posY = this.subjectTmpl.panels[0].spinRegion.y + this.subjectTmpl.panels[0].spinRegion.height * 0.5;
        animNode.setPosition(animPos);
        //animNode.x = posX;
        //animNode.y = posY;
        animNode.setScale(this.subjectTmpl.panels[0].spinRegionScale.x, this.subjectTmpl.panels[0].spinRegionScale.y);
        this.animationNode.addChild(animNode);
        animNode.runAction(cc.sequence(cc.delayTime(5.2), cc.removeSelf(true)));

        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onCollectIncrease, this)));
        AudioSlotHelper.playSlotEffect("slots/magic_world60106/goblin_appear");
    },

    initEnterRoomUI: function () {
        this.collectBar.setPercentage(this.curProgress / this.totalGoal * 100.0);
        this.isShowTaskComplete = false;
    },

    onCollectComplete: function () {
        this.collectBar.setPercentage(0);
        this.coinBagNode.animationManager.runAnimationsForSequenceNamed("effect_2");

        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo.goalCoin > 0) {
            this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.showCompleteDlg, this)));
        }
        else {
            this.isShowTaskComplete = false;
        }
    },

    showCompleteDlg: function () {
        this.isShowTaskComplete = false;

        var spinExtraInfo = this.spinPanel.extraInfo;
        this.onShowCollectReward(spinExtraInfo.goalCoin);
        AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer", false, false);
    },

    onCollectIncrease: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo == null) return;

        this.curProgress = spinExtraInfo.currentGoal;
        this.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.updateGoalBar, this, this.curProgress), cc.delayTime(4.0), cc.callFunc(this.checkDelay, this)));

        //this.playSubjectEffect("mega-symbol");

        for(var i = 0; i < 8; i++) {
            var coinRootNode = new cc.Node();
            var coinNode = Util.loadNodeFromCCB("magic_world/60106/symbol/coin_1.ccbi", null);

            var posX = this.spinLayers[0].getSymbolPos(1, this.subjectTmpl.panels[0].slotRows / 2).x + 27;
            var posY = this.subjectTmpl.panels[0].spinRegion.y + this.subjectTmpl.panels[0].spinRegion.height * 0.5;
            posX += 200 * (Math.random() * 2 - 1);
            posY += 150 * (Math.random() * 2 - 1);

            coinRootNode.setPosition(posX, posY);
            coinRootNode.visible = false;
            var moveAnim = new cc.Spawn();
            moveAnim.initWithTwoActions(cc.moveTo(0.5, this.coinBagNode.x, this.coinBagNode.y + 30), cc.scaleTo(0.5, 0.5, 0.5));
            coinRootNode.runAction(cc.sequence(cc.delayTime(i * 0.43), cc.show(), cc.delayTime(0.5), moveAnim, cc.callFunc(this.playCoinEffect, this), cc.delayTime(0.5), cc.removeSelf(true)));
            coinRootNode.addChild(coinNode);
            this.animationNode.addChild(coinRootNode);
        }

        this.animationNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.showCoinBagEffect, this), cc.delayTime(3.44), cc.callFunc(this.showCoinBagNormal, this)));
    },

    playCoinEffect: function () {
        AudioSlotHelper.playSlotEffect("slots/magic_world60106/coins_fly");
    },

    showCoinBagEffect: function () {
        this.coinBagNode.animationManager.runAnimationsForSequenceNamed("effect");
    },

    showCoinBagNormal: function () {
        this.coinBagNode.animationManager.runAnimationsForSequenceNamed("normal");
        this.animationNode.removeAllChildren(true);
    },

    onGetExtraCoin: function () {
    },

    updateGoalBar: function (sender, progress) {
        if (progress > this.totalGoal) {
            progress = this.totalGoal;
        }
        if (progress <= this.curProgress) {
            this.collectBar.runAction(cc.progressTo(1.0, progress / this.totalGoal * 100.0));
        }
    },

    checkDelay: function () {
        if (this.curProgress >= this.totalGoal && !this.isShowTaskComplete) {
            this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.onCollectComplete, this)));
            this.isShowTaskComplete = true;
            this.curProgress -= this.totalGoal;
        }
        else {
            this.onSpecialAnimationEnd();
        }
    },

    hasScatter: function () {
        var colCount = 0;
        for (var col = 1; col < 4; ++col) {
            var isBreak = false;
            for (var row = 0; row < this.subjectTmpl.reelRow; row++) {
                var tmpSymbolId = this.getSpinResult(col, row);
                if (SymbolId.SYMBOL_ID_SCATTER != tmpSymbolId) {
                    isBreak = true;
                    break;
                }
            }
            if (isBreak) {
                break;
            }
            ++colCount;
        }
        return (colCount == 3);
    },

    onShowCollectReward: function (winCount) {
        var BonusCollectController = require("../controller/BonusCollectController");
        var dlg = BonusCollectController.createFromCCB("magic_world/60106/symbol/coin_collect.ccbi");
        dlg.controller.initWith(winCount, this.onCollectPopupClose.bind(this));
        dlg.controller.popup();
        AudioSlotHelper.playSlotEffect("slots/magic_world60106/bonus-game-cheer");
    },

    onCollectPopupClose: function () {
        this.onSpecialAnimationEnd();

        var spinExtraInfo = this.spinPanel.extraInfo;
        this.slotMan.updateCurChips();
        this.slotMan.addCurWinChips(spinExtraInfo.goalCoin);
    },

    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateColumn(drumState);
    }
});

module.exports = MagicWorld60106SlotScene;