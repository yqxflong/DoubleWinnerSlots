/**
 * Created by JianWang on 7/8/16.
 */
var BaseCCBController = require("../common/controller/BaseCCBController");
var Util = require("../common/util/Util");
var EventDispatcher = require("../common/events/EventDispatcher");
var IncentiveAdMan = require("./IncentiveAdMan");
var MultiColTableView= require("../common/ext/MultiColTableView");
var AudioHelper = require("../common/util/AudioHelper");
var IncentiveAdItemController = require("./IncentiveAdItemController");
var IncentiveAdsEvent = require("../common/events/IncentiveAdsEvent");
var DialogManager = require("../common/popup/DialogManager");
var LogMan = require("../log/model/LogMan");

var IncentiveAdItem = cc.TableViewCell.extend({
    itemNode: null,
    ctor: function () {
        this._super();
        this.itemNode = IncentiveAdItemController.createFromCCB();
        this.addChild(this.itemNode);
        this.itemNode.x = this.itemNode.controller.getContentSize().width/2;
        this.itemNode.y = this.itemNode.controller.getContentSize().height/2;
    },

    initWithAd: function (ad) {
        this.itemNode.controller.initWithAd(ad);
    }
});

var IncentiveAdsDlg = function() {
    BaseCCBController.call(this);

    this._bottomRightPosNode = null;
    this._topLeftPosNode = null;
    this._closeItem = null;
    this._tableView = null;
    this._ads = [];
};


Util.inherits(IncentiveAdsDlg, BaseCCBController);


IncentiveAdsDlg.prototype.onEnter = function() {
    BaseCCBController.prototype.onEnter.call(this);

    EventDispatcher.getInstance().addEventListener(IncentiveAdsEvent.IncentiveAds_Update, this.onIncentiveAdsEventUpdate, this);
    EventDispatcher.getInstance().addEventListener(IncentiveAdsEvent.IncentiveAds_Dlg_Close, this.onIncentiveAdsEventDlgClose, this);
    EventDispatcher.getInstance().addEventListener(cc.game.EVENT_SHOW, this.gameOnShow, this);
    this.updateAdInfo();
    this._tableView.reloadData();
    LogMan.getInstance().incentiveAdRecord("INCENTIVE_AD_DLG_CLICKED");
};

IncentiveAdsDlg.prototype.onExit = function() {
    EventDispatcher.getInstance().removeEventListener(IncentiveAdsEvent.IncentiveAds_Update, this.onIncentiveAdsEventUpdate, this);
    EventDispatcher.getInstance().removeEventListener(IncentiveAdsEvent.IncentiveAds_Dlg_Close, this.onIncentiveAdsEventDlgClose, this);
    EventDispatcher.getInstance().removeEventListener(cc.game.EVENT_SHOW, this.gameOnShow, this);
    BaseCCBController.prototype.onExit.call(this);
};

IncentiveAdsDlg.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    var tableSize = new cc.size(this._bottomRightPosNode.x - this._topLeftPosNode.x,  this._topLeftPosNode.y - this._bottomRightPosNode.y);
    this._tableView = new MultiColTableView(this, tableSize, null);
    this._tableView.setMultiTableViewDataSource(this);
    this._tableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);
    this.rootNode.addChild(this._tableView);
    this._tableView.setPosition(this._topLeftPosNode.x,this._bottomRightPosNode.y);
};

IncentiveAdsDlg.prototype.onIncentiveAdsEventUpdate = function(event) {
     this.updateAdInfo();
};

IncentiveAdsDlg.prototype.gameOnShow =function() {
    if(this._tableView)
    {
        this._tableView.reloadData();
    }
};
IncentiveAdsDlg.prototype.onIncentiveAdsEventDlgClose = function(event) {
    this.close();
};
IncentiveAdsDlg.prototype.numberOfCellsInTableView = function(multiTable) {
    return this._ads.length;
};

IncentiveAdsDlg.prototype.numberOfGridsInCell = function(multiTable) {
    return 1;
};

IncentiveAdsDlg.prototype.appleClicked = function () {
    AudioHelper.playBtnClickSound();
    this.close();
};
IncentiveAdsDlg.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);

};

IncentiveAdsDlg.prototype.updateAdInfo = function () {
    this._ads = IncentiveAdMan.getInstance().getIncentiveAds();
    this._tableView.reloadData();
};

IncentiveAdsDlg.prototype.gridSizeForTable = function(table) {
    var tableSize = new cc.size(this._bottomRightPosNode.x - this._topLeftPosNode.x,  this._topLeftPosNode.y - this._bottomRightPosNode.y);
    return cc.size(tableSize.width, 110);
};

IncentiveAdsDlg.prototype.gridAtIndex = function(multiTable,  idx) {
    var cell = multiTable.dequeueGrid();
    if (!cell) {
        cell = new IncentiveAdItem();
        cell.retain();
    }
    if (idx < this._ads.length) {
        cell.initWithAd(this._ads[idx]);
        cell.visible = true;
    } else {
        cell.visible = false;
    }
    return cell;
};

IncentiveAdsDlg.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};


IncentiveAdsDlg.createFromCCB = function () {
    return Util.loadNodeFromCCB("incentive_ad/incentivead_bg.ccbi", null, "IncentiveAdsDlg", new IncentiveAdsDlg());
};


module.exports = IncentiveAdsDlg;