/**
 * Created by ZenQhy on 16/6/7.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var MagicWorld60106CoinBagController = function() {
};

Util.inherits(MagicWorld60106CoinBagController, BaseCCBController);

MagicWorld60106CoinBagController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
};

MagicWorld60106CoinBagController.prototype.onExit = function () {
    BaseCCBController.prototype.onExit.call(this);
};

MagicWorld60106CoinBagController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

MagicWorld60106CoinBagController.createFromCCB = function() {
    return Util.loadNodeFromCCB("magic_world/60106/symbol/coin_2.ccbi", null, "CoinBagController", new MagicWorld60106CoinBagController());
};

module.exports = MagicWorld60106CoinBagController;