var ClassicSlotScene = require("./ClassicSlotScene");
var DrumMode = require("../enum/DrumMode");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DeviceInfo = require("../../common/util/DeviceInfo");

ScrollPayTableController = function() {
    BaseCCBController.call(this);

    this.clipNode = null;
    this.clipLayer = null;
};

Util.inherits(ScrollPayTableController, BaseCCBController);

ScrollPayTableController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

ScrollPayTableController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

ScrollPayTableController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this.useMaskLayer();
};

ScrollPayTableController.prototype.useMaskLayer = function () {
    if(this.clipNode != null && !cc.isUndefined(this.clipNode) && this.clipLayer != null && !cc.isUndefined(this.clipLayer)) {
        var whiteColor = cc.color(255, 255, 255, 255);
        var clipStencil = new cc.DrawNode();
        clipStencil.setPosition(cc.p(0, 0));
        clipStencil.drawRect(cc.p(-456, -102), cc.p(456, 102), whiteColor, 1, whiteColor);

        var clip = new cc.ClippingNode(clipStencil);
        this.clipNode.addChild(clip);

        this.clipLayer.retain();
        this.clipLayer.removeFromParent(false);
        clip.addChild(this.clipLayer);
        this.clipLayer.release();
    }
};

ScrollPayTableController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("magic_world/60108/bg/magic_world_paytable.ccbi", null, "ScrollPayTableController", new ScrollPayTableController());
    return node;
};

var MagicWorld60108SlotScene = ClassicSlotScene.extend({
    DRUM_BEFORE_LAST_COL_RATIO: 1,
    _multiSymbolsRatioMap: null,
    hasDrumMode: false,

    ctor: function () {
        this._super();
        this._multiSymbolsRatioMap = {
            "1007": 20,
            "1008": 10,
            "1009": 5,
            "1010": 2
        };

        this.hasDrumMode = false;
    },

    createExtraUI: function() {
        this._super();

        var heightAdd = 120;
        var nodeScale = 1.0;
        if(!DeviceInfo.isHighResolution()) {
            heightAdd = 85;
            nodeScale = 0.8;
        }
        var scrollPayTableNode = ScrollPayTableController.createFromCCB();
        var spinRegion = this.subjectTmpl.panels[0].spinRegion;
        scrollPayTableNode.setPosition(cc.p(spinRegion.x + spinRegion.width * 0.5, spinRegion.y + spinRegion.height + heightAdd));
        scrollPayTableNode.setScale(nodeScale);
        this.addChild(scrollPayTableNode);
    },

    checkDrumMode: function () {
        var drumState = [];
        for (var i = 0; i < this.subjectTmpl.reelCol; ++i) {
            drumState[i] = DrumMode.DRUM_MODE_NULL;
        }
        if (this.getHighSymbolsDrumState(drumState)) {
            return drumState;
        }
        return drumState;
    },

    getHighSymbolsDrumState: function (drumState) {
        var winLines = this.getNormalWinLines();
        if (winLines.length > 0) {
            var lastSymbolId = this.getSpinResult(this.subjectTmpl.reelCol - 1, 1);
            var multiRatio = this._multiSymbolsRatioMap[lastSymbolId];
            if (multiRatio > 0) {
                var beforeRatio = this.spinPanel.winRate / multiRatio / 100;
                if (beforeRatio >= this.DRUM_BEFORE_LAST_COL_RATIO) {
                    for (var i = 0; i < this.subjectTmpl.reelCol - 1; ++i) {
                        drumState[i] = DrumMode.DRUM_MODE_NULL;
                    }
                    drumState[this.subjectTmpl.reelCol - 1] = DrumMode.DRUM_MODE_DRUM;
                    this.hasDrumMode = true;
                    return true;
                }
            }
        }
        return false;
    },

    getSpinCol: function (col) {
        return col * 3 + 1;
    },

    getSpinExtraOnDrum: function () {
        return 10;
    },

    showTotalWin: function () {
        this._super();
        if (this.hasWinLine()) {
            var layers = this.getSpinLayerIndices();
            for (var i = 0; i < layers.length; ++ i) {
                this.spinLayers[layers[i]].showTotalWin();
            }
        }
    },

    getSpinRowInterval: function () {
        return Math.ceil(this.subjectTmpl.reelRow * 1.5);
    },

    onSpinEnd: function () {
        this.hasDrumMode = false;
        this._super();
    },

    earlyStop: function () {
        if(!this.hasDrumMode) {
            this._super();
        }
    }
});

module.exports = MagicWorld60108SlotScene;