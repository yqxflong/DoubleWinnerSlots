/**
 * Created by qinning on 15/7/10.
 */
var Util = require("../../common/util/Util");
var Coordinate = require("./Coordinate");

var MultiplePos = function(){
    this.multiple = 0;
    /**
     * @type {Coordinate}
     */
    this.pos = 0;
};

MultiplePos.prototype.unmarshal = function(jsonObj) {
    this.multiple = jsonObj["multiple"];
    this.pos = new Coordinate();
    this.pos.unmarshal(jsonObj["pos"]);
};

module.exports = MultiplePos;