var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../util/AudioHelper");
var AudioPlayer = require("../audio/AudioPlayer");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../util/Config");

var MAX_CONTENT_LENGTH = 200;
/**
 * Created by alanmars on 15/5/20.
 */
var ContactUsController = function () {
    BaseCCBController.call(this);
    this._sendItem = null;
    this._editBg = null;
    this._sendInfo = null;
    this._infoCount = null;

    this._editBox = null;
};

Util.inherits(ContactUsController, BaseCCBController);

ContactUsController.prototype.onDidLoadFromCCB  = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    this._editBox = new cc.EditBox(cc.size(this._editBg.width, this._editBg.height), new cc.Scale9Sprite("#casino_black.png"), new cc.Scale9Sprite("#casino_black.png"));

    this._editBox.setString("");
    this._editBox.setPosition(this._editBg.getPosition());

    this._editBox.setAnchorPoint(cc.p(0, 0));
    this._editBox.setFontSize(25);
    this._editBox.setFontColor(cc.color(255, 255, 255));
    this._editBox.setPlaceHolder("input your suggestion!");
    this._editBox.setPlaceholderFontSize(20);
    this._editBox.setDelegate(this);
    this.rootNode.addChild(this._editBox);

    this._sendInfo.setString("");
};

ContactUsController.prototype.editBoxEditingDidBegin = function (editBox) {

};

ContactUsController.prototype.editBoxEditingDidEnd = function (editBox) {

};

ContactUsController.prototype.editBoxTextChanged = function (editBox, text) {
    if(text.length > MAX_CONTENT_LENGTH) {
        text = text.substr(0, MAX_CONTENT_LENGTH);
    }
    this._infoCount.setString(Util.sprintf("%d/%d",text.length,MAX_CONTENT_LENGTH));
    this._sendInfo.setString(text);
};

ContactUsController.prototype.editBoxReturn = function (editBox) {

};

ContactUsController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

ContactUsController.prototype.sendClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    var LogMan = require("../../log/model/LogMan");
    var PopupMan = require("../../common/model/PopupMan");
    var text = this._sendInfo.getString();
    if(text.length > 0) {
        LogMan.getInstance().helpMsg(this._sendInfo.getString());
        this.closeClicked();
        PopupMan.popupCommonDialog("THANKS", ["Your message has been sent.", "We will reply you soon.", "Thank you."], "Ok", null, null, false);
    } else {
        var self = this;
        self._editBox.visible = false;
        PopupMan.popupCommonDialog("WARNING", ["Please input your tips"], "Ok", function () {
            self._editBox.visible = true;
        }, null, false);
    }
};

ContactUsController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    DialogManager.getInstance().close(this.rootNode, true);
};

ContactUsController.createFromCCB = function() {
    var node = Util.loadNodeFromCCB("casino/setting/casino_contact_us.ccbi", null, "ContactUsController", new ContactUsController());
    return node;
};

module.exports = ContactUsController;