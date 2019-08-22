/**
 * Created by qinning on 15/5/21.
 */

var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var CommonEvent = require("../events/CommonEvent");
var EventDispatcher = require("../events/EventDispatcher");
var ThemeName = require("../../common/enum/ThemeName");
var Config = require("../../common/util/Config");

var CommonDialogController = function () {
    this._titleLabel = null;
    this._infoLabel = null;
    this._buttonLabel = null;
    this._buttonItem = null;
    this._closeItem = null;
    //this._closeBg = null;

    this._confirmItem = null;
    this._cancelItem = null;
    this._confirmInfo = null;
    this._cancelInfo = null;

    this._buttonCallback = null;
    this._confirmCallback = null;
    this._cancelCallback = null;
    this._closeCallback = null;

    this._descLabels = [];
};


Util.inherits(CommonDialogController, BaseCCBController);

CommonDialogController.prototype.onEnter = function () {
    BaseCCBController.prototype.onEnter.call(this);
    EventDispatcher.getInstance().addEventListener(CommonEvent.CLOSE_COMMON_DIALOG, this.close, this);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, true);
};

CommonDialogController.prototype.onExit = function () {
    EventDispatcher.getInstance().removeEventListener(CommonEvent.CLOSE_COMMON_DIALOG, this.close, this);
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.HIDE_MAIL_EDIT_BOX, false);
    BaseCCBController.prototype.onExit.call(this);
};

CommonDialogController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this._infoLabel.visible = false;
};

CommonDialogController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

CommonDialogController.prototype.close = function () {
    DialogManager.getInstance().close(this.rootNode, true);
};

/**
 * @param {string} titleLabel
 * @param {Array.<string>} descTxts
 * @param {string} buttonLabel
 * @param {function} confirmCallback
 * @param {function} closeCallback
 * @param {boolean} isShowClose
 */
CommonDialogController.prototype.initWith = function (titleLabel, descTxts, buttonLabel, confirmCallback, closeCallback, isShowClose) {
    this._initWith(titleLabel, descTxts, null, buttonLabel, confirmCallback, closeCallback, isShowClose);
};
/**
 * @param {string} titleLabel
 * @param {Array.<string>} descTxts
 * @param {Array.<cc.color>} colors
 * @param {string} buttonLabel
 * @param {function} confirmCallback
 * @param {function} closeCallback
 * @param {boolean} isShowClose
 */
CommonDialogController.prototype.initWithColors = function (titleLabel, descTxts, colors, buttonLabel, confirmCallback, closeCallback, isShowClose) {
    this._initWith(titleLabel, descTxts, colors, buttonLabel, confirmCallback, closeCallback, isShowClose);
};

CommonDialogController.prototype._initWith = function (titleLabel, descTxts, colors, buttonLabel, confirmCallback, closeCallback, isShowClose) {
    if (titleLabel) {
        this._titleLabel.setString(titleLabel);
    } else {
        this._titleLabel.setString("Notice");
    }

    this.initDescriptions(descTxts, colors);

    if (buttonLabel) {
        this._buttonLabel.setString(buttonLabel);
    } else {
        this._buttonLabel.setString("OK");
    }
    this._buttonCallback = confirmCallback;
    if (isShowClose) {
        this._closeItem.visible = true;
        //this._closeBg.visible = true;
    } else {
        this._closeItem.visible = false;
        //this._closeBg.visible = false;
    }
    this._closeCallback = closeCallback;

    this._confirmItem.visible = false;
    this._cancelItem.visible = false;
    this._confirmInfo.visible = false;
    this._cancelInfo.visible = false;
};

/**
 * @param {string} titleLabel
 * @param {Array.<string>} descTxts
 * @param {string} confirmLabel
 * @param {string} cancelLabel
 * @param {function} confirmCallback
 * @param {function} cancelCallback
 */
