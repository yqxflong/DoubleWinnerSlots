var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var PopupMan = require("../../common/model/PopupMan");
var SlotConfigMan = require("../config/SlotConfigMan");
var SlotSceneType = require("../enum/SlotSceneType");

/**
 * Created by qinning on 15/6/26.
 */
var PayTableDescriptionController = function () {
    BaseCCBController.call(this);
    this._image = null;
    this._title = null;
    this._content = null;
};

Util.inherits(PayTableDescriptionController, BaseCCBController);


PayTableDescriptionController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
}
/**
 *
 * @param {SubjectDescription} desc
 * @param {string} subjectName
 * @param {boolean} centerImg
 * @returns {cc.Node|null}
 */
PayTableDescriptionController.prototype.initWith = function (desc, subjectName, centerImg) {
    if (desc.centerImage) {
        this._image.x = 0;
        this._image.y = 5;
        this._title.visible = false;
        this._content.visible = false;
        this._image.setAnchorPoint(cc.p(0.5, 0.5));
    }
    else {
        this._title.setString(desc.title);
        this._content.setString(desc.content);
    }
    var payTableFileName = desc.image;
    var spriteFrame = cc.spriteFrameCache.getSpriteFrame(payTableFileName);
    if(!spriteFrame) {
        var sprite = new cc.Sprite(payTableFileName);
        this._image.setSpriteFrame(sprite.getSpriteFrame());
    } else {
        this._image.setSpriteFrame(spriteFrame);
    }

};

PayTableDescriptionController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

/**
 *
 * @param {SubjectDescription} desc
 * @param {string} subjectName
 * @param {boolean} centerImg
 * @returns {cc.Node|null}
 */
PayTableDescriptionController.createFromCCB = function(desc, subjectName) {
    var node = Util.loadNodeFromCCB(Util.sprintf("slot/paytable/paytable_description_%s.ccbi", desc.descriptionTemplateId), null, "PayTableDescriptionController", new PayTableDescriptionController());
    node.controller.initWith(desc, subjectName);
    return node;
};

module.exports = PayTableDescriptionController;