/**
 * Created by alanmars on 15/4/16.
 */
var Coordinate = function() {
    this.col = 0;
    this.row = 0;
};

Coordinate.prototype = {
    constructor: Coordinate,
    unmarshal: function(jsonObj) {
        this.col = jsonObj["col"];
        this.row = jsonObj["row"];
    }
};

module.exports = Coordinate;