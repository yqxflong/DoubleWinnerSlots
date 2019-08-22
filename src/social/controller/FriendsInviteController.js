var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var SystemRewardData = require("../../social/entity/SystemRewardData");
var FriendsInviteItemController = require("./FriendsInviteItemController");
var MultiColTableView = require("../../common/ext/MultiColTableView");
var FaceBookMan = require("../model/FaceBookMan");
var PopupMan = require("../../common/model/PopupMan");
var FriendInfo = require("../entity/FriendInfo");
var SocialMan = require("../model/SocialMan");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var FriendsMan = require("../model/FriendsMan");
var FriendsType = require("../enum/FriendsType");

var FriendsInviteItemCellView = cc.TableViewCell.extend({
    inviteItemNode: null,
    ctor: function () {
        this._super();
        this.inviteItemNode = FriendsInviteItemController.createFromCCB();
        this.addChild(this.inviteItemNode);
        this.inviteItemNode.x = this.inviteItemNode.controller.getContentSize().width / 2;
        this.inviteItemNode.y = this.inviteItemNode.controller.getContentSize().height / 2;
    },

    initWithFriendInfo: function (friendInfo) {
        this.inviteItemNode.controller.initWithFriendInfo(friendInfo);
    },

    isSelected: function () {
        if (this.inviteItemNode.controller.friendInfo) {
            return this.inviteItemNode.controller.friendInfo.isSelected;
        }
        return false;
    },

    changeSelectedState: function () {
        if (this.inviteItemNode.controller.friendInfo) {
            this.inviteItemNode.controller.friendInfo.isSelected = !this.inviteItemNode.controller.friendInfo.isSelected;
            this.inviteItemNode.controller.changeSelectState();
        }
    }
});

/**
 * Created by alanmars on 15/5/21.
 */
var FriendsInviteController = function () {
    BaseCCBController.call(this);

    this.MAX_INVITE_FRIENDS_COUNT = 50;

    this._selectIAlltem = null;
    this._rewardsLabel = null;
    this._allFriendsLabel = null;
    this._selectedFriendsLabel = null;
    this._inviteBg = null;
    this._afterItem = null;
    this._beforeItem = null;
    this._inviteNode = null;
    this._editBoxBg = null;

    this.multiTableView = null;
    this.friendsList = null;
    this._searchEditBox = null;
    this._searchText = "";
    this._isSelectedAll = true;
};

Util.inherits(FriendsInviteController, BaseCCBController);

FriendsInviteController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideSearchEditBox, this);
};

FriendsInviteController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideSearchEditBox, this);
};

FriendsInviteController.prototype.onDidLoadFromCCB  = function(){
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    FriendsMan.getInstance().setFriendsByType(FriendsType.FRIENDS_TYPE_INVITABLE, FaceBookMan.getInstance().friendsList);
    FriendsMan.getInstance().setCurFriendsType(FriendsType.FRIENDS_TYPE_INVITABLE);
    FriendsMan.getInstance().setSelectedAll(true);
    this._isSelectedAll = true;

    var PlayerMan = require("../../common/model/PlayerMan");
    this._rewardsLabel.setString(Util.getCommaNum(PlayerMan.getInstance().serverConfig.fbInviteReward));
    this.initSearchEditBox();
    this.friendsList = FriendsMan.getInstance().getCurPageFriends();
    this._updateSelectFriends();
    this.updateBeforeAfterItem();
};

FriendsInviteController.prototype.initSearchEditBox = function () {
    var size = this._editBoxBg.getContentSize();
    size = cc.size(size.width, size.height + 6);
    var position = this._editBoxBg.getPosition();
    position = cc.p(position.x, position.y - 3);
    this._searchEditBox = this.createEditBox(size, position);
    this._searchEditBox.setPlaceHolder("Search for friends");
    this._searchEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_ANY);
    this._searchEditBox.setString("");
    this._searchEditBox.setPosition(this._editBoxBg.getPosition());
    this.rootNode.addChild(this._searchEditBox);
};

