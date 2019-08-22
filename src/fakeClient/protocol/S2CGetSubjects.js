var Util = require("../../common/util/Util");
var ProtocolType = require("../../common/enum/ProtocolType");
var SlotProtocol = require("./LogicProtocol");
var Subject = require("../entity/Subject");
var PlayerMan = require("../model/PlayerMan");

/**
 * Created by alanmars on 15/5/27.
 */
var S2CGetSubjects = function () {
    SlotProtocol.call(this, ProtocolType.Slot.S2C_GET_SUBJECTS);
    /**
     * @type {Array.<Subject>}
     */
    this.subjects = null;
};

Util.inherits(S2CGetSubjects, SlotProtocol);

S2CGetSubjects.prototype.execute = function (udid) {
    var player = PlayerMan.getInstance().getPlayer(udid);
    player.onGetSubjects(this.subjects);
};

S2CGetSubjects.prototype.unmarshal = function (jsonObj) {
    SlotProtocol.prototype.unmarshal.call(this, jsonObj);

    this.subjects = [];
    var subjects = jsonObj["subjects"];
    for(var i = 0; i < subjects.length; ++i) {
        var subject = new Subject();
        subject.unmarshal(subjects[i]);
        this.subjects.push(subject);
    }
};


module.exports = S2CGetSubjects;