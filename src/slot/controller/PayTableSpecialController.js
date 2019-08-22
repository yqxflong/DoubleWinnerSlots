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

var MAX_ICON_COUNT = 5;

var PayTableSpecialController = function () {
    BaseCCBController.call(this);
    this._iconArray = [];
    this._titleArray = [];
    this._contentArray = [];
};

Util.inherits(PayTableSpecialController, BaseCCBController);

PayTableSpecialController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    for (var i = 0; i < MAX_ICON_COUNT; ++ i) {
        this._iconArray[i] = this.rootNode.getChildByTag(1 + i*10);
        this._titleArray[i] = this.rootNode.getChildByTag(2 + i*10);
        this._contentArray[i] = this.rootNode.getChildByTag(3 + i*10);
    }
};

/**
 *
 * @param {SubjectTmpl} subjectTmpl
 * @returns {cc.Node|null}
 */
PayTableSpecialController.prototype.initWith = function (subjectTmpl) {
    var desc = subjectTmpl.specialDescription;
    var i;
    for (i = 0; i < desc.specialIds.length; ++i) {
        var symbolConfig = subjectTmpl.getSymbol(desc.specialIds[i]);
        if (symbolConfig != null) {
            if (symbolConfig.imgName.length > 0) {
                this._iconArray[i].setSpriteFrame(cc.spriteFrameCache.getSpriteFrame(symbolConfig.imgName));
            }
            this._titleArray[i].setString(desc.specialTitles[i]);
            this._contentArray[i].setString(desc.specialDescriptions[i]);
        }
    }
    while (i < MAX_ICON_COUNT) {
        if (this._iconArray[i] != null) {
            this._iconArray[i].visible = false;
            this._titleArray[i].visible = false;
            this._contentArray[i].visible = false;
        }
        else {
            break;
        }
        ++i;
    }
};

PayTableSpecialController.prototype.popup = function () {
    DialogManager.getInstance().popup(this.rootNode);
};

/**
 *
 * @param {SubjectTmpl} subjectTmpl
 * @returns {cc.Node|null}
 */
PayTableSpecialController.createFromCCB = function(subjectTmpl) {
    var node = Util.loadNodeFromCCB(Util.sprintf("slot/paytable/paytable_special_%s.ccbi", subjectTmpl.specialDescription.specialTemplateId), null, "PayTableSpecialController", new PayTableSpecialController());
    node.controller.initWith(subjectTmpl);
    return node;
};

module.exports = PayTableSpecialController;