/**
 * Created by qinning on 15/4/27.
 */
var SpinExtraInfo = require("./SpinExtraInfo");
var Util = require("../../common/util/Util");

var RoomExtraInfo = function(){
    /**
     * @type {Object}
     */
    this.roomExtraInfoMap = {};
};

Util.inherits(RoomExtraInfo,SpinExtraInfo);

RoomExtraInfo.prototype.unmarshal = function(jsonObj) {

};
module.exports = RoomExtraInfo;