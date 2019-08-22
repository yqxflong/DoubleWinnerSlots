var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var StoreUIItemController = require("./StoreUIItemController");
var DialogManager = require("../../common/popup/DialogManager");
var StoreMan = require("../model/StoreMan");
var AudioHelper = require("../../common/util/AudioHelper");
var LogMan = require("../../log/model/LogMan");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var PopupMan = require("../../common/model/PopupMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var dateFormat = require("dateformat");
var NodeProrityMan = require("../../common/model/NodeProrityMan");

var ONE_DAY = 24 * 60 * 60 * 1000;
var ONE_HOUR = 60 * 60 * 1000;
/**
 * Created by qinning on 15/5/6.
 */
var StoreDiscountCountDownController = function () {
    BaseCCBController.call(this);
    this._labelCountDown = null;
};

Util.inherits(StoreDiscountCountDownController, BaseCCBController);

StoreDiscountCountDownController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.LIMITED_TIME_UPDATED, this.update, this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.DAILY_DISCOUNT_UPDATED, this.update, this);
};

StoreDiscountCountDownController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.LIMITED_TIME_UPDATED, this.update, this);
    EventDispatcher.getInstance().removeEventListener(CommonEvent.DAILY_DISCOUNT_UPDATED, this.update, this);
    BaseCCBController.prototype.onExit.call(this);
};

StoreDiscountCountDownController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._labelCountDown.setString("00:00:00");
};

StoreDiscountCountDownController.prototype.limitedCountDownClicked = function (event) {
    AudioHelper.playBtnClickSound();
    if(!StoreMan.getInstance().checkAndShowLimitedTimeStore())
        StoreMan.getInstance().checkAndShowDailyDiscountDialog()
};

StoreDiscountCountDownController.prototype.update = function (event) {
    var countDownTime = event.getUserData();
    if (countDownTime <= 0) {
        if(this.rootNode.visible == true)
        {
            NodeProrityMan.getInstance().resetPrority();
        }
        this.rootNode.visible = false;
        return;
    }
    if(NodeProrityMan.getInstance().askForVisible(NodeProrityMan.getInstance().DISCOUNTNODEPORITY))
        this.rootNode.visible = true;
    else
        this.rootNode.visible = false;
    
    if(countDownTime > ONE_DAY) {
        var day = Math.floor(countDownTime/ONE_DAY);
        var hour = Math.floor((countDownTime - day * ONE_DAY) / ONE_HOUR);
        if(hour < 10) {
            hour = "0" + hour;
        }
        this._labelCountDown.setString(day + "d " + hour + ":" + dateFormat(countDownTime, "MM:ss", true));
    } else {
        var hour = Math.floor((countDownTime) / ONE_HOUR);
        if(hour < 10) {
            hour = "0" + hour;
        }
        this._labelCountDown.setString(hour + ":" + dateFormat(countDownTime, "MM:ss", true));
    }
};

StoreDiscountCountDownController.createFromCCB = function () {
    var node = Util.loadNodeFromCCB("casino/store/store_discount_countdown.ccbi", null, "StoreDiscountCountDownController", new StoreDiscountCountDownController());
    return node;
};

module.exports = StoreDiscountCountDownController;