var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var SlotConfigMan = require("../config/SlotConfigMan");
var SlotSceneType = require("../enum/SlotSceneType");
var SymbolId = require("../../slot/enum/SymbolId");

/**
 * Created by qinning on 15/6/26.
 */

var MAX_LINE_COUNT = 8;

var PayTableSymbolController = function () {
    BaseCCBController.call(this);
    this._icon = null;
    this._payTables = null;
    this._tableNumbers = [];
};

Util.inherits(PayTableSymbolController, BaseCCBController);

PayTableSymbolController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    for (var i = 0; i < MAX_LINE_COUNT; ++i) {
        this._tableNumbers[i] = this._payTables.getChildByTag(i + 1);
        this._tableNumbers[i].visible = false;
    }
};

/**
 *
 * @param {Symbol} symbolConfig
 * @returns {cc.Node|null}
 */
PayTableSymbolController.prototype.initWith = function (symbolConfig) {
    if (symbolConfig.imgName.length > 0) {
        var imgSpriteFrame = cc.spriteFrameCache.getSpriteFrame(symbolConfig.imgName);
        this._icon.setSpriteFrame(imgSpriteFrame);

        if (imgSpriteFrame.getRect().width > 80 || imgSpriteFrame.getRect().height > 80) {
            var maxLen = Math.max(imgSpriteFrame.getRect().width, imgSpriteFrame.getRect().height);
            this._icon.scaleX = this._icon.scaleY = 80.0 / maxLen;
        }
        else {
            this._icon.scaleX = this._icon.scaleY = 1.0;
        }
    }

    var i = 0;
    for (var key in symbolConfig.payTables) {
        this._tableNumbers[i].setString(parseInt(key));
        this._tableNumbers[i].visible = true;
        if (symbolConfig.symbolId == SymbolId.SYMBOL_ID_JACKPOT && key == "5") {
            this._tableNumbers[i + 1].setString("Jackpot");
        } else {
            this._tableNumbers[i + 1].setString(symbolConfig.payTables[key]);
        }
        this._tableNumbers[i + 1].visible = true;
        i += 2;
        if (i >= MAX_LINE_COUNT) break;
    }
    while (i < MAX_LINE_COUNT) {
        this._tableNumbers[i++].visible = false;
    }
};

PayTableSymbolController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

/**
 * @returns {cc.Node|null}
 */
PayTableSymbolController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("slot/paytable/paytable_symbol.ccbi", null, "PayTableSymbolController", new PayTableSymbolController());
    return node;
};

module.exports = PayTableSymbolController;