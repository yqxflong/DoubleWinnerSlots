/**
 * Created by alanmars on 15/4/20.
 */
var SlotUIData = require("./SlotUIData");
var SlotUIType = require("./SlotUIType");

var SlotUIChangeBetData = SlotUIData.extend({
    betLevel: 0,
    ctor: function(betLevel){
        this._super(SlotUIType.SLOT_CHANGE_BET_ITEM_TRIGGERED);
        this.betLevel = betLevel;
    }
});

module.exports = SlotUIChangeBetData;