CommonDialogController.prototype.initWithYesNoDlg = function (titleLabel, descTxts, confirmLabel, cancelLabel, confirmCallback, cancelCallback) {
    this._initWithYesNoDlgColors(titleLabel, descTxts, null, confirmLabel, cancelLabel, confirmCallback, cancelCallback);
};

/**
 * @param {string} titleLabel
 * @param {Array.<string>} descTxts
 * @param {Array.<cc.color>} colors
 * @param {string} confirmLabel
 * @param {string} cancelLabel
 * @param {function} confirmCallback
 * @param {function} cancelCallback
 */
CommonDialogController.prototype.initWithYesNoDlgColors = function (titleLabel, descTxts, colors, confirmLabel, cancelLabel, confirmCallback, cancelCallback) {
    this._initWithYesNoDlgColors(titleLabel, descTxts, colors, confirmLabel, cancelLabel, confirmCallback, cancelCallback);
};

CommonDialogController.prototype._initWithYesNoDlgColors = function (titleLabel, descTxts, colors, confirmLabel, cancelLabel, confirmCallback, cancelCallback) {
    this._confirmItem.visible = true;
    this._cancelItem.visible = true;
    this._confirmInfo.visible = true;
    this._cancelInfo.visible = true;
    this._buttonItem.visible = false;
    this._buttonLabel.visible = false;
    this._closeItem.visible = false;
    //this._closeBg.visible = false;

    this._titleLabel.setString(titleLabel);

    this.initDescriptions(descTxts, colors);

    this._confirmInfo.setString(confirmLabel);
    this._cancelInfo.setString(cancelLabel);

    Util.scaleCCLabelBMFont(this._confirmInfo, this._confirmItem.width - 20);
    Util.scaleCCLabelBMFont(this._cancelInfo, this._cancelItem.width - 20);

    this._confirmCallback = confirmCallback;
    this._cancelCallback = cancelCallback;
};

/**
 * @param {Array.<string>} descTxts
 */
CommonDialogController.prototype.initDescriptions = function (descTxts, colors) {
    var labelHeight = this._infoLabel.height * this._infoLabel.scaleY;
    var gap = 10;
    var fontName = "common/fonts/win_font_46.fnt";
    var totalHeight = descTxts.length * labelHeight + (descTxts.length - 1) * gap;
    for (var i = 0; i < descTxts.length; ++i) {
        this._descLabels[i] = new cc.LabelBMFont(descTxts[i], fontName);
        this._descLabels[i].x = this._infoLabel.x;
        this._descLabels[i].y = this._infoLabel.y + totalHeight / 2 - (labelHeight + gap) * i - labelHeight * 0.5;
        this._descLabels[i].scaleX = this._infoLabel.scaleX;
        this._descLabels[i].scaleY = this._infoLabel.scaleY;
        if (colors && colors[i]) {
            this._descLabels[i].color = colors[i];
        }
        this.rootNode.addChild(this._descLabels[i]);
    }
};

CommonDialogController.prototype.buttonClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (this._buttonCallback) {
        this._buttonCallback();
    }
    this.close();
};

CommonDialogController.prototype.confirmClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (this._confirmCallback) {
        this._confirmCallback();
    }
    this.close();
};

CommonDialogController.prototype.cancelClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (this._cancelCallback) {
        this._cancelCallback();
    }
    this.close();
};

CommonDialogController.prototype.closeClicked = function (sender) {
    AudioHelper.playBtnClickSound();
    if (this._closeCallback) {
        this._closeCallback();
    }
    this.close();
};

CommonDialogController.createFromCCB = function () {
    return Util.loadNodeFromCCB("casino/casino_dialog.ccbi", null, "CommonDialogController", new CommonDialogController());
};

CommonDialogController.close = function () {
    EventDispatcher.getInstance().dispatchEvent(CommonEvent.CLOSE_COMMON_DIALOG);
};

module.exports = CommonDialogController;