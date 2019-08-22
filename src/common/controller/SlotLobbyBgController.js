var Util = require("../util/Util");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var SceneMan = require("../model/SceneMan");
var PlayerMan = require("../model/PlayerMan");
var GameDirector = require("../model/GameDirector");
var LogMan = require("../../log/model/LogMan");
var AdControlMan = require("../../ads/model/AdControlMan");
var FlagStoneController = require("../../slot/controller/FlagStoneController");
var Config = require("../util/Config");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");
var PopupMan = require("../model/PopupMan");
var FlagStoneLockController = require("../../slot/controller/FlagStoneLockController");
var EventDispatcher = require("../events/EventDispatcher");
var SlotEvent = require("../../slot/events/SlotEvent");
var ResourceMan = require("../model/ResourceMan");
var Subject = require("../../slot/entity/Subject");
var SocialMan = require("../../social/model/SocialMan");
var SlotEnterConfirmController = require("../../slot/controller/SlotEnterConfirmController");
var ThemeName = require("../../common/enum/ThemeName");
var JackpotEnterController = require("../../slot/controller/JackpotEnterController");
var JackpotStatus = require("../../slot/enum/JackpotStatus");
var BonusMan = require("../../social/model/BonusMan");
var LogicMan = require("../model/LogicMan");
var BaseCCBController = require("./BaseCCBController");
var PageIndicator = require("../ext/PageIndicator");
var SubjectClassify = require("../../slot/enum/SubjectClassify");
var DeviceInfo = require("../util/DeviceInfo");
var CELL_WIDTH = 230;
var CELL_HEIGHT = 500;

var FlagStoneCellView = cc.TableViewCell.extend({
    /**
     * @type {Subject}
     */
    subject: null,
    flagStoneNode: null,
    ctor: function () {
        this._super();
    },

    /**
     * @param {Subject} subject
     */
    bindData: function (subject) {
        this.subject = subject;
        if(this.flagStoneNode) {
            this.flagStoneNode.removeFromParent();
        }
        this.flagStoneNode = FlagStoneController.createFromCCB(subject.ccbName);
        this.addChild(this.flagStoneNode);
        this.flagStoneNode.x = CELL_WIDTH / 2;
        this.flagStoneNode.y = CELL_HEIGHT / 2;
        this.flagStoneNode.controller.initWithSubject(subject);
    }
});


/**
 * Created by alanmars on 15/5/20.
 */
var SlotLobbyBgController = function () {
    BaseCCBController.call(this);
    //ccb
    this._popularItem = null;
    this._newestItem = null;
    this._jackpotItem = null;
    this._allGameItem = null;

    this._items = null;

    this._flagstoneNode = null;
    this._lobbyNameIcon = null;
    this._indicatorNode = null;

    //user
    this._tableView = null;
    this._leftArrowItem = null;
    this._rightArrowItem = null;
    this._pageIndicator = null;

    //data
    this._serverSubjects = null;
    this._isRunningAnim = false;
    this._lobbyNamesSpriteName = ["popular", "newest", "jackpot", "allgames"];
    this._curClassifyIndex = ClassicSlotMan.getInstance().classifyIndex;
};

Util.inherits(SlotLobbyBgController, BaseCCBController);

SlotLobbyBgController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._pageIndicator = new PageIndicator("#slot_lobby_pag.png", "#slot_lobby_pag_on.png", 50, 5);
    this._indicatorNode.addChild(this._pageIndicator);

    this._items = [this._popularItem, this._newestItem, this._jackpotItem, this._allGameItem];
    this.addTableviewIndicator();
    //this.popuplarClicked();
    this.updateClassify(this._curClassifyIndex);
};

SlotLobbyBgController.prototype.addTableviewIndicator = function () {
    if (!cc.sys.isNative) {
        cc.spriteFrameCache.addSpriteFrames("slot/lobby/slot_lobby_ui_common.plist", "slot/lobby/slot_lobby_ui_common.png");
        this._leftArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("slot_lobby_arrow_left.png")),
            new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("slot_lobby_arrow_left_dis.png")),
            null, this.horizontalPrev, this);
        this._leftArrowItem.setAnchorPoint(cc.p(0.0, 0.5));
        this._leftArrowItem.x = 5;
        this._leftArrowItem.y = this._flagstoneNode.height * 0.5;
        this._leftArrowItem.visible = false;
        this._rightArrowItem = new cc.MenuItemSprite(
            new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("slot_lobby_arrow_right.png")),
            new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("slot_lobby_arrow_right_dis.png")),
            null, this.horizontalNext, this);
        this._rightArrowItem.setAnchorPoint(cc.p(1.0, 0.5));
        this._rightArrowItem.x = cc.winSize.width - this._flagstoneNode.x - 5;
        this._rightArrowItem.y = this._flagstoneNode.height * 0.5;
        this._rightArrowItem.visible = false;

        var arrowMenu = new cc.Menu(this._leftArrowItem, this._rightArrowItem);
        arrowMenu.x = arrowMenu.y = 0;
        this._flagstoneNode.addChild(arrowMenu, 10);
    }
};

