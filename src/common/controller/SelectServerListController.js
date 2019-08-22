var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var SelectServerItemController = require("./SelectServerItemController");

var SelectServerItemView = cc.TableViewCell.extend({
    serverData: null,
    ccbNode: null,
    ctor: function () {
        this._super();
        this.ccbNode = SelectServerItemController.createFromCCB();
        this.addChild(this.ccbNode);
        this.ccbNode.x = this.ccbNode.controller.itemWidth / 2;
        this.ccbNode.y = this.ccbNode.controller.itemHeight / 2;
    },

    bindData: function (serverData, parent) {
        this.serverData = serverData;
        this.ccbNode.controller.initWith(serverData, parent);
    }
});

var SelectServerListController = function () {
    BaseCCBController.call(this);
    this._closeItem = null;
    this._containerNode = null;
    this._tableView = null;
    this._serverList = null;
};

Util.inherits(SelectServerListController, BaseCCBController);


SelectServerListController.prototype.onEnter = function () {

};

SelectServerListController.prototype.onExit = function () {

};

SelectServerListController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

SelectServerListController.prototype.initWith = function (serverList) {
    this._serverList = serverList;
    this.showFlagStoneTableView();
};

SelectServerListController.prototype.showFlagStoneTableView = function () {
    if(!this._tableView) {
        var tableView = new cc.TableView(this, this._containerNode.getContentSize());
        tableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        tableView.ignoreAnchorPointForPosition(false);
        tableView.setAnchorPoint(cc.p(0, 0));
        tableView.setPosition(cc.p(0, 0));
        tableView.setDelegate(this);
        this._containerNode.addChild(tableView);
        this._tableView = tableView;
    }
    this._tableView.reloadData();
};

SelectServerListController.prototype.scrollViewDidScroll = function (view) {

};
SelectServerListController.prototype.scrollViewDidZoom = function (view) {

};

SelectServerListController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());
};

SelectServerListController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(850, 110);
};

SelectServerListController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new SelectServerItemView();
    }
    cell.bindData(this._serverList[idx], this);
    return cell;
};

SelectServerListController.prototype.numberOfCellsInTableView = function (table) {
    return this._serverList.length;
};

SelectServerListController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

SelectServerListController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

SelectServerListController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

SelectServerListController.createFromCCB = function () {
    return Util.loadNodeFromCCB("server/select_server_dialog.ccbi", null, "SelectServerListController", new SelectServerListController());
};

module.exports = SelectServerListController;