/**
 * Created by qinning on 16/3/2.
 */

var FriendsType = require("../enum/FriendsType");

var FriendsMan = cc.Class.extend({
    PAGE_COUNT: 12,

    friendsMap: null,

    pageIndex: 0,
    friendsType: 0,

    ctor: function () {
        this.friendsType = FriendsType.FRIENDS_TYPE_INVITABLE;
        this.friendsMap = {};
    },

    setPageIndex: function (pageIndex) {
        this.pageIndex = pageIndex;
    },

    getPageIndex: function () {
        return this.pageIndex;
    },

    addPageIndex: function () {
        if (this.pageIndex + 1 < this.getTotalPageCount()) {
            ++this.pageIndex;
            return true;
        }
        return false;
    },

    subPageIndex: function () {
        if (this.pageIndex - 1 >= 0) {
            --this.pageIndex;
            return true;
        }
        return false;
    },

    getTotalPageCount: function () {
        var friendsList = this.getCurFriendsList();
        if (friendsList) {
            return Math.ceil(friendsList.length / this.PAGE_COUNT);
        }
        return 0;
    },

    getFriendsByPageIndex: function (pageIndex) {
        var friendsList = this.getCurFriendsList();
        if (friendsList) {
            return friendsList.slice(pageIndex * this.PAGE_COUNT, Math.min((pageIndex + 1) * this.PAGE_COUNT, friendsList.length));
        }
        return [];
    },

    getCurPageFriends: function () {
        return this.getFriendsByPageIndex(this.pageIndex);
    },

    isFirstFriendsPage: function () {
        return (this.pageIndex == 0);
    },

    isLastFriendsPage: function () {
        var friendsList = this.getCurFriendsList();
        if (friendsList) {
            return ((this.pageIndex + 1) * this.PAGE_COUNT >= friendsList.length);
        } else {
            return false;
        }
    },

    getFriendsListByPrefix: function (namePrefix) {
        var nameRegix = new RegExp(namePrefix, "i");
        var searchFriendList = [];
        var friendsList = this.friendsMap[FriendsType.FRIENDS_TYPE_INVITABLE];
        for (var i = 0; i < friendsList.length; ++i) {
            var friend = friendsList[i];
            if (nameRegix.test(friend.name)) {
                searchFriendList.push(friend);
            }
        }
        return searchFriendList;
    },

    getCurFriendsList: function () {
        return this.friendsMap[this.friendsType];
    },

    getFriendsByType: function (friendsType) {
        return this.friendsMap[friendsType];
    },

    setSelectedAll: function (selectedAll) {
        var friendsList = this.getCurFriendsList();
        if (friendsList) {
            for (var i = 0; i < friendsList.length; ++i) {
                friendsList[i].isSelected = selectedAll;
            }
        }
    },

    setCurFriendsType: function (friendsType) {
        this.friendsType = friendsType;
    },

    getCurFriendstype: function () {
        return this.friendsType;
    },

    setFriendsByType: function (friendsType, friendsList) {
        this.friendsMap[friendsType] = friendsList;
    }
});

FriendsMan._instance = null;
FriendsMan._firstUseInstance = true;

/**
 *
 * @returns {FriendsMan}
 */
FriendsMan.getInstance = function () {
    if (FriendsMan._firstUseInstance) {
        FriendsMan._firstUseInstance = false;
        FriendsMan._instance = new FriendsMan();
    }
    return FriendsMan._instance;
};

module.exports = FriendsMan;