SlotLobbyBgController.prototype.updateClassify = function (type) {
    for (var i = 0; i < this._items.length; ++i) {
        var item = this._items[i];
        if (i == type) {
            item.enabled = false;
        } else {
            item.enabled = true;
        }
    }

    this._curClassifyIndex = type;

    ClassicSlotMan.getInstance().classifyIndex = type;

    this._serverSubjects = SlotConfigMan.getInstance().getSubjectListByType(type);

    this.showFlagStoneTableView();

    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(Util.sprintf("slot_lobby_pagtitle_%s.png", this._lobbyNamesSpriteName[type]));
    this._lobbyNameIcon.setSpriteFrame(spriteFrame);

    if (!DeviceInfo.isHighResolution()) {
        this._lobbyNameIcon.visible = false;
    }

    var viewSize = this._tableView.getViewSize();
    var contentSize = this._tableView.getContentSize();
    if (viewSize.width > contentSize.width) {
        this._pageIndicator.visible = false;
    } else {
        this._pageIndicator.visible = true;
        this._pageIndicator.setCellCount(Math.floor(contentSize.width / viewSize.width) + 1);
    }
};

SlotLobbyBgController.prototype.popuplarClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.updateClassify(SubjectClassify.SUBJECT_CLASSIFY_POPULAR);
};

SlotLobbyBgController.prototype.newestClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.updateClassify(SubjectClassify.SUBJECT_CLASSIFY_NEWEST);
};

SlotLobbyBgController.prototype.jackpotClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.updateClassify(SubjectClassify.SUBJECT_CLASSIFY_JACKPOT);
};

SlotLobbyBgController.prototype.allGameClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.updateClassify(SubjectClassify.SUBJECT_CLASSIFY_ALL);
};

SlotLobbyBgController.prototype.showFlagStoneTableView = function () {
    if (!this._tableView) {
        var tableWidth = cc.winSize.width - this._flagstoneNode.x;
        this._tableView = new cc.TableView(this, cc.size(tableWidth, this._flagstoneNode.height));
        this._tableView.setDirection(cc.SCROLLVIEW_DIRECTION_HORIZONTAL);
        this._tableView.ignoreAnchorPointForPosition(false);
        this._tableView.setAnchorPoint(cc.p(0, 0));
        this._tableView.x = 0;
        this._tableView.y = 0;
        this._tableView.setDelegate(this);
        this._flagstoneNode.addChild(this._tableView);
    }
    this._tableView.reloadData();
    if (ThemeName.THEME_DOUBLE_HIT == Config.themeName) {
        //this._tableView.setOpacity(10);
        //this._tableView.runAction(cc.fadeIn(0.5));
    } else {
        var tableViewOffset = ClassicSlotMan.getInstance().tableViewOffset;
        if (tableViewOffset) {
            this._tableView.setContentOffset(tableViewOffset);
        }
    }
};

SlotLobbyBgController.prototype.scrollViewDidScroll = function (view) {
    var minOffset = this._tableView.minContainerOffset();
    var maxOffset = this._tableView.maxContainerOffset();
    var nowOffset = this._tableView.getContentOffset();
    var percent = (nowOffset.x - minOffset.x) / (maxOffset.x - minOffset.x);
    if (this._pageIndicator) {
        this._pageIndicator.setIndicatorPercent(1 - percent);
    }

    if(this._leftArrowItem) {
        this._onTableViewOffsetChanged();
    }
};

SlotLobbyBgController.prototype.scrollViewDidZoom = function (view) {
};

