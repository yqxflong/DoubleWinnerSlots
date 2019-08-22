var ProtocolType = require("../../common/enum/ProtocolType");
var Util = require("../../common/util/Util");
var SlotProtocol = require("./LogicProtocol");
var PlayerMan = require("../model/PlayerMan");
var SpinPanel = require("../../slot/entity/SpinPanel");

/**
 * Created by qinning on 15/4/27.
 */
var S2CSpin = function() {
    SlotProtocol.call(this, ProtocolType.Slot.C2S_SPIN);
    this.errorCode = 0;
    /**
     *
     * @type {Vector.<SpinPanel>}
     */
    this.result = [];
    this.isFreeSpin = 0;
    this.subjectId = -1;
    //this.syncExp = new LevelExp();
    this.betGrade = 0;

};

Util.inherits(S2CSpin, SlotProtocol);

S2CSpin.prototype.execute = function(udid) {
    //PlayerMan.getInstance().onLogin(this);
    //cc.director.runScene(new SlotLobbyScene());
    PlayerMan.getInstance().getPlayer(udid).onSpinRes(this);
};

S2CSpin.prototype.unmarshal = function(jsonObj) {
    //this.player = new Player();
    //this.player.unmarshal(jsonObj["player"]);
    //this.errorCode = jsonObj["code"];
    this.result.length = 0;
    var jsonResult = jsonObj["result"];
    for(var i = 0; i < jsonResult.length; ++i){
        var spinPanel = new SpinPanel();
        spinPanel.unmarshal(jsonResult[i]);
        this.result.push(spinPanel);
    }
    this.isFreeSpin = jsonObj["isFreeSpin"];
    this.subjectId = jsonObj["subjectId"];
    //this.syncExp.unmarshal(jsonObj["syncExp"]);
    this.betGrade = jsonObj["betGrade"] - 1;
};

module.exports = S2CSpin;