/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var MultiColTableView = require("../../common/ext/MultiColTableView");
var HourlyBonusCollectItemController = require("./HourlyBonusCollectItemController");
var HourlyGameMan = require("../model/HourlyGameMan");
var PopupMan = require("../../common/model/PopupMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SocialEvents = require("../events/SocialEvents");

var BonusCollectItemView = cc.TableViewCell.extend({
    collectNode: null,
    ctor: function () {
        this._super();
        this.collectNode = HourlyBonusCollectItemController.createFromCCB();
        this.addChild(this.collectNode);
        this.collectNode.x = this.collectNode.controller.getContentSize().width / 2;
        this.collectNode.y = this.collectNode.controller.getContentSize().height / 2;
     },

    /**
     * @param {HourlyGameCollectData} collectData
     */
    initWithCollectData: function (collectData) {
        this.collectNode.controller.initWithCollectData(collectData);
    }
});

var HourlyBonusCollectController = function () {
    this.TABLE_VIEW_COL = 1;

    this._closeItem = null;
    this._collectItem = null;
    this._totalWinLabel = null;
    this._contentNode = null;
    this._starLabel = null;
    this._starNode = null;

    this._rewardsTableView = null;

    //data
    this._collectDataList = [];
    this._totalChips = 0;

    /**
     * close callback
     * @type {Function}
     * @private
     */
    this._closeCallback = null;
};

Util.inherits(HourlyBonusCollectController, BaseCCBController);

HourlyBonusCollectController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, this.onClaimedHourlyBonus, this);
};

HourlyBonusCollectController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(SocialEvents.SOCIAL_CLIAMED_HOURLY_BONUS, this.onClaimedHourlyBonus, this);
};

HourlyBonusCollectController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

/**
 * game collect map.
 * @param {Object.<number,HourlyGameCollectData>} gameCollectMap
 * @param {Number} starNum
 * @param {Boolean} isInGame
 * @param {Function} closeCallback
 */
HourlyBonusCollectController.prototype.initWithCollectData = function (gameCollectMap, starNum, isInGame, closeCallback) {
    this._closeCallback = closeCallback;
    for (var data in gameCollectMap) {
        this._collectDataList.push(gameCollectMap[data]);
        this._totalChips += gameCollectMap[data].chips;
    }
    this._totalWinLabel.setString(Util.getCommaNum(this._totalChips));
    if (starNum > 0) {
        this._starNode.visible = true;
        this._starLabel.setString(starNum);
    } else {
        this._starNode.visible = false;
    }
    this.showRewardsTableView();
    if (isInGame) {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("collectCheerTimeline");
    } else {
        this.rootNode.animationManager.runAnimationsForSequenceNamed("Default Timeline");
    }
};

HourlyBonusCollectController.prototype.showRewardsTableView = function () {
    if (!this._rewardsTableView) {
        this._rewardsTableView = new MultiColTableView(this, this._contentNode.getContentSize(), null);
        this._rewardsTableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this._rewardsTableView.setMultiTableViewDelegate(this);
        this._rewardsTableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
        this._contentNode.addChild(this._rewardsTableView);
        this._rewardsTableView.setPosition(cc.p(15, 0));
    }
    this._rewardsTableView.reloadData();
};

HourlyBonusCollectController.prototype.scrollViewDidScroll = function () {

};

HourlyBonusCollectController.prototype.gridAtIndex = function(multiTable,  idx) {
    var cell = multiTable.dequeueGrid();
    if (!cell) {
        cell = new BonusCollectItemView();
    }
    if (idx < this._collectDataList.length) {
        cell.initWithCollectData(this._collectDataList[idx]);
        cell.visible = true;
    } else {
        cell.visible = false;
    }

    return cell;
};

HourlyBonusCollectController.prototype.numberOfCellsInTableView = function(multiTable) {
    var numberOfCells = 0;
    if (this._collectDataList.length % this.TABLE_VIEW_COL == 0) {
        numberOfCells = Math.floor(this._collectDataList.length / this.TABLE_VIEW_COL);
    } else {
        numberOfCells = Math.floor(this._collectDataList.length / this.TABLE_VIEW_COL) + 1;
    }
    return numberOfCells;
};

HourlyBonusCollectController.prototype.numberOfGridsInCell = function(multiTable) {
    return this.TABLE_VIEW_COL;
};

HourlyBonusCollectController.prototype.gridSizeForTable = function(table) {
    return cc.size(this._contentNode.width / this.TABLE_VIEW_COL, 104);
};

HourlyBonusCollectController.prototype.gridTouched = function(table, grid) {

};

HourlyBonusCollectController.prototype.onClaimedHourlyBonus = function (event) {
    this.close();
};

HourlyBonusCollectController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    HourlyGameMan.getInstance().claimHourlyGame();
    PopupMan.popupIndicator();
};

HourlyBonusCollectController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

HourlyBonusCollectController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode);
    if (this._closeCallback) {
        this._closeCallback();
    }
};

HourlyBonusCollectController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

HourlyBonusCollectController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/hourly_bonus/casino_hourly_bonus_collect.ccbi", null, "HourlyBonusCollectController", new HourlyBonusCollectController());
};

module.exports = HourlyBonusCollectController;