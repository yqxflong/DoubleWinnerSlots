/**
 * Created by alanmars on 15/4/22.
 * @param jsonObj
 */
var Player = function() {
    this.id = null;
    this.udid = null;
    this.facebookId = null;
    this.chips = 0;
    //this.gold = 0;
    this.level = 0;
    this.exp = 0;
    this.levelUpExp = 0;
    this.purchaseCount = 0;
};

Player.prototype.unmarshal = function(jsonObj) {
    this.id = jsonObj.id;
    this.facebookId = jsonObj.facebookId;
    this.chips = jsonObj.chips;
    //this.gold = jsonObj.gold;
    this.udid = jsonObj.udid;
    this.level = jsonObj.level;
    this.exp = jsonObj.exp;
    this.levelUpExp = jsonObj.levelUpExp;
    this.purchaseCount = jsonObj.purchaseCount;

    this.bet = 0;
};

Player.prototype.onLogin = function() {
    console.log("player " + this.id + " login");

    var C2SGetSubjects = require("../protocol/C2SGetSubjects");
    var getSubjects = new C2SGetSubjects();
    getSubjects.send(this.udid);
};

Player.prototype.onGetSubjects = function(subjects) {
    console.log("player " + this.id + " get subjects count " + subjects.length);

    var C2SEnterRoom = require("../protocol/C2SEnterRoom");
    var enterRoomProto = new C2SEnterRoom();
    enterRoomProto.subjectId = 1;
    enterRoomProto.send(this.udid);

    this.subjectId = enterRoomProto.subjectId;
};

Player.prototype.onEnterRoom = function() {
    console.log("player " + this.id + " enter room");

    var C2SSpin = require("../protocol/C2SSpin");
    var proto = new C2SSpin();
    proto.bet = 1000;
    proto.lineNum = 1;
    proto.betGrade = 1;
    proto.send(this.udid);

    this.bet = proto.bet;
};

Player.prototype.addChips = function(delta) {
    this.chips += delta;
    console.log("player " + this.id + " chips delta " + delta + " to " + this.chips);
};

Player.prototype.onSpinRes = function(spinResult) {
    if (spinResult.subjectId == this.subjectId) {
        this.addChips(-this.bet);
        for (var i = 0; i < spinResult.result.length; ++i) {
            this.addChips(spinResult.result[i].chips);
        }
    }

    var self = this;
    setTimeout(function() {
        var C2SSpin = require("../protocol/C2SSpin");
        var proto = new C2SSpin();
        proto.bet = 1000;
        proto.lineNum = 1;
        proto.betGrade = 1;
        proto.send(self.udid);

        self.bet = proto.bet;
    }, 1000);
};


module.exports = Player;