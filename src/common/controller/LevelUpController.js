var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var AudioPlayer = require("../../common/audio/AudioPlayer");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var MessageDialogData = require("../../common/events/MessageDialogData");
var MessageDialogType = require("../../common/events/MessageDialogType");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");

/**
 * Created by alanmars on 15/5/20.
 */
var LevelUpController = function () {
    BaseCCBController.call(this);
    this._levelLabel = null;
    this._rewardChipsLabel = null;
    this._rewardChips = 0;
    this._level = 0;

    this._isUnlockNewGame = false;
    this._unlockSubjectTmplName = null;
    this._unlockSubjectId = null;

    this._maxLevelWidth = 140;
};

Util.inherits(LevelUpController, BaseCCBController);

LevelUpController.prototype.onEnter = function () {
    var self = this;
    this.rootNode.scheduleOnce(function () {
        self.close();
    }, 10);
};

LevelUpController.prototype.onExit = function () {
    AudioPlayer.getInstance().stopEffect("slots/fx-levelup");
};

LevelUpController.prototype.initWith = function (level, rewardChips) {
    if (cc.sys.isNative) {
        var PlayerMan = require("../../common/model/PlayerMan");
        var facebookId = PlayerMan.getInstance().player.facebookId;
        if (!facebookId) {
            facebookId = "";
        }
        jsb_wtc.EventHelper.getInstance().TrackEventLevel(facebookId, level);
    }
    this._level = level;
    AudioPlayer.getInstance().playEffectByKey("slots/fx-levelup");
    this._levelLabel.setString(level);

    if(this._maxLevelWidth > 0) {
        Util.scaleCCLabelBMFont(this._levelLabel, this._maxLevelWidth);
    }

    this._rewardChipsLabel.setString(Util.getCommaNum(rewardChips));
    this._rewardChips = rewardChips;

    this._isUnlockNewGame = false;
    var subjectList = SlotConfigMan.getInstance().getSubjectList();
    var LockType = require("../../slot/enum/LockType");
    for (var i = 0; i < subjectList.length; ++i) {
        var subject = subjectList[i];
        if (subject.lockType == LockType.LOCK && subject.unlockLevel <= this._level) {
            subject.lockType = LockType.UNLOCK;
            var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
            this._isUnlockNewGame = true;
            this._unlockSubjectTmplName = subjectTmpl.displayName;
            this._unlockSubjectId = subject.subjectId;
            break;
        }
    }
};

LevelUpController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
    var PopupMan = require("../../common/model/PopupMan");
    PopupMan.popupRate();
};

LevelUpController.prototype.onShareItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.onCloseItemClicked();
};

LevelUpController.prototype.onCloseItemClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    this.close();
};

LevelUpController.prototype.close = function () {
    var PlayerMan = require("../../common/model/PlayerMan");
    PlayerMan.getInstance().addChips(this._rewardChips, true);
    var LogMan = require("../../log/model/LogMan");
    var ProductChangeReason = require("../../log/enum/ProductChangeReason");
    LogMan.getInstance().userProductRecord(ProductChangeReason.LEVEL_UP, 0, this._rewardChips, this._level, 0, 0);
    if (!this._isUnlockNewGame) {
        this.dispatchLevelUpEvent();
    } else {
        var self = this;
        var PopupMan = require("../../common/model/PopupMan");
        PopupMan.popupCommonYesNoDialogWithColors("CONGRATULATIONS", ["UNLOCK NEW GAME", this._unlockSubjectTmplName], [cc.color.WHITE, cc.color(254, 251, 0, 255)], "Play Now", "Cancel", function () {
            var SceneMan = require("../model/SceneMan");
            SceneMan.getInstance().backSwitchScene();
        },function () {
            self.dispatchLevelUpEvent();
        }, null, false);
    }
    DialogManager.getInstance().close(this.rootNode, true);
};


LevelUpController.prototype.dispatchLevelUpEvent = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.MESSAGE_DIALOG, new MessageDialogData(MessageDialogType.COMMON_LEVEL_UP));
};

LevelUpController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/popup/casino_popup_levelup.ccbi", null, "LevelUpController", new LevelUpController());
};

module.exports = LevelUpController;