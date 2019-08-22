var Util = require("../../common/util/Util");
var BaseCCBController = require("../../common/controller/BaseCCBController");
var DialogManager = require("../../common/popup/DialogManager");
var AudioHelper = require("../../common/util/AudioHelper");
var StorageController = require("../storage/StorageController");
var ServerURLType = require("../enum/ServerURLType");
var PomeloClient = require("../net/PomeloClient");
var Config = require("../util/Config");
var SocialMan = require("../../social/model/SocialMan");
var PlayerMan = require("../../common/model/PlayerMan");
var PopupMan = require("../../common/model/PopupMan");
var FaceBookMan = require("../../social/model/FaceBookMan");
var ThemeName = require("../../common/enum/ThemeName");

var SelectServerItemController = function () {
    BaseCCBController.call(this);
    this._serverNameLabel = null;
    this._serverUrlPortLabel = null;
    this._bgIcon = null;

    this.itemWidth = 0;
    this.itemHeight = 0;
    this._serverItem = null;
    this._parentNode = null;
};

Util.inherits(SelectServerItemController, BaseCCBController);


SelectServerItemController.prototype.onEnter = function () {

};

SelectServerItemController.prototype.onExit = function () {

};

SelectServerItemController.prototype.onDidLoadFromCCB = function() {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    this.itemWidth = this._bgIcon.width;
    this.itemHeight = this._bgIcon.height;
};

SelectServerItemController.prototype.initWith = function (serverItem, parent) {
    this._serverItem = serverItem;
    this._parentController = parent;
    this._serverNameLabel.setString(serverItem.serverName);
    this._serverUrlPortLabel.setString(serverItem.serverUrl + ":" + serverItem.serverPort);
    this._serverUrlPortLabel.visible = false;
};

SelectServerItemController.prototype.selectClicked = function (event) {
    StorageController.getInstance().setItem("host", this._serverItem.serverUrl);
    StorageController.getInstance().setItem("port", this._serverItem.serverPort);
    if(!cc.sys.isNative) {
        PopupMan.popupIndicator();
        PomeloClient.getInstance().init(this._serverItem.serverUrl, this._serverItem.serverPort, function () {
            var SceneMan = require("../../common/model/SceneMan");
            if(Config.isRelease() || Config.isDebug()) {
                SocialMan.getInstance().fbLogin(function (type, response) {
                    if (type == 0) {
                        //PlayerMan.getInstance().loginWithFacebook(response);
                        FaceBookMan.getInstance().getMyFriendsList(function (error, friendsList) {
                            if (!error) {
                                response["friendCount"] = friendsList.length;
                            } else {
                                response["friendCount"] = 0;
                            }
                            PlayerMan.getInstance().loginWithFacebook(response);
                        });
                    } else {
                        PopupMan.popupCommonDialog("WARNING", ["Connect to Facebook failed"], "Ok", null, null, false);
                    }
                });
            } else {
                PlayerMan.getInstance().loginWithGuest();
            }
        });
    }

    this._parentController.close();
};

SelectServerItemController.createFromCCB = function () {
    return Util.loadNodeFromCCB("server/select_server_item.ccbi", null, "SelectServerItemController", new SelectServerItemController());
};

module.exports = SelectServerItemController;