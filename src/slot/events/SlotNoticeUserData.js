/**
 * Created by alanmars on 15/4/18.
 */
var SlotNoticeUserData = cc.Class.extend({
    noticeType: 0,

    ctor: function(noticeType) {
        this.noticeType = noticeType;
    }
});

module.exports = SlotNoticeUserData;