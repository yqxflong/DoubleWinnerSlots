var SpecialTaskSlotScene = require("./SpecialTaskSlotScene");
var SpinStep = require("../enum/SpinStep");
var MagicWorld60107JackpotController = require("../controller/MagicWorld60107JackpotController");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var AudioHelper = require("../../common/util/AudioHelper");

BonusPokerController = function(index, callback, target) {
    BaseCCBController.call(this);

    this.index = index;
    this.callback = callback;
    this.target = target;

    this._cardIcon = null;
};

Util.inherits(BonusPokerController, BaseCCBController);

BonusPokerController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

BonusPokerController.prototype.setCardIcon = function (result) {
    if(this._cardIcon) {
        switch(result) {
            case 0:
                this._cardIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("magic_world_jackpot_card_copper.png"));
                AudioPlayer.getInstance().playEffectByKey("slots/magic_world60107/poker_copper", false, true);
                break;
            case 1:
                this._cardIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("magic_world_jackpot_card_silver.png"));
                AudioPlayer.getInstance().playEffectByKey("slots/magic_world60107/poker_silver", false, true);
                break;
            case 2:
                this._cardIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("magic_world_jackpot_card_gold.png"));
                AudioPlayer.getInstance().playEffectByKey("slots/magic_world60107/poker_gold", false, true);
                break;
            case 3:
                this._cardIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("magic_world_jackpot_card_white.png"));
                break;
            default:
                break;
        }
    }
};

BonusPokerController.prototype.onOpenClick = function (sender) {
    this.callback.call(this.target, this.index);
};

BonusPokerController.prototype.onShowCardAnimEnd = function (sender) {
    this.rootNode.animationManager.runAnimationsForSequenceNamed("blink");
};

var FreeSpinSelectController = function (id, callback, target) {
    BaseCCBController.call(this);

    this.controllerId = id;
    this.callback = callback;
    this.target = target;

    this.maskLayer = null;
    this.clipLayer = null;
};

Util.inherits(FreeSpinSelectController, BaseCCBController);

FreeSpinSelectController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.useMaskLayer();
};

FreeSpinSelectController.prototype.useMaskLayer = function() {
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

FreeSpinSelectController.prototype.onFreeSpinClick = function (sender) {
    this.callback.call(this.target, this.controllerId);
};

var MagicWorld60107SlotScene = SpecialTaskSlotScene.extend({
    ctor: function () {
        this.maxWildCount = 100;
        this.curWildCount = 0;

        this.minorCoins = 0;
        this.majorCoins = 0;
        this.grandCoins = 0;

        this.jackpotNode = null;

        this.collectBarNode = null;
        this.collectBottom = null;
        this.collectFrame = null;
        this.collectBar = null;

        this.pokersNode = null;
        this.bonusPokers = [];
        this.pokerClickedMap = {};
        this.curBonusResultCount = 0;
        this.bonusResultShownCount = 0;

        this.goldGemCount = 0;
        this.silverGemCount = 0;
        this.copperGemCount = 0;

        this.freeSpinChooseNode = null;
        this.freeSpinChooseNodeList = [];
        this.freeSpinHasChosen = true;

        this.collectRubyNode = null;

        this.blinkCollectBarBg = null;

        this.nodeScaleX = 1.0;
        this.nodeScaleY = 1.0;

        this.hasRubyCollectAnimation = false;
        this.hasFreeSpinChooseAnimation = false;

        this._super();
    },

    onEnterRoomExtraInfo: function () {
        this._super();

        var roomExtraInfo = this.slotMan.roomExtraInfo;
        if (roomExtraInfo == null) return;

        this.maxWildCount = roomExtraInfo.maxWildCount;
        this.curWildCount = roomExtraInfo.wildCount;
        this.minorCoins = roomExtraInfo.goalCoin1;
        this.majorCoins = roomExtraInfo.goalCoin2;
        this.grandCoins = roomExtraInfo.goalCoin3;

        this.initEnterRoomUI();
    },

    createExtraUI: function () {
        var spinRegion = this.subjectTmpl.panels[0].spinRegion;
        var spinRegionScale = this.subjectTmpl.panels[0].spinRegionScale;
        var collectBarSpinLayerPos = cc.p(spinRegion.x + 60, spinRegion.y + spinRegion.height + 20);
        var collectBarWorldPos = this.spinLayers[0].convertToWorldSpace(collectBarSpinLayerPos);
        this.nodeScaleX = spinRegionScale.x * 1.15;
        this.nodeScaleY = spinRegionScale.y * 1.15;

        this.collectBarNode = new cc.Node();
        this.collectBarNode.setPosition(collectBarWorldPos);
        this.addChild(this.collectBarNode, this.ZORDER_COLLECT_BAR);

        this.collectBottom = new cc.Sprite("#magic_world_jackpot_progress_bg_2.png");
        this.collectBottom.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectBottom.setPosition(cc.p(0, 0));
        this.collectBottom.setScale(this.nodeScaleX, this.nodeScaleY);
        this.collectBarNode.addChild(this.collectBottom);

        var collectBarSprite = new cc.Sprite("#magic_world_jackpot_progress.png");
        this.collectBar = new cc.ProgressTimer(collectBarSprite);
        this.collectBar.type = cc.ProgressTimer.TYPE_BAR;
        this.collectBar.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectBar.midPoint = cc.p(0, 0.5);
        this.collectBar.barChangeRate = cc.p(1, 0);
        this.collectBar.setPosition(cc.p(2, 2));
        this.collectBar.setPercentage(100);
        this.collectBar.setScale(this.nodeScaleX, this.nodeScaleY);
        this.collectBarNode.addChild(this.collectBar);

        this.collectFrame = new cc.Sprite("#magic_world_jackpot_progress_bg_1.png");
        this.collectFrame.setAnchorPoint(cc.p(0.0, 0.5));
        this.collectFrame.setPosition(cc.p(0, 0));
        this.collectFrame.setScale(this.nodeScaleX, this.nodeScaleY);
        this.collectBarNode.addChild(this.collectFrame);

        var jackpotNodeSpinLayerPos = cc.p(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height - 20);
        var jackpotNodeWorldPos = this.spinLayers[0].convertToWorldSpace(jackpotNodeSpinLayerPos);
        this.jackpotNode = MagicWorld60107JackpotController.createFromCCB();
        this.jackpotNode.setPosition(jackpotNodeWorldPos.x, jackpotNodeWorldPos.y);
        this.jackpotNode.setScale(this.nodeScaleX, this.nodeScaleY);
        this.addChild(this.jackpotNode);

        this.pokersNode = new cc.Node();
        this.pokersNode.visible = false;
        this.addChild(this.pokersNode, this.ZORDER_COLLECT_BAR);

        this.freeSpinChooseNode = new cc.Node();
        this.freeSpinChooseNode.visible = false;
        this.addChild(this.freeSpinChooseNode, this.ZORDER_COLLECT_BAR);

        var collectRubySpinLayerPos = cc.p(spinRegion.x + 20, spinRegion.y + spinRegion.height + 43);
        var collectRubyWorldPos = this.spinLayers[0].convertToWorldSpace(collectRubySpinLayerPos);
        this.collectRubyNode = Util.loadSpineAnim("magic_world/60107/symbol/baoshi4x5/baoshi4x5", "default", "default", true);
        this.collectRubyNode.setPosition(collectRubyWorldPos);
        this.collectRubyNode.setScale(0.4 * this.nodeScaleX, 0.4 * this.nodeScaleY);
        this.addChild(this.collectRubyNode, this.ZORDER_COLLECT_BAR);
    },

    initEnterRoomUI: function () {
        this.collectBar.setPercentage(this.curWildCount / this.maxWildCount * 100.0);
        this.jackpotNode.controller.setJackpot(this.minorCoins, this.majorCoins, this.grandCoins);
    },

    onCheckSpecialInfo: function () {
        var extraInfo = this.spinPanel.extraInfo;
        if (extraInfo == null) return;

        if (extraInfo.chooseFreeMod || extraInfo.wildCount > this.curWildCount) {
            this.addSpecialAnimation();

            if(extraInfo.chooseFreeMod) this.hasFreeSpinChooseAnimation = true;
            if(extraInfo.wildCount > this.curWildCount) this.hasRubyCollectAnimation = true;
        }

        this.minorCoins = extraInfo.goalCoin1;
        this.majorCoins = extraInfo.goalCoin2;
        this.grandCoins = extraInfo.goalCoin3;

        if(!this.hasBonus()) {
            this.jackpotNode.controller.refreshJackpot(this.minorCoins, this.majorCoins, this.grandCoins);
        }
        else {
            this.jackpotNode.controller.refreshJackpot(extraInfo.oldGoalCoin1, extraInfo.oldGoalCoin2, extraInfo.oldGoalCoin3);
        }
    },

    onSpecialAnimation: function () {
        var extraInfo = this.spinPanel.extraInfo;

        if(this.hasRubyCollectAnimation) {
            this.onCollectIncrease();
            this.hasRubyCollectAnimation = false;
        }
        else if(this.hasFreeSpinChooseAnimation) {
            this.showBigScatter();
            this.hasFreeSpinChooseAnimation = false;
        }
        else {
            this._super();
        }

        this.setCurrentSpinStep(SpinStep.SLOT_SPECIAL_ANIMATION);
    },

    onCollectIncrease: function () {
        var spinExtraInfo = this.spinPanel.extraInfo;
        if (spinExtraInfo == null) return;

        var flyTime = 0.5;
        var rubyPosList = this.getRubyPosList();
        for(var i = 0; i < rubyPosList.length; i++) {
            var startPos = this.spinLayers[0].convertToWorldSpace(this.spinLayers[0].getSymbolPos(rubyPosList[i].col, rubyPosList[i].row));
            var endPos = this.collectRubyNode.getPosition();

            var spinRegionScale = this.subjectTmpl.panels[0].spinRegionScale;
            var rubyAnim = Util.loadSpineAnim("magic_world/60107/symbol/baoshi4x5/baoshi4x5", "default", "default");
            rubyAnim.setPosition(startPos);
            rubyAnim.setScale(spinRegionScale.x, spinRegionScale.y);
            this.animationNode.addChild(rubyAnim, 1);

            var rubyBreakAnim = Util.loadNodeFromCCB("magic_world/60107/symbol/ruby_suizha.ccbi", null);
            rubyBreakAnim.setPosition(startPos);
            rubyBreakAnim.setScale(this.nodeScaleX, this.nodeScaleY);
            this.animationNode.addChild(rubyBreakAnim, 5);

            var rubyFlyAnim = Util.loadNodeFromCCB("magic_world/60107/symbol/ruby_fei.ccbi", null);
            rubyFlyAnim.setPosition(startPos);
            rubyFlyAnim.setScale(this.nodeScaleX, this.nodeScaleY);
            var moveAnim = new cc.Spawn();
            moveAnim.initWithTwoActions(cc.moveTo(flyTime, endPos.x, endPos.y), cc.scaleTo(flyTime, 0.4 * this.nodeScaleX, 0.4 * this.nodeScaleY));
            rubyFlyAnim.runAction(cc.sequence(cc.delayTime(0.1 * (3 - rubyPosList[i].row)), moveAnim, cc.delayTime(flyTime), cc.removeSelf(true)));
            this.animationNode.addChild(rubyFlyAnim, 10);
        }

        this.animationNode.runAction(cc.sequence(cc.delayTime(flyTime), cc.callFunc(this.playRubyCollectAnim, this)));

        this.curWildCount = spinExtraInfo.wildCount;
        this.runAction(cc.sequence(cc.callFunc(this.updateCollectBar, this, this.curWildCount), cc.delayTime(1.5), cc.callFunc(this.onCollectIncreaseEnd, this)));
    },

    getRubyPosList: function () {
        var Coordinate = require("../entity/Coordinate");
        var posList = [];
        var panelConfig = this.subjectTmpl.panels[0];
        for(var col = 0; col < panelConfig.slotCols; col++) {
            for(var row = 0; row < panelConfig.slotRows; row++) {
                if(this.spinPanel.panel[col][row] == 1) {
                    var pos = new Coordinate();
                    pos.col = col;
                    pos.row = row;
                    posList.push(pos);
                }
            }
        }

        return posList;
    },

    playRubyCollectAnim: function () {
        var rubyCollectAnim = Util.loadNodeFromCCB("magic_world/60107/symbol/ruby_bao.ccbi", null);
        rubyCollectAnim.setPosition(this.collectRubyNode.getPosition());
        this.animationNode.addChild(rubyCollectAnim);
        this.animationNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.removeAllRubyAnimNode, this)));
        AudioPlayer.getInstance().playEffectByKey("slots/magic_world60107/ruby_collect", false, true);
    },

    removeAllRubyAnimNode: function () {
        this.animationNode.removeAllChildren(true);
    },

    updateCollectBar: function (sender, progress) {
        if (progress > this.maxWildCount) {
            progress = this.maxWildCount;
        }
        if (progress <= this.curWildCount) {
            this.collectBar.runAction(cc.progressTo(1.0, progress / this.maxWildCount * 100.0));
        }
    },

    onCollectIncreaseEnd: function () {
        this.onSpecialAnimation();
    },

    onShowBonusWelcome: function () {
        this.onStartBonus();
    },

    onStartBonus: function () {
        this.blinkCollectBar();
    },

    blinkCollectBar: function () {
        var collectBarSprite = new cc.Sprite("#magic_world_jackpot_progress.png");
        this.blinkCollectBarBg = Util.loadNodeFromCCB("magic_world/jackpot/magic_world_progress.ccbi", null);
        this.blinkCollectBarBg.setPosition(collectBarSprite.width * this.nodeScaleX, 0);
        this.blinkCollectBarBg.setScale(this.nodeScaleX, this.nodeScaleY);
        this.collectBarNode.addChild(this.blinkCollectBarBg);

        this.runAction(cc.sequence(cc.delayTime(1.8), cc.callFunc(this.showAllPokers, this)));
    },

    showAllPokers: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].visible = false;
            this.spinLayers[spinLayerIndices[i]].onStartBonusGame();
        }

        this.collectBarNode.visible = false;
        this.collectBar.setPercentage(0);
        this.curWildCount = 0;
        this.pokersNode.visible = true;
        this.collectRubyNode.visible = false;
        this.blinkCollectBarBg.removeFromParent(true);
        this.blinkCollectBarBg = null;

        this.bonusPokers = [];
        this.pokerClickedMap = {};
        this.curBonusResultCount = 0;
        this.bonusResultShownCount = 0;
        this.goldGemCount = 0;
        this.silverGemCount = 0;
        this.copperGemCount = 0;

        var centerPos = this.spinLayers[0].convertToWorldSpace(cc.pAdd(this.spinLayers[0].getSymbolPos(2, 1), cc.p(20 * this.nodeScaleX, this.spinLayers[0].gridHeight * 0.5 - 10 * this.nodeScaleY)));
        var bgSprite = new cc.Sprite("magic_world/jackpot/magic_world_jackpot_card_bg.png");
        bgSprite.setPosition(centerPos);
        bgSprite.setScale(this.nodeScaleX, this.nodeScaleY);
        this.pokersNode.addChild(bgSprite);

        var panelConfig = this.subjectTmpl.panels[0];
        for(var col = 0; col < panelConfig.slotCols; col++) {
            for(var row = 0; row < panelConfig.slotRows - 1; row++) {
                var onePoker =  Util.loadNodeFromCCB("magic_world/jackpot/magic_world_card.ccbi", null,
                    "BonusPokerController", new BonusPokerController(col * (panelConfig.slotRows - 1) + row, this.onBonusPokerResultShown, this));

                var pokerPos = cc.p(centerPos.x + (col - 2) * this.spinLayers[0].gridWidth * 0.73 * this.nodeScaleX, centerPos.y + (row - 1) * this.spinLayers[0].gridHeight * this.nodeScaleY);
                onePoker.setPosition(pokerPos);
                onePoker.setScale(this.nodeScaleX, this.nodeScaleY);
                this.bonusPokers.push(onePoker);
                this.pokersNode.addChild(onePoker);
            }
        }
    },

    onBonusPokerResultShown: function (index) {
        if(this.pokerClickedMap[index]) return;

        var extraInfo = this.spinPanel.extraInfo;
        if(!cc.isUndefined(extraInfo.collectCards[this.curBonusResultCount]) && extraInfo.collectCards[this.curBonusResultCount] != null) {
            this.bonusPokers[index].controller.setCardIcon(extraInfo.collectCards[this.curBonusResultCount]);
            this.bonusPokers[index].animationManager.runAnimationsForSequenceNamed("animation");
            this.pokerClickedMap[index] = true;

            if(extraInfo.collectCards[this.curBonusResultCount] != 3) {
                var gemNode = Util.loadNodeFromCCB("magic_world/jackpot/magic_world_gem.ccbi", null);

                var gemPos = cc.p(0, 0);
                var gemIcon = null;
                switch (extraInfo.collectCards[this.curBonusResultCount]) {
                    case 0:
                        gemIcon = gemNode.getChildByTag(3);
                        if (gemIcon) gemIcon.setSpriteFrame("magic_world_jackpot_copper_gem.png");
                        gemPos = this.jackpotNode.controller.getGemPos(0, this.copperGemCount);
                        this.copperGemCount++;
                        break;
                    case 1:
                        gemIcon = gemNode.getChildByTag(3);
                        if (gemIcon) gemIcon.setSpriteFrame("magic_world_jackpot_silver_gem.png");
                        gemPos = this.jackpotNode.controller.getGemPos(1, this.silverGemCount);
                        this.silverGemCount++;
                        break;
                    case 2:
                        gemIcon = gemNode.getChildByTag(3);
                        if (gemIcon) gemIcon.setSpriteFrame("magic_world_jackpot_gold_gem.png");
                        gemPos = this.jackpotNode.controller.getGemPos(2, this.goldGemCount);
                        this.goldGemCount++;
                        break;
                    default:
                        break;
                }

                gemNode.setPosition(gemPos.x, gemPos.y);
                gemNode.setScale(this.nodeScaleX, this.nodeScaleY);
                this.pokersNode.addChild(gemNode);
                gemNode.runAction(cc.sequence(cc.delayTime(1.5) ,cc.callFunc(this.checkBonusGameEnd, this)));
            }
            else {
                this.checkBonusGameEnd();
            }
            this.curBonusResultCount++;
        }
    },

    checkBonusGameEnd: function () {
        var extraInfo = this.spinPanel.extraInfo;
        this.bonusResultShownCount++;
        if(this.bonusResultShownCount >= extraInfo.collectCards.length) {
            if(extraInfo.oldGoalCoin1 == extraInfo.collectCoins) {
                this.jackpotNode.controller.playWinCopperAnim();
            }
            else if(extraInfo.oldGoalCoin2 == extraInfo.collectCoins) {
                this.jackpotNode.controller.playWinSilverAnim();
            }
            else if(extraInfo.oldGoalCoin3 == extraInfo.collectCoins) {
                this.jackpotNode.controller.playWinGoldAnim();
            }

            this.runAction(cc.sequence(cc.delayTime(1.5), cc.callFunc(this.showJackpotWinPopup, this)));
        }
    },

    showJackpotWinPopup: function () {
        var extraInfo = this.spinPanel.extraInfo;
        var BonusCollectController = require("../controller/BonusCollectController");
        var dlg = BonusCollectController.createFromCCB("magic_world/jackpot/ruby_collect.ccbi");
        dlg.controller.initWith(extraInfo.collectCoins, this.onCardGameEnd.bind(this));
        dlg.controller.popup();
        AudioPlayer.getInstance().playEffectByKey("slots/magic_world60107/jackpot_win", false, true);
        AudioPlayer.getInstance().playEffectByKey("slots/bonus-cheer");

        this.slotMan.bonusWin = extraInfo.collectCoins;
        var PlayerMan = require("../../common/model/PlayerMan");
        PlayerMan.getInstance().addChips(extraInfo.collectCoins, false);

        this.jackpotNode.controller.setJackpot(this.minorCoins, this.majorCoins, this.grandCoins);
    },

    onCardGameEnd: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].onBonusGameEnd();
        }
    },

    onBackFromBonus: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].visible = true;
        }

        this.collectBarNode.visible = true;
        this.collectRubyNode.visible = true;
        this.pokersNode.visible = false;
        this.pokersNode.removeAllChildren(true);
        this._super();
    },

    showBigScatter: function () {
        this.spinLayers[0].onShowBigScatter();
        this.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onShowChooseFreeSpin, this)));
        AudioHelper.playSlotEffect("bonus-game-appear", false);
    },

    onShowChooseFreeSpin: function () {
        this.freeSpinChooseNode.visible = true;
        this.collectBarNode.visible = false;
        this.jackpotNode.visible = false;
        this.collectRubyNode.visible = false;

        var i = 0;
        var spinLayerIndices = this.getSpinLayerIndices();
        for (i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].visible = false;
        }

        var winSize = cc.director.getWinSize();
        var freeSpinTitleSprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("freespin_title.png"));
        freeSpinTitleSprite.setPosition(winSize.width * 0.5, winSize.height - 120 * this.nodeScaleY);
        freeSpinTitleSprite.setScale(this.nodeScaleX, this.nodeScaleY);
        this.freeSpinChooseNode.addChild(freeSpinTitleSprite);

        this.freeSpinHasChosen = false;
        this.freeSpinChooseNodeList = [];
        var freeSpinNodeWidth = 220 * this.nodeScaleX;
        for (i = 0; i < 4; i++) {
            var ccbPath = Util.sprintf("magic_world/60107/symbol/freespin_%d.ccbi", i + 1);
            var freeSpinSelectNode = Util.loadNodeFromCCB(ccbPath, null,
                "FreeSpinSelect", new FreeSpinSelectController(i, this.onFreeSpinSelected, this));
            freeSpinSelectNode.setPosition(winSize.width * 0.5 + (i - 1.5) * freeSpinNodeWidth, winSize.height * 0.5);
            freeSpinSelectNode.setScale(this.nodeScaleX, this.nodeScaleY);
            this.freeSpinChooseNode.addChild(freeSpinSelectNode);
            this.freeSpinChooseNodeList.push(freeSpinSelectNode);
        }
    },

    onFreeSpinSelected: function (controllerId) {
        if(this.freeSpinHasChosen) return;
        this.freeSpinHasChosen = true;

        this.slotMan.sendSlotParam(controllerId);

        var freeSpinCount = 0;
        switch(controllerId) {
            case 0:
                freeSpinCount = 5;
                break;
            case 1:
                freeSpinCount = 6;
                break;
            case 2:
                freeSpinCount = 8;
                break;
            case 3:
                freeSpinCount = 10;
                break;
            default:
                freeSpinCount = 5;
                break;
        }
        this.slotMan.setFakeFreeSpin(freeSpinCount);

        this.freeSpinChooseNodeList[controllerId].animationManager.runAnimationsForSequenceNamed("normal");
        this.freeSpinChooseNodeList[controllerId].runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onFreeSpinSelectedEnd, this)));
    },

    onFreeSpinSelectedEnd: function () {
        var spinLayerIndices = this.getSpinLayerIndices();
        for (var i = 0; i < spinLayerIndices.length; ++i) {
            this.spinLayers[spinLayerIndices[i]].visible = true;
        }

        this.freeSpinChooseNode.visible = false;
        this.freeSpinChooseNode.removeAllChildren(true);
        this.collectBarNode.visible = true;
        this.jackpotNode.visible = true;
        this.collectRubyNode.visible = true;

        this.onSpecialAnimation();
    },

    handleWinRate: function () {
        if(!this.hasBonus()) {
            this.slotMan.updateCurChips();
            this.slotMan.setCurWinChips(this.spinPanel.chips);
        }
        else {
            var extraInfo = this.spinPanel.extraInfo;
            var chipsDelta = this.spinPanel.chips - extraInfo.collectCoins;

            var PlayerMan = require("../../common/model/PlayerMan");
            PlayerMan.getInstance().addChips(-extraInfo.collectCoins, false);

            this.slotMan.updateCurChips();
            this.slotMan.setCurWinChips(chipsDelta);
        }
    },

    getScatterDrumState: function (drumState) {
        return this.getScatterDrumStateColumn(drumState);
    },

    onBonusEnd: function () {
        this.onSubRoundEnd();
    },

    onBonusEndInFreeSpin: function () {
        this.onSubRoundEndInFreeSpin();
    }
});

module.exports = MagicWorld60107SlotScene;