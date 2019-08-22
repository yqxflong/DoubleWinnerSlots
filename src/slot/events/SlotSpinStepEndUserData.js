/**
 * Created by alanmars on 15/4/18.
 */
var SlotSpinStepEndUserData = cc.Class.extend({
    subType: 0,
    panelId: 0,

    ctor: function (subType, panelId) {
        this.subType = subType;
        this.panelId = panelId;
    }
});

module.exports = SlotSpinStepEndUserData;