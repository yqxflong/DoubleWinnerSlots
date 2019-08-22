/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var PlayerMan = require("../../common/model/PlayerMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../../slot/events/SlotEvent");
var CommonEvent = require("../../common/events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var ProductType = require("../../common/enum/ProductType");
var C2SGetDailyBonus = require("../protocol/C2SGetDailyBonus");
var DialogManager = require("../../common/popup/DialogManager");
var DailyBonusUIItemController = require("./DailyBonusUIItemController");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");
var ArrowMultiColTableView = require("../../common/ext/ArrowMultiColTableView");
var HourlyGameMan = require("../model/HourlyGameMan");
var HourlyBonusUpgradeItemController = require("./HourlyBonusUpgradeItemController");
var SocialPopupMan = require("../model/SocialPopupMan");

var HourlyBonusUpgradeItemView = cc.TableViewCell.extend({
    itemNode: null,
    ctor: function () {
        this._super();
        this.itemNode = HourlyBonusUpgradeItemController.createFromCCB();
        this.addChild(this.itemNode);
        this.itemNode.x = this.itemNode.controller.getContentSize().width / 2;
        this.itemNode.y = this.itemNode.controller.getContentSize().height / 2;
    },

    /**
     * @param {HourlyGameCardData} card
     */
    initWithCard: function (card) {
        this.itemNode.controller.initWithCard(card);
    }
});



var HourlyBonusUpgradeController = function () {
    this.TABLE_VIEW_COL = 5;
    this.STAR_MAX_WIDTH = 100;

    this._closeItem = null;
    this._cardsNode = null;
    this._leftArrowItem = null;
    this._rightArrowItem = null;
    this._starLabel = null;

    //data
    this._cardList = HourlyGameMan.getInstance().getUserOwnCardList();
};

Util.inherits(HourlyBonusUpgradeController, BaseCCBController);

HourlyBonusUpgradeController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
};

HourlyBonusUpgradeController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.PRODUCT_CHANGED, this.onProductChanged, this);
};

HourlyBonusUpgradeController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._starLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getStars()));
    Util.scaleCCLabelBMFont(this._starLabel, this.STAR_MAX_WIDTH);
    this.showCardsTableView();
};

HourlyBonusUpgradeController.prototype.showCardsTableView = function () {
    if (!this._tableView) {
        this._tableView = new ArrowMultiColTableView(this, this._cardsNode.getContentSize());
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this._tableView.setDelegate(this);
        this._cardsNode.addChild(this._tableView);
        this._tableView.setArrowItem(this._leftArrowItem, this._rightArrowItem);
    }
    this._tableView.reloadData();
};

HourlyBonusUpgradeController.prototype.onProductChanged = function (event) {
    var userData = event.getUserData();
    if (userData.productType == ProductType.PRODUCT_TYPE_STAR) {
        this._starLabel.setString(Util.getCommaNum(PlayerMan.getInstance().getStars()));
        Util.scaleCCLabelBMFont(this._starLabel, this.STAR_MAX_WIDTH);
    }
};

HourlyBonusUpgradeController.prototype.leftArrowClicked = function (sender) {
    this._tableView.leftArrowClicked(sender);
};

HourlyBonusUpgradeController.prototype.rightArrowClicked = function (sender) {
    this._tableView.rightArrowClicked(sender);
};

HourlyBonusUpgradeController.prototype.scrollViewDidScroll = function (view) {
};

HourlyBonusUpgradeController.prototype.scrollViewDidZoom = function (view) {
};

HourlyBonusUpgradeController.prototype.scrollViewDidScroll = function () {

};

HourlyBonusUpgradeController.prototype.gridAtIndex = function(multiTable,  idx) {
    var cell = multiTable.dequeueGrid();
    if (!cell) {
        cell = new HourlyBonusUpgradeItemView();
    }
    if (idx < this._cardList.length) {
        cell.initWithCard(this._cardList[idx]);
        cell.visible = true;
    } else {
        cell.visible = false;
    }
    return cell;
};

HourlyBonusUpgradeController.prototype.numberOfCellsInTableView = function(multiTable) {
    var numberOfCells = Math.floor(this._cardList.length / this.TABLE_VIEW_COL);
    if (this._cardList.length % this.TABLE_VIEW_COL != 0) {
        ++numberOfCells;
    }
    return numberOfCells;
};

HourlyBonusUpgradeController.prototype.numberOfGridsInCell = function(multiTable) {
    return this.TABLE_VIEW_COL;
};

HourlyBonusUpgradeController.prototype.gridSizeForTable = function(table) {
    return cc.size(124, 220);
};

HourlyBonusUpgradeController.prototype.upgradingClicked = function (event) {
    AudioHelper.playBtnClickSound();

};

HourlyBonusUpgradeController.prototype.gridTouched = function(table, grid) {
    var idx = grid.getIdx();
    if (idx < this._cardList.length) {

        cardData = HourlyGameMan.getInstance().getCardConfigData(this._cardList[idx]);
        SocialPopupMan.popupHourlyGameCardInfoDlg(cardData.id);
    }
};

HourlyBonusUpgradeController.prototype.gemsUnlockedClicked = function (event) {
    AudioHelper.playBtnClickSound();

};

HourlyBonusUpgradeController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

HourlyBonusUpgradeController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode);
};

HourlyBonusUpgradeController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

HourlyBonusUpgradeController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_upgrade.ccbi", null, "HourlyBonusUpgradeController", new HourlyBonusUpgradeController());
};

module.exports = HourlyBonusUpgradeController;