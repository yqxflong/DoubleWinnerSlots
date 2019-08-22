/**
 * Created by ZenQhy on 16/7/12.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");

var BonusCollectController = function() {
    this._coinLabel = null;
    this._cb = null;
};

Util.inherits(BonusCollectController, BaseCCBController);

BonusCollectController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

BonusCollectController.prototype.onExit = function () {
    if(this._cb) {
        this._cb = null;
    }
    BaseCCBController.prototype.onExit.call(this);
};

BonusCollectController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

BonusCollectController.prototype.initWith = function (coin, cb) {
    this._coinLabel.setString(Util.getCommaNum(coin));
    Util.scaleCCLabelBMFont(this._coinLabel, 255);
    this._cb = cb;
};

BonusCollectController.prototype.onCollectItemClicked = function (sender) {
    if(this._cb && !cc.isUndefined(this._cb)) {
        this._cb();
    }
    this.close();
};

BonusCollectController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

BonusCollectController.prototype.close = function() {
    DialogManager.getInstance().close(this.rootNode, true);
};

BonusCollectController.createFromCCB = function(filePath) {
    return Util.loadNodeFromCCB(filePath, null, "BonusCollectController", new BonusCollectController());
};

module.exports = BonusCollectController;