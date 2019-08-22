/**
 * Created by qinning on 15/5/8.
 */
var GameDirector = require("../../common/model/GameDirector");
var Config = require("../../common/util/Config");
var ServerURLType = require("../../common/enum/ServerURLType");
var FriendInfo = require("../../social/entity/FriendInfo");
var PERMISSIONS = ["public_profile", "email", "user_friends"];
var FB_CODE_SUCCESS = 0;
var FB_ACTION_GET = 0;
var FB_ACTION_POST = 1;
var FaceBookMan = cc.Class.extend({

    INVITABLE_FRIENDS_COUNT: "1000",
    facebook_is_canvas: false,
    friendsList: null,
    myFriendsList: null,
    facebook: null,
    ctor: function () {
        if (zensdk.facebookInstance) {
            this.facebook = zensdk.facebookInstance();
        } else {
            throw new Error("zensdk.facebookInstance not found");
        }
    },

    /**
    * @param {string} eventName
    * @param {map} params
    */
    logEvent: function(eventName, value, params){
        this.facebook.logEvent(eventName, value, params);
    },

    /**
     * @param {Function} func
     */
    login: function (func) {
        var self = this;
        if (!this.facebook.isLoggedIn()) {
            this.facebook.login(PERMISSIONS, function (type, msg) {
                cc.log("type is " + type + " msg is " + JSON.stringify(msg));
                if (type == zensdk.CODE_SUCCEED) {
                    self.requireUserInfo(func);
                } else {
                    func(type);
                }
            });
        } else {
            this.requireUserInfo(func);
        }
    },

    /**
     * login with permissions
     * @param {Array.<string>} permissions
     * @param {Function} func
     */
    loginWithPermissions: function (permissions, func) {
        this.facebook.login(permissions, function (type, msg) {
            cc.log("type is " + type + " msg is " + JSON.stringify(msg));
            func(type, msg);
        });
    },

    /**
     * logout
     */
    logout: function () {
        this.facebook.logout(function (type, msg) {
            cc.log(JSON.stringify(msg));
        });
    },


    /**
     * @param {Function} func
     * {"id":"12","name":"","first_name":"",
     * "last_name":"","email":"","gender":"male","timezone":8,
     * "link":"https://www.facebook.com/app_scoped_user_id/123/","locale":"zh_CN"}
     */
    requireUserInfo: function (func) {
        this.facebook.api("/me", zensdk.HttpMethod.GET, {"fields": "id,name,first_name,last_name,email,gender,timezone,link,locale"}, function (type, response) {
            console.log("response:" + JSON.stringify(response));
            if (type == zensdk.CODE_SUCCEED) {
                func(zensdk.CODE_SUCCEED, response);
            } else {
                func(type);
                cc.log("Graph API request failed, error #: " + response);
            }
        });
    },

    getToken: function () {
        return facebook.getAccessToken();
    },

    /**
     *
     * @param productId
     * @param func
     */
    payment: function (productId, func) {
        if (!cc.sys.isNative) {
            var info = {
                product: Config.getServerURL(ServerURLType.PURCHASE_URL) + productId
            };

            var self = this;
            this.facebook.canvas.pay(info, function (code, response) {
                if (code == zensdk.CODE_SUCCEED) {
                    cc.log("payment response:" + JSON.stringify(response));
                    if (response['status'] === 'completed') {
                        func(zensdk.CODE_SUCCEED);
                        cc.log("Payment succeeded: " + response['amount'] + response['currency']);
                    }
                    else {
                        func(zensdk.PaymentResult.kPaymentFail);
                        cc.log("Payment failed: " + JSON.stringify(response['status']));
                    }
                } else {
                    func(zensdk.PaymentResult.kPaymentFail);
                    cc.log("Request send failed, error #" + code + ": " + JSON.stringify(response));
                }
            });
        } else {
            func(zensdk.PaymentResult.kPaymentNotSupport);
            cc.log("canvas.pay is only available for Facebook Canvas App");
        }
    },

    /**
     * judge user is granted permission
     * @param {string} permission
     * @param {Function} callback
     */
    hasPermission: function (permission, callback) {
        this.facebook.api("/me/permissions", zensdk.HttpMethod.GET, {}, function (type, response) {
            if (type == zensdk.CODE_SUCCEED) {
                for (var i = 0; i < response.length; ++i) {
                    if (response[i].permission === permission) {
                        callback(true);
                        return;
                    }
                }
                callback(false);
                return;
            }
            else {
                //self.result.setString(JSON.stringify(data));
                callback(false);
                return;
            }
        });
    },

    _getInvitableFriendsListLocal: function (callback) {
        var self = this;
        this.facebook.api("/me/invitable_friends", zensdk.HttpMethod.GET, {"limit": self.INVITABLE_FRIENDS_COUNT}, function (type, response) {
            console.log("response:" + JSON.stringify(response));
            if (type == zensdk.CODE_SUCCEED) {
                var friendsList = response.data;
                self.friendsList = [];
                for (var i = 0; i < friendsList.length; ++i) {
                    var friend = new FriendInfo();
                    friend.unmarshal(friendsList[i]);
                    self.friendsList.push(friend);
                }
                callback(type, self.friendsList);
            } else {
                callback(type, null);
            }
        });
    },

    /**
     * remove invited friends and return current friends list
     * @param {Array.<string>} friendsIds
     * @returns {Array|null}
     */
    removeInvitedFriends: function (friendsIds) {
        if (friendsIds && friendsIds.length > 0 && this.friendsList && this.friendsList.length > 0) {
            for (var j = this.friendsList.length - 1; j >= 0; --j) {
                for (var i = 0; i < friendsIds.length; ++i) {
                    if (friendsIds[i].id === this.friendsList[j].id) {
                        this.friendsList.splice(j, 1);
                        break;
                    }
                }
            }
        }
        return this.friendsList;
    },

    /**
     * get friends list
     * @param {Function} callback
     */
    getFriendsList: function (callback) {
        if (this.friendsList) {
            callback(zensdk.CODE_SUCCEED, this.friendsList);
            return;
        }
        var self = this;
        if (!this.facebook.isLoggedIn()) {
            this.facebook.login(PERMISSIONS, function (type, msg) {
                if (type == zensdk.CODE_SUCCEED) {
                    self._getInvitableFriendsListLocal(callback);
                } else {
                    callback(type, null);
                }
            });
        } else {
            self._getInvitableFriendsListLocal(callback);
        }
    },

    /**
     * invite friends
     * @param {Array.<string>} friendsIdList
     * @param {string} message
     */
    inviteFriends: function (friendsIdList, message, func) {
        var map = {
            "message": message,
            "to": friendsIdList.join(",")
        };
        cc.log("friendsIdList:" + friendsIdList.join(","));
        var self = this;
        this.facebook.appRequest(map, function (code, response) {
            cc.log("response:" + JSON.stringify(response));
            var invitedFbArr = response["to"];
            if (code == zensdk.CODE_SUCCEED) {
                //success
                for (var i = 0; i < friendsIdList.length; ++i) {
                    for (var j = 0; j < self.friendsList.length; ++j) {
                        if (friendsIdList[i] === self.friendsList[j].id) {
                            self.friendsList.splice(j, 1);
                            break;
                        }
                    }
                }
                func(code, invitedFbArr, self.friendsList);
                cc.log("msg:" + JSON.stringify(response));
            } else {
                //fail
                func(code);
                cc.log("msg:" + JSON.stringify(response));
            }
        });
    },

    /**
     * invite friends by facebook dialog
     * @param {string} msg
     * @param {string} title
     */
    inviteFriendsByDialog: function (msg, title) {
        var map = {
            "message": msg,
            "title": title
        };
        this.facebook.appRequest(map, function (resultcode, msg) {
            cc.log("info:" + JSON.stringify(msg));
        });
    },

    _getMyFriendsListLocal: function (callback) {
        var self = this;
        this.facebook.api("/me/friends", zensdk.HttpMethod.GET, {"fields": "id,name,installed"}, function (type, response) {
            cc.log("response:" + JSON.stringify(response));
            if (type == zensdk.CODE_SUCCEED) {
                self.myFriendsList = response.data;
                //var paging = response.paging;
                //var summary = response.summary;
                //var total_count = response.total_count;
                callback(type, self.myFriendsList);
            } else {
                callback(type, null);
            }
        });
    },

    getMyFriendsList: function (callback) {
        if (this.myFriendsList) {
            callback(zensdk.CODE_SUCCEED, this.myFriendsList);
            return;
        }
        var self = this;
        if (!this.facebook.isLoggedIn()) {
            this.facebook.login(PERMISSIONS, function (type, msg) {
                if (type == zensdk.CODE_SUCCEED) {
                    self._getMyFriendsListLocal(callback);
                } else {
                    callback(type, null);
                }
            });
        } else {
            self._getMyFriendsListLocal(callback);
        }
    },

    shareDialog: function (name, message, caption, description, picture, deepLinkURL, callback) {
        var map = {
            "dialog": "shareLink",
            "name": name,
            "message": message,
            "caption": caption,
            "description": description,
            "picture": picture,
            "link": deepLinkURL
        };

        map.dialog = "shareLink";
        if (!this.facebook.canPresentDialog(map)) {
            map.dialog = "feedDialog";
        }
        this.facebook.dialog(map, function (errorCode, msg) {
            callback(errorCode);
            cc.log(msg);
        });
    },

    shareOpenGraph: function (domain, action, param, callback) {
        var path = "me/" + domain + ":" + action;
        var hm = cc.sys.isNative ? FB_ACTION_POST : 'POST';

        if (cc.sys.isNative) {
            param["request_publish"] = true;
        }
        this.facebook.api(path, hm, param, function (type, response) {
            cc.log("response:" + JSON.stringify(response));
            if (type === FB_CODE_SUCCESS) {
                callback(type);
            } else {
                callback(type);
            }
        });
    },

    shareFeed: function (name, message, caption, description, picture, deepLinkURL, callback) {
        var param = {
            "name": name,
            "message": message,
            "caption": caption,
            "description": description,
            "picture": picture,
            "link": deepLinkURL,
            "privacy": "{'value': 'EVERYONE'}"
        };

        var hm = cc.sys.isNative ? FB_ACTION_POST : 'POST';

        this.facebook.api("me/feed", hm, param, function (type, response) {
            cc.log("me/feed response:" + JSON.stringify(response));
            callback(type);
        });
    }
});

FaceBookMan._instance = null;
FaceBookMan._firstUseInstance = true;

/**
 *
 * @returns {FaceBookMan}
 */
FaceBookMan.getInstance = function () {
    if (FaceBookMan._firstUseInstance) {
        FaceBookMan._firstUseInstance = false;
        FaceBookMan._instance = new FaceBookMan();
    }
    return FaceBookMan._instance;
};

module.exports = FaceBookMan;