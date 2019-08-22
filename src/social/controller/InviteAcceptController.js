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
var DialogManager = require("../../common/popup/DialogManager");
var DailyBonusUIItemController = require("./DailyBonusUIItemController");
var PopupMan = require("../../common/model/PopupMan");
var AudioHelper = require("../../common/util/AudioHelper");
var InviteAcceptItemController = require("./InviteAcceptItemController");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");

var InviteAcceptItemView = cc.TableViewCell.extend({
    inviteAcceptNode: null,
    ctor: function () {
        this._super();
        this.inviteAcceptNode = InviteAcceptItemController.createFromCCB();
        this.addChild(this.inviteAcceptNode);
        this.inviteAcceptNode.x = this.inviteAcceptNode.controller.itemWidth / 2;
        this.inviteAcceptNode.y = this.inviteAcceptNode.controller.itemHeight / 2;
    },
    /**
     * @param {Reward} rewardData
     */
    bindData: function (rewardData) {
        this.inviteAcceptNode.controller.initWith(rewardData);
    }
});

var InviteAcceptController = function () {
    this._friendsNumLabel = null;
    this._friendsRewardLabel = null;
    this._containerNode = null;

    this.rewardList = null;

    this._tableView = null;
};

Util.inherits(InviteAcceptController, BaseCCBController);

InviteAcceptController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips,this);
};

InviteAcceptController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.DAILY_BONUS_RECEIVED, this.onReceivedCollectChips,this);
};

InviteAcceptController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

InviteAcceptController.prototype.initWith = function (rewardList) {
    this.rewardList = rewardList;
    var rewardTotal = 0;
    var rewardNum = rewardList.length;
    var singleRewardNum = 0;
    for(var i = 0; i < rewardList.length; ++i) {
        var reward = rewardList[i];
        rewardTotal += reward.chipCount;
        singleRewardNum = reward.chipCount;
    }
    this._friendsNumLabel.setString(rewardNum);
    this._friendsRewardLabel.setString(Util.sprintf("x %s = %s", Util.getCommaNum(singleRewardNum), Util.getCommaNum(rewardTotal)));
    this.showFlagStoneTableView();
};

InviteAcceptController.prototype.showFlagStoneTableView = function () {
    if(!this._tableView) {
        var tableView = new cc.TableView(this, this._containerNode.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.ignoreAnchorPointForPosition(false);
        tableView.setAnchorPoint(cc.p(0, 0));
        if (Config.themeName === ThemeName.THEME_WTC) {
            tableView.setPosition(cc.p(0, 0));
        } else {
            tableView.setPosition(cc.p(10, 0));
        }
        tableView.setDelegate(this);
        this._containerNode.addChild(tableView);
        this._tableView = tableView;
    }
    this._tableView.reloadData();
};

InviteAcceptController.prototype.scrollViewDidScroll = function (view) {

};
InviteAcceptController.prototype.scrollViewDidZoom = function (view) {

};

InviteAcceptController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());

};

InviteAcceptController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(420, 75);
};

InviteAcceptController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new InviteAcceptItemView();
    }
    cell.bindData(this.rewardList[idx]);
    return cell;
};

InviteAcceptController.prototype.numberOfCellsInTableView = function (table) {
    return this.rewardList.length;
};

InviteAcceptController.prototype.collectClicked = function (event) {
    AudioHelper.playBtnClickSound();
    var SocialMan = require("../../social/model/SocialMan");
    var rewardIds = [];
    for(var i = 0; i < this.rewardList.length; ++i) {
        rewardIds.push(this.rewardList[i].id);
    }
    SocialMan.getInstance().claimReward(rewardIds);
    this.close();
};

InviteAcceptController.prototype.closeClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this.close();
};

InviteAcceptController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode);
};

InviteAcceptController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

InviteAcceptController.createFromCCB = function () {
    return Util.loadNodeFromCCB("facebook/facebook_accept.ccbi", null, "InviteAcceptController", new InviteAcceptController());
};

module.exports = InviteAcceptController;