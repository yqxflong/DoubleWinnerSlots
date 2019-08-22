var ClassicSpinLayer = require("./ClassicSpinLayer");
var DeviceInfo = require("../../common/util/DeviceInfo");

var MagicWorld60105SpinLayer = ClassicSpinLayer.extend({
    initUI: function () {
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.symbolBatchPlistPath, this.subjectTmpl.symbolBatchName);
        cc.spriteFrameCache.addSpriteFrames(this.subjectTmpl.commonSymbolBatchPlistPath, this.subjectTmpl.commonSymbolBatchName);
        var spinRegion = this.panelConfig.spinRegion;

        this.columnBgNode = new cc.Node();
        this.addChild(this.columnBgNode);

        this.spinBoardNode = new cc.Node();
        this.addChild(this.spinBoardNode);

        var spinLayerPath = "magic_world/60105/bg/magic_world_wheel_castle_iphone.png";
        if(DeviceInfo.isHighResolution()) {
            spinLayerPath = "magic_world/60105/bg/magic_world_wheel_castle_ipad.png";
        }
        var spinLayerBg = new cc.Sprite(spinLayerPath);
        if(spinLayerBg) {
            if(DeviceInfo.isHighResolution()) {
                spinLayerBg.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinLayerBg.height * 0.5 - 15);
            }
            else {
                spinLayerBg.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height * 0.5);
            }
            this.spinBoardNode.addChild(spinLayerBg, 0);
        }

        var winSize = cc.director.getWinSize();
        var whiteColor = cc.color(255, 255, 255, 255);
        this.symbolsNodes = [];
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var clipStencil = new cc.DrawNode();
            clipStencil.drawRect(cc.p(0, spinRegion.y + this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                cc.p(winSize.width, spinRegion.y + spinRegion.height - this.gridHeight * (this.panelConfig.slotRows - this.eachRowCounts[col]) * 0.5),
                whiteColor, 1, whiteColor);
            var symbolsNode = new cc.ClippingNode(clipStencil);
            this.spinBoardNode.addChild(symbolsNode, this.ZORDER_SYMBOL_NODE);
            this.symbolsNodes.push(symbolsNode);
        }

        this.overlayNode = new cc.Node();
        this.spinBoardNode.addChild(this.overlayNode, this.ZORDER_OVERLAY_NODE);
        for(var col = 0; col < this.panelConfig.slotCols; col++) {
            var oneColOverlayNode = new cc.LayerColor(cc.color.BLACK, this.gridWidth, this.gridHeight * this.eachRowCounts[col]);
            oneColOverlayNode.ignoreAnchorPointForPosition(false);
            oneColOverlayNode.setPositionX(this.panelConfig.spinRegion.x + (col + 0.5) * this.gridWidth + col * this.gapWidth);
            oneColOverlayNode.setPositionY(this.panelConfig.spinRegion.y + this.panelConfig.spinRegion.height * 0.5);
            oneColOverlayNode.setOpacity(150);
            this.overlayNode.addChild(oneColOverlayNode);
        }
        this.overlayNode.setVisible(false);

        this.linesNode = new cc.Node();
        this.spinBoardNode.addChild(this.linesNode, this.ZORDER_LINE_NODE);
        this.framesBgNode = new cc.Node();
        this.spinBoardNode.addChild(this.framesBgNode, this.ZORDER_FRAMES_BG_NODE);
        this.animsNode = new cc.Node();
        this.spinBoardNode.addChild(this.animsNode, this.ZORDER_ANIMS_NODE);
        this.connectedSymbolNode = new cc.Node();
        this.spinBoardNode.addChild(this.connectedSymbolNode, this.ZORDER_CONNECTED_SYMBOL_NODE);
        this.framesNode = new cc.Node();
        this.spinBoardNode.addChild(this.framesNode, this.ZORDER_FRAMES_NODE);
        this.symbolUnBatchNode = new cc.Node();
        this.spinBoardNode.addChild(this.symbolUnBatchNode, this.ZORDER_SYMBOL_UNBATCH_NODE);
        this.frontNode = new cc.Node();
        this.addChild(this.frontNode, this.ZORDER_FRONT_NODE);

        var spinLayerShadowPath = "magic_world/60105/bg/magic_world_wheel_castle_shadow_iphone.png";
        if(DeviceInfo.isHighResolution()) {
            spinLayerShadowPath = "magic_world/60105/bg/magic_world_wheel_castle_shadow_ipad.png";
        }
        var spinLayerShadowSprite = new cc.Sprite(spinLayerShadowPath);
        if(spinLayerShadowSprite) {
            spinLayerShadowSprite.setPosition(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height * 0.5 - 1);
            this.spinBoardNode.addChild(spinLayerShadowSprite, this.ZORDER_FRONT_NODE);
        }

        this.drumModeEffectNode = Util.loadNodeFromCCB("slot/drummode/drummode.ccbi", null);
        if (this.drumModeEffectNode) {
            this.drumModeEffectNode.setVisible(false);
            this.addChild(this.drumModeEffectNode, this.ZORDER_DRUM_MODE_NODE, this.DRUM_MODE_EFFECT_NODE_TAG);
            this.drumModeEffectNode.setScaleX(this.gridWidth / 156);
            this.drumModeEffectNode.setScaleY(this.panelConfig.spinRegion.height / 468.0 * 0.99);
        }

        this.resetColumnBg(false, false);
        this.createExtraUI();
    }
});

module.exports = MagicWorld60105SpinLayer;