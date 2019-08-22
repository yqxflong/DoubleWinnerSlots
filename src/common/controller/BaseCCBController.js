/**
 * Created by qinning on 15/4/23.
 */

var BaseCCBController = function() {
    this.maskLayer = null;
    this.clipLayer = null;
};

BaseCCBController.prototype.onDidLoadFromCCB = function() {
    var self = this;
    var oldOnEnter = this.rootNode["onEnter"];
    this.rootNode["onEnter"] = function() {
        if(cc.isFunction(oldOnEnter)){
            oldOnEnter.apply(self.rootNode, arguments);
        }
        self.onEnter();
    };
    var oldOnExit = this.rootNode["onExit"];
    this.rootNode["onExit"] = function() {
        if (cc.isFunction(oldOnExit)) {
            oldOnExit.apply(self.rootNode, arguments);
        }
        self.onExit();
    }
    this.useMaskLayer();
};

BaseCCBController.prototype.useMaskLayer = function() {
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
BaseCCBController.prototype.onEnter = function() {
};

BaseCCBController.prototype.onExit = function() {
};

module.exports = BaseCCBController;