FriendsInviteController.prototype.createEditBox = function (editSize, pos) {
    var editBox = new cc.EditBox(editSize, new cc.Scale9Sprite("facebook_invite_black.png"), new cc.Scale9Sprite("facebook_invite_black.png"));

    editBox.setString("");
    editBox.setPosition(pos);

    editBox.setAnchorPoint(cc.p(0, 0));
    editBox.setFontSize(25);
    editBox.setFontColor(cc.color.BLACK);
    editBox.setPlaceholderFontSize(20);
    editBox.setDelegate(this);
    return editBox;
};


FriendsInviteController.prototype.editBoxEditingDidBegin = function (editBox) {

};

FriendsInviteController.prototype.editBoxEditingDidEnd = function (editBox) {

};

FriendsInviteController.prototype.editBoxTextChanged = function (editBox, text) {
    if (text && text.length > 0) {
        var friendsList = FriendsMan.getInstance().getFriendsListByPrefix(text);
        FriendsMan.getInstance().setFriendsByType(FriendsType.FRIENDS_TYPE_SEARCH, friendsList);
        FriendsMan.getInstance().setCurFriendsType(FriendsType.FRIENDS_TYPE_SEARCH);
        this._searchText = text;
    } else {
        FriendsMan.getInstance().setCurFriendsType(FriendsType.FRIENDS_TYPE_INVITABLE);
    }
    this.showFriends();
};

FriendsInviteController.prototype.editBoxReturn = function (editBox) {

};

FriendsInviteController.prototype.showFriends = function () {
    this.friendsList = FriendsMan.getInstance().getCurPageFriends();
    if (this.friendsList.length == 0) {
        FriendsMan.getInstance().setPageIndex(0);
        this.friendsList = FriendsMan.getInstance().getCurPageFriends();
    }
    this.showTableView();
    this.updateBeforeAfterItem();
    this.updateFriendsNumLabel();
};

FriendsInviteController.prototype._updateSelectFriends = function () {
    this.showTableView();
    this.updateFriendsNumLabel();
};

FriendsInviteController.prototype.updateFriendsNumLabel = function () {
    var selectCount = 0;
    var allCount = 0;
    var friendsList = FriendsMan.getInstance().getCurFriendsList();
    for(var i = 0; i < friendsList.length; ++i) {
        var friend = friendsList[i];
        if(friend.isSelected) {
            ++selectCount;
        }
        ++allCount;
    }
    this._allFriendsLabel.setString(allCount);
    this._selectedFriendsLabel.setString(selectCount);

    Util.scaleCCLabelBMFont(this._allFriendsLabel, 46);
    Util.scaleCCLabelBMFont(this._selectedFriendsLabel, 46);

    if (allCount == selectCount) {
        this._selectIAlltem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_all.png"));
        this._selectIAlltem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_all.png"));
        this._isSelectedAll = true;
    } else {
        this._selectIAlltem.setNormalSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_all1.png"));
        this._selectIAlltem.setSelectedSpriteFrame(cc.spriteFrameCache.getSpriteFrame("facebook_invite_all1.png"));
        this._isSelectedAll = false;
    }
};

FriendsInviteController.prototype.showTableView = function () {
    if (!this.multiTableView) {
        this.multiTableView = new MultiColTableView(this, this._inviteNode.getContentSize(), null);
        this.multiTableView.setDirection(cc.SCROLLVIEW_DIRECTION_VERTICAL);
        this.multiTableView.setMultiTableViewDelegate(this);
        this.multiTableView.setVerticalFillOrder(cc.TABLEVIEW_FILL_TOPDOWN);

        this.multiTableView.setPosition(cc.p(4, -5));
        this._inviteNode.addChild(this.multiTableView);
    }
    this.multiTableView.reloadData();
};

FriendsInviteController.prototype.scrollViewDidScroll = function () {

};

FriendsInviteController.prototype.gridAtIndex = function(multiTable,  idx) {
    var cell = multiTable.dequeueGrid();
    if (!cell) {
        cell = new FriendsInviteItemCellView();
    }
    if (idx < this.friendsList.length) {
        cell.initWithFriendInfo(this.friendsList[idx]);
        cell.visible = true;
    } else {
        cell.visible = false;
    }

    return cell;
};