SlotLobbyBgController.prototype.tableCellTouched = function (table, cell) {
    cc.log("cell touched at index: " + cell.getIdx());
    if (cell.getIdx() >= this._serverSubjects.length) {
        return;
    }

    AudioHelper.playBtnClickSound();
    ClassicSlotMan.getInstance().subjectId = cell.subject.subjectId;

    ClassicSlotMan.getInstance().tableViewOffset = table.getContentOffset();

    if (Config.themeName === ThemeName.THEME_WTC) {
        if(cell.subject.jackpotStatus == JackpotStatus.JACKPOT_STATUS_OPEN) {
            var jackpotEnterController = JackpotEnterController.createFromCCB();
            jackpotEnterController.controller.initWith(cell.subject);
            jackpotEnterController.controller.popup();
        } else {
            var SceneType = require("../../common/enum/SceneType");
            var SceneMan = require("../../common/model/SceneMan");
            SceneMan.getInstance().switchScene(SceneType.SLOT_ROOM);
        }
    } else {
        var enterConfirmDlg = SlotEnterConfirmController.createFromCCB();
        enterConfirmDlg.controller.initWith(cell.subject);
        enterConfirmDlg.controller.popup();
    }
};

SlotLobbyBgController.prototype.tableCellSizeForIndex = function (table, idx) {
    return cc.size(CELL_WIDTH, CELL_HEIGHT);
};

SlotLobbyBgController.prototype.tableCellAtIndex = function (table, idx) {
    var cell = table.dequeueCell();
    if (!cell) {
        cell = new FlagStoneCellView();
    }
    if(idx < this._serverSubjects.length) {
        cell.bindData(this._serverSubjects[idx]);
    } else {
        var subject = new Subject();
        subject.unlockLevel = 9999;
        subject.ccbName = "slot/lobby/flagstone/slot_lobby_flagstone_coming_soon.ccbi";
        cell.bindData(subject);
    }
    return cell;
};

SlotLobbyBgController.prototype.numberOfCellsInTableView = function (table) {
    if (this._curClassifyIndex == SubjectClassify.SUBJECT_CLASSIFY_ALL) {
        return this._serverSubjects.length + 1;
    } else {
        return this._serverSubjects.length;
    }
};

SlotLobbyBgController.prototype.horizontalPrev = function (sender) {
    this._leftArrowItem.visible = false;
    this._rightArrowItem.visible = false;

    var offsetX = this._tableView.getContentOffset().x;
    var maxOffsetX = this._tableView.maxContainerOffset().x;
    var moveOffset = Math.min(maxOffsetX - offsetX, 768) + offsetX;
    this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
    this._isRunningAnim = true;

    this.rootNode.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
};

SlotLobbyBgController.prototype.horizontalNext = function (sender) {
    this._leftArrowItem.visible = false;
    this._rightArrowItem.visible = false;

    var offsetX = this._tableView.getContentOffset().x;
    var minOffsetX = this._tableView.minContainerOffset().x;
    var moveOffset = Math.max(minOffsetX - offsetX, -768) + offsetX;
    this._tableView.setContentOffsetInDuration(cc.p(moveOffset, 0), 0.4);
    this._isRunningAnim = true;

    this.rootNode.runAction(cc.sequence(cc.delayTime(0.45), cc.callFunc(this.onTableViewOffsetChanged, this)));
};

SlotLobbyBgController.prototype.onTableViewOffsetChanged = function () {
    this._isRunningAnim = false;
    this._onTableViewOffsetChanged();
};

SlotLobbyBgController.prototype._onTableViewOffsetChanged = function () {
    if(this._isRunningAnim) {
        return;
    }
    var offsetX = Math.round(this._tableView.getContentOffset().x);
    var minOffsetX = Math.round(this._tableView.minContainerOffset().x);
    var maxOffsetX = Math.round(this._tableView.maxContainerOffset().x);

    if (this._tableView.getViewSize().width >= this._tableView.getContentSize().width) {
        this._leftArrowItem.visible = false;
        this._rightArrowItem.visible = false;
    } else {
        if (offsetX <= minOffsetX) {
            this._leftArrowItem.visible = true;
            this._rightArrowItem.visible = false;
        } else if (offsetX >= maxOffsetX) {
            this._leftArrowItem.visible = false;
            this._rightArrowItem.visible = true;
        } else {
            this._leftArrowItem.visible = true;
            this._rightArrowItem.visible = true;
        }
    }
};

SlotLobbyBgController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("slot/lobby/slot_lobby_bg.ccbi", null, "SlotLobbyBgController", new SlotLobbyBgController());
    return node;
};

module.exports = SlotLobbyBgController;