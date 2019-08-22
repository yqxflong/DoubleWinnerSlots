var SpecialTaskSpinLayer = require("./SpecialTaskSpinLayer");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var SlotMan = require("../model/SlotMan");
var SlotSpinStepEndType = require("../events/SlotSpinStepEndType");



var MagicWorld60107SpinLayer = SpecialTaskSpinLayer.extend({
    onSpecialAnimation: function () {
        this.onSpecialAnimationEnd();
    },

    onStartBonusGame: function () {
    },

    onBonusGameEnd: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BONUS_RESULT_END);
    },

    blinkAllBonusLinesNormal: function () {
        this.onBlinkAllBonusLinesCompletedNormal();
    },

    onBlinkAllBonusLinesCompletedNormal: function () {
        this.dispatchSpinStepEndEvent(SlotSpinStepEndType.SLOT_STEP_BLINK_BONUS_LINE_END);
    },

    showConnectedSpriteFromLeftBottom: function (connectedAreas, symbolId) {
        var whiteColor = cc.color(255, 255, 255, 255);
        var leftBottomSymbolPos = this.getSymbolPos(connectedAreas.col, connectedAreas.row);
        var leftBottomPos = cc.p(leftBottomSymbolPos.x - this.gridWidth * 0.5, leftBottomSymbolPos.y - this.gridHeight * 0.5);
        var rightUpPos = cc.p(leftBottomSymbolPos.x + (connectedAreas.areaWidth - 0.5) * this.gridWidth + (connectedAreas.areaWidth - 1) * this.gapWidth, leftBottomSymbolPos.y + (connectedAreas.areaHeight - 0.5) * this.gridHeight);

        var clipLeftBottomPos = leftBottomPos;
        var clipRightUpPos = rightUpPos;
        var clipStencil = new cc.DrawNode();
        clipStencil.ignoreAnchorPointForPosition = false;
        clipStencil.setAnchorPoint(0, 0);
        clipStencil.setPosition(clipLeftBottomPos.x, clipLeftBottomPos.y);
        clipStencil.drawRect(cc.p(0, 0), cc.p(clipRightUpPos.x - clipLeftBottomPos.x, clipRightUpPos.y - clipLeftBottomPos.y), whiteColor, 1, whiteColor);

        var connectedNode = new cc.ClippingNode(clipStencil);
        if(!cc.sys.isNative) {
            clipStencil.setParent(connectedNode);
        }
        connectedNode.getStencil().setScale(0);
        connectedNode.getStencil().runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        this.connectedSymbolNode.addChild(connectedNode);

        var connectedSprite = this.getConnectedNode(symbolId);
        connectedSprite.setAnchorPoint(0.5 - (connectedAreas.areaWidth * this.panelConfig.slotsWidth / connectedSprite.width) * 0.5 - 0.5,
            this.getSpineConnectedNodeRealHeight() / connectedSprite.height * 0.5 - connectedAreas.areaHeight * this.gridHeight / connectedSprite.height);
        connectedSprite.ignoreAnchorPointForPosition = false;
        connectedSprite.setPosition(leftBottomPos);
        connectedSprite.setScale(0);
        connectedSprite.runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        connectedNode.addChild(connectedSprite);

        var framePath = this.getConnectedFramePath(symbolId);
        var connectedFrame = new cc.Scale9Sprite(framePath);
        connectedFrame.setPreferredSize(cc.size(rightUpPos.x - leftBottomPos.x, rightUpPos.y - leftBottomPos.y));
        connectedFrame.ignoreAnchorPointForPosition = false;
        connectedFrame.setAnchorPoint(cc.p(0, 0));
        connectedFrame.setPosition(leftBottomPos.x, leftBottomPos.y);
        connectedFrame.setScale(0);
        connectedFrame.runAction(cc.scaleTo(this.SHOW_CONNECTED_AREA_TIME, 1.0));
        connectedNode.addChild(connectedFrame);
    },

    getConnectedNode: function (symbolId) {
        var resPath = "";
        var connectedNode = null;
        if(symbolId == 1000) {
            resPath = "magic_world/master/dafashi/dafashi";
            connectedNode = Util.loadSpineAnim(resPath, "default", "D_fashi", true);
        }
        else if(symbolId == 1001) {
            resPath = "magic_world/king/king/king54x57";
            connectedNode = Util.loadSpineAnim(resPath, "default", "king_dong", true);
        }
        else if(symbolId == 1002) {
            resPath = "magic_world/wizard/wizard/wizard";
            connectedNode = Util.loadSpineAnim(resPath, "default", "default", true);
        }
        else if(symbolId == 1003) {
            resPath = "magic_world/witch/witch/witch";
            connectedNode = Util.loadSpineAnim(resPath, "default", "default", true);
        }

        return connectedNode;
    },

    getSpineConnectedNodeRealWidth: function (symbolId) {
        return 590;
    },

    getSpineConnectedNodeRealHeight: function (symbolId) {
        return 567;
    },

    isFullGridSymbol: function (symbolId, localCol, localRow) {
        if(symbolId == 1 || symbolId == 2 || (symbolId >= 1000 && symbolId <= 1003)) {
            return true;
        }
        return false;
    },

    onShowBigScatter: function () {
        var centerPos = cc.pAdd(this.getSymbolPos(2, 1), cc.p(0, this.gridHeight * 0.5));
        var areaWidth = this.gridWidth * 3 + this.gapWidth * 2;
        var areaHeight = this.gridHeight * 4;

        var whiteColor = cc.color(255, 255, 255, 255);
        var clipStencil = new cc.DrawNode();
        clipStencil.ignoreAnchorPointForPosition = false;
        clipStencil.setAnchorPoint(0.5, 0.5);
        clipStencil.setPosition(centerPos);
        clipStencil.drawRect(cc.p(-areaWidth * 0.5, -areaHeight * 0.5), cc.p(areaWidth * 0.5, areaHeight * 0.5), whiteColor, 1, whiteColor);

        var clipNode = new cc.ClippingNode(clipStencil);
        this.animsNode.addChild(clipNode);

        var scatterNode = Util.loadSpineAnim("magic_world/mages/enchanter/hero_enchanter", "default", "enchanter", true);
        scatterNode.setPosition(centerPos);
        clipNode.addChild(scatterNode);

        var scatterFrame = new cc.Scale9Sprite("magic_world/common/symbol/magic_world_kuang_1.png");
        scatterFrame.setPreferredSize(cc.size(areaWidth, areaHeight));
        scatterFrame.setPosition(centerPos);
        clipNode.addChild(scatterFrame);

        this.animsNode.runAction(cc.sequence(cc.delayTime(2.0), cc.callFunc(this.onShowBigScatterEnd, this)));
    },

    onShowBigScatterEnd: function () {
        this.animsNode.removeAllChildren(true);
    }
});

module.exports = MagicWorld60107SpinLayer;