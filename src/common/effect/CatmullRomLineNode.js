/**
 * Created by JianWang on 7/21/16.
 */
var CardinalSplineLineNode = require("./CardinalSplineLineNode");

var CatmullRomLineNode = CardinalSplineLineNode.extend({

    ctor:function(pointsOnLine, lineWidth, lineColor, segments) {
         this._super(pointsOnLine, lineWidth, lineColor,0.5,segments);
    }
});

module.exports = CatmullRomLineNode;