/**
 * Created by ZenQhy on 16/6/12.
 */

var Util = require("../../common/util/Util");

var MultipleWild = function(){
    this.wildCol = 0;
    this.wildBaseRow = 0;
    this.multiple = 0;
};

MultipleWild.prototype.unmarshal = function(jsonObj) {
    this.wildCol = jsonObj["wildCol"];
    this.wildBaseRow = jsonObj["wildBaseRow"];
    this.multiple = jsonObj["multiple"];
};

module.exports = MultipleWild;