FriendsInviteController.prototype.numberOfCellsInTableView = function(multiTable) {
    var numberOfCells = 0;
    if(this.friendsList.length % this.numberOfGridsInCell() == 0) {
        numberOfCells = Math.floor(this.friendsList.length / 6);
    } else {
        numberOfCells = Math.floor(this.friendsList.length / 6) + 1;
    }
    return numberOfCells;
};

FriendsInviteController.prototype.numberOfGridsInCell = function(multiTable, colIdx) {
    return 6;
};

FriendsInviteController.prototype.gridSizeForTable = function(table, colIdx) {
    return cc.size((this._inviteBg.width - 20) / this.numberOfGridsInCell(), 120);
};

FriendsInviteController.prototype.gridTouched = function(table, grid) {
    if (grid.visible) {
        grid.changeSelectedState();
        this.updateFriendsNumLabel();
    }
};

FriendsInviteController.prototype.inviteClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var invitedFriendIds = [];
    var friendsList = FriendsMan.getInstance().getCurFriendsList();

    for(var i = 0; i < friendsList.length; ++i) {
        var friend = friendsList[i];
        if(friend.isSelected) {
            invitedFriendIds.push(friend.id);
            if (invitedFriendIds.length >= this.MAX_INVITE_FRIENDS_COUNT) {
                break;
            }
        }
    }
    var self = this;
    var tips = "Let's play Double Winner Casino together!";
    FaceBookMan.getInstance().inviteFriends(invitedFriendIds, tips, function(error, invitedFbIdArr, friendsList) {
        if(!error) {
            if(invitedFbIdArr && invitedFbIdArr.length > 0) {
                SocialMan.getInstance().inviteFBFriends(invitedFbIdArr);
                if (FriendsMan.getInstance().getCurFriendstype() == FriendsType.FRIENDS_TYPE_SEARCH) {
                    var searchFriendsList = FriendsMan.getInstance().getFriendsListByPrefix(self._searchText);
                    FriendsMan.getInstance().setFriendsByType(FriendsType.FRIENDS_TYPE_SEARCH, searchFriendsList);
                }
                self.showFriends();
            }
        }
    });
};

FriendsInviteController.prototype.updateBeforeAfterItem = function () {
    var isFirstPage = FriendsMan.getInstance().isFirstFriendsPage();
    var isLastPage = FriendsMan.getInstance().isLastFriendsPage();
    this._beforeItem.enabled = !isFirstPage;
    this._afterItem.enabled = !isLastPage;
};

FriendsInviteController.prototype.beforeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this._afterItem.enabled = false;
    this._beforeItem.enabled = false;
    if (FriendsMan.getInstance().subPageIndex()) {
        this.showFriends();
    }
};

FriendsInviteController.prototype.afterClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this._afterItem.enabled = false;
    this._beforeItem.enabled = false;
    if (FriendsMan.getInstance().addPageIndex()) {
        this.showFriends();
    }
};

FriendsInviteController.prototype.selectAllClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    FriendsMan.getInstance().setSelectedAll(!this._isSelectedAll);
    this._updateSelectFriends();
};

FriendsInviteController.prototype.hideSearchEditBox = function (event) {
    if (cc.sys.isNative) {
        return;
    }
    var isHide = event.getUserData();
    if (isHide) {
        this._searchEditBox.visible = false;
    } else {
        this._searchEditBox.visible = true;
    }
};

FriendsInviteController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

FriendsInviteController.prototype.popup = function() {
    DialogManager.getInstance().popup(this.rootNode);
};

FriendsInviteController.prototype.close = function() {
    DialogManager.getInstance().close(this.rootNode, true);
};

FriendsInviteController.createFromCCB = function () {
    return Util.loadNodeFromCCB("facebook/facebook_invite.ccbi", null, "FriendsInviteController", new FriendsInviteController());
};

module.exports = FriendsInviteController;