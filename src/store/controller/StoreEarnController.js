var Util = require("../../common/util/Util");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var ShopProduct = require("../entity/ShopProduct");
var AudioHelper = require("../../common/util/AudioHelper");
var PurchaseRecordPage = require("../../common/enum/PurchaseRecordPage");
var ActionType = require("../../log/enum/ActionType");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");
var EventDispatcher = require("../../common/events/EventDispatcher");
var CommonEvent = require("../../common/events/CommonEvent");
var PopupMan = require("../../common/model/PopupMan");

/**
 * Created by qinning on 15/5/6.
 */
var StoreEarnController = function () {
    BaseCCBController.call(this);
    this._bgSprite = null;
    this._submitItem = null;
    this._promoEditBoxBg = null;
    
    this._promotionEditBox = null;
};

Util.inherits(StoreEarnController, BaseCCBController);

StoreEarnController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
};

StoreEarnController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.HIDE_MAIL_EDIT_BOX, this.hideMailEditBox, this);
};

StoreEarnController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.initApplyEditbox();
};

StoreEarnController.prototype.initApplyEditbox = function () {
    this._promotionEditBox = this.createEditBox(this._promoEditBoxBg.getContentSize(), this._promoEditBoxBg.getPosition());
    this._promotionEditBox.setPlaceHolder("");
    this._promotionEditBox.setInputMode(cc.EDITBOX_INPUT_MODE_SINGLELINE);
    this._promotionEditBox.setString("");
    this.rootNode.addChild(this._promotionEditBox);
};

/**
 *
 * @param {cc.size} editSize
 * @param {cc.p} pos
 */
StoreEarnController.prototype.createEditBox = function (editSize, pos) {
    var editBox = new cc.EditBox(editSize, new cc.Scale9Sprite("#store_earn_black.png"), new cc.Scale9Sprite("#store_earn_black.png"));

    editBox.setString("");
    editBox.setPosition(pos);

    editBox.setAnchorPoint(cc.p(0, 0));
    editBox.setFontSize(25);
    editBox.setFontColor(cc.color.BLACK);
    editBox.setPlaceholderFontSize(20);
    editBox.setDelegate(this);
    return editBox;
};


StoreEarnController.prototype.editBoxEditingDidBegin = function (editBox) {

};

StoreEarnController.prototype.editBoxEditingDidEnd = function (editBox) {

};

StoreEarnController.prototype.editBoxTextChanged = function (editBox, text) {

};

StoreEarnController.prototype.editBoxReturn = function (editBox) {

};

StoreEarnController.prototype.hideMailEditBox = function (event) {
    if (cc.sys.isNative) {
        return;
    }
    if (this._promotionEditBox) {
        var isHide = event.getUserData();
        this._promotionEditBox.visible = !isHide;
    }
};

StoreEarnController.prototype.submitClicked = function (event) {
    AudioHelper.playBtnClickSound();
    var promotionText = this._promotionEditBox.getString();
    if (promotionText.length > 0) {
        if (!cc.sys.isNative) {
            this._promotionEditBox.visible = false;
        }
        var SocialMan = require("../../social/model/SocialMan");
        SocialMan.getInstance().sendClaimKeyReward(promotionText);
        PopupMan.popupIndicator();
    }
};

StoreEarnController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/store/casino_store_promo_code.ccbi", null, "StoreEarnController", new StoreEarnController());
};

module.exports = StoreEarnController;