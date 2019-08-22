/**
 * Created by alanmars on 15/4/15.
 */
var Line = function () {
    /**
     * @type {Array.<int>}
     */
    this.rows = [];
    /**
     * @type {cc.color}
     */
    this.color = null;
};

Line.prototype = {
    constructor: Line,
    unmarshal: function (jsonObj) {
        var rowComps = jsonObj["rows"];
        for (var i = 0; i < rowComps.length; ++i) {
            this.rows.push(rowComps[i]);
        }
        var colorComps = jsonObj["color"];
        this.color = cc.color(
            colorComps[0],
            colorComps[1],
            colorComps[2],
            colorComps[3]
        );
    }
};

module.exports = Line;