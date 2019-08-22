var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var SlotConfigMan = require("../config/SlotConfigMan");
var SlotSceneType = require("../enum/SlotSceneType");
var PayTableSpecialController = require("./PayTableSpecialController");
var PayTableSymbolController = require("./PayTableSymbolController");
var PayTableDescriptionController = require("./PayTableDescriptionController");
var PayTableType = require("../enum/PayTableType");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");
var SymbolId = require("../../slot/enum/SymbolId");

/**
 * Created by qinning on 15/6/26.
 */

var HORIZONTAL_DIRECTION_PREV = 1;
var HORIZONTAL_DIRECTION_NEXT = -1;

var PAY_TABLE_WIDTH = 960;
var PAY_TABLE_HEIGHT = 640;

var ITEM_COUNT_PER_ROW =       3;
var SYMBOL_ITEM_WIDTH =     175;
var SYMBOL_ITEM_HEIGHT =    100;

var MAX_SYMBOL_COUNT = 12;

var PayTableController = function () {
    BaseCCBController.call(this);
    this._closeItem = null;
    this._leftitemBtn = null;
    this._rightitemBtn = null;
    this._rootNode = null;

    this._symbolPosNode = null;
    this._specialSymbolPosNode = null;
    this._page0 = null;

    this._clipNode = null;
    /**
     *
     * @type {Array.<cc.Node>}
     * @private
     */
    this._pageArray = [];
    this._horizontalDirection = 0;
    this._pageIndex = 0;
};

Util.inherits(PayTableController, BaseCCBController);

PayTableController.prototype.onEnter = function () {
    this.postMove();
};

PayTableController.prototype.onExit = function () {

};

PayTableController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    var whiteColor = cc.color(255, 255, 255, 255);
    var clipStencil = new cc.DrawNode();
    clipStencil.drawRect(cc.p(-PAY_TABLE_WIDTH*0.5, -PAY_TABLE_HEIGHT*0.5), cc.p(PAY_TABLE_WIDTH*0.5, PAY_TABLE_HEIGHT*0.5), whiteColor, 1, whiteColor);
    this._clipNode = new cc.ClippingNode(clipStencil);
    this._rootNode.addChild(this._clipNode);
};

/**
 *
 * @param {SubjectTmpl} subjectTmpl
 */
PayTableController.prototype.initWith = function (subjectTmpl) {
    var descNode;
    if (subjectTmpl.payTableType == PayTableType.PAY_TABLE_TYPE_VIDEO) {
        this._pageArray.push(this._page0);
        this._page0.retain();
        this._page0.removeFromParent();
        this._clipNode.addChild(this._page0);
        this._page0.release();

        var specialNode = PayTableSpecialController.createFromCCB(subjectTmpl);
        specialNode.x = this._specialSymbolPosNode.x;
        specialNode.y = this._specialSymbolPosNode.y;
        this._page0.addChild(specialNode);

        var specialIds = subjectTmpl.specialDescription.specialIds;
        var speicalIdMap = {};
        var i;

        for (var key in specialIds) {
            speicalIdMap[specialIds[key]] = 0;
        }

        var index = 0;
        var symbolIds = subjectTmpl.symbolIds;
        for (i = 0; i < symbolIds.length; ++i) {
            if (index >= MAX_SYMBOL_COUNT) break;
            var symbolId = symbolIds[i];
            if (speicalIdMap[symbolId] != null) continue;
            var symbolConfig = subjectTmpl.getSymbol(symbolId);
            if ((symbolId == SymbolId.SYMBOL_ID_JACKPOT && subjectTmpl.subjectTmplId != 1006) || symbolId >= 1000 && symbolId < 2000 && symbolConfig.symbolValue > 5) {
                var symbolNode = PayTableSymbolController.createFromCCB();
                symbolNode.controller.initWith(symbolConfig);
                var col = (index % ITEM_COUNT_PER_ROW);
                var row = Math.floor(index / ITEM_COUNT_PER_ROW);
                symbolNode.x = this._symbolPosNode.x + SYMBOL_ITEM_WIDTH * col;
                symbolNode.y = this._symbolPosNode.y - SYMBOL_ITEM_HEIGHT * row;
                this._page0.addChild(symbolNode);
                ++index;
            }
        }

        for (i = 0; i < subjectTmpl.descriptions.length; ++i) {
            descNode = PayTableDescriptionController.createFromCCB(subjectTmpl.descriptions[i], subjectTmpl.resRootDir);
            descNode.contentWidth = descNode.contentHeight = 0.0;
            descNode.x = PAY_TABLE_WIDTH * (i + 1);
            descNode.y = 0;
            this._clipNode.addChild(descNode);
            this._pageArray.push(descNode);
        }
    }
    else {
        this._page0.visible = false;

        for (i = 0; i < subjectTmpl.descriptions.length; ++i) {
            descNode = PayTableDescriptionController.createFromCCB(subjectTmpl.descriptions[i], subjectTmpl.resRootDir);
            descNode.contentWidth = descNode.contentHeight = 0.0;
            descNode.x = PAY_TABLE_WIDTH * i;
            descNode.y = 0;
            this._clipNode.addChild(descNode);
            this._pageArray.push(descNode);
        }
    }
    this._pageIndex = 0;
};

PayTableController.prototype.horizontalPrevClicked = function (sender) {
    if (this._pageIndex == 0) return;
    AudioHelper.playBtnClickSound();
    this.prevMove();
    this._horizontalDirection = HORIZONTAL_DIRECTION_PREV;
    this.horizontalMove();
};

PayTableController.prototype.horizontalNextClicked = function (sender) {
    if (this._pageIndex >= (this._pageArray.length - 1)) return;
    AudioHelper.playBtnClickSound();
    this.prevMove();
    this._horizontalDirection = HORIZONTAL_DIRECTION_NEXT;
    this.horizontalMove();
};

PayTableController.prototype.horizontalMove = function (sender) {
    for (var i = 0; i < this._pageArray.length; ++ i) {
        var moveAction = cc.moveBy(1.0, this._horizontalDirection*PAY_TABLE_WIDTH, 0).easing(cc.easeBackInOut());
        this._pageArray[i].runAction(moveAction);
    }
    this.rootNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.postHorizontalMove, this)));
};

PayTableController.prototype.postHorizontalMove = function (sender) {
    this._pageIndex -= this._horizontalDirection;
    this.postMove();
};

PayTableController.prototype.prevMove = function (sender) {
    this._leftitemBtn.visible = false;
    this._rightitemBtn.visible = false;
};

PayTableController.prototype.postMove = function (sender) {
    this._leftitemBtn.visible = (this._pageIndex != 0);
    this._rightitemBtn.visible = (this._pageIndex < (this._pageArray.length - 1));
};

PayTableController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

PayTableController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

PayTableController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

/**
 * @returns {cc.Node|null}
 */
PayTableController.createFromCCB = function() {
    return Util.loadNodeFromCCB("slot/paytable/paytable.ccbi", null, "PayTableController", new PayTableController());
};

module.exports = PayTableController;