/**
 * Created by qinning on 15/5/6.
 */

var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");

var DailyBonusUIItemController = function() {
    this._normalBg = null;
    this._day7Bg = null;
    this._todayBg = null;

    this._goldLabel = null;
    this._goldIcon = null;

    this._normalDayIcon = null;
    this._todayIcon = null;
};


Util.inherits(DailyBonusUIItemController,BaseCCBController);

DailyBonusUIItemController.prototype.onEnter = function () {

};

DailyBonusUIItemController.prototype.onExit = function () {

};

DailyBonusUIItemController.prototype.onDidLoadFromCCB  = function(){
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
};

DailyBonusUIItemController.prototype.bindData = function(dailyBonus,day,isHightLight) {
    if (isHightLight) {
        this._normalBg.visible = false;
        this._day7Bg.visible = false;
        this._todayBg.visible = true;

        this._normalDayIcon.visible = false;
        this._todayIcon.visible = true;
        this._todayIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(Util.sprintf("dailybonus_today_%d.png", day)));
    } else {
        if (day == 7) {
            this._normalBg.visible = false;
            this._day7Bg.visible = true;
            this._todayBg.visible = false;
        } else {
            this._normalBg.visible = true;
            this._day7Bg.visible = false;
            this._todayBg.visible = false;
        }
        this._normalDayIcon.visible = true;
        this._todayIcon.visible = false;
        this._normalDayIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(Util.sprintf("dailybonus_normal_%d.png", day)));
    }
    this._goldIcon.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(Util.sprintf("dailybonus_coin%d.png", day)));
    this._goldLabel.setString(Util.getCommaNum(dailyBonus.count));
};

DailyBonusUIItemController.createFromCCB = function() {
    return Util.loadNodeFromCCB("casino/daily_bonus/daily_bonus_item.ccbi", null, "DailyBonusUIItemController", new DailyBonusUIItemController());
};

module.exports = DailyBonusUIItemController;