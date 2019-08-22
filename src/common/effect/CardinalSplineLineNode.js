/**
 * Created by JianWang on 7/21/16.
 */
var AntialiasingLineNode = require("./AntialiasingLineNode");

var CardinalSplineLineNode = AntialiasingLineNode.extend({
     _tension:1,
    _segments:5,
    ctor:function(pointsOnLine, lineWidth, lineColor, tension, segments) {

        this._tension = tension;
        this._segments = segments;
        this._super(pointsOnLine, lineWidth, lineColor);
    },

    cardinalSplineAt:function (p0, p1, p2, p3, tension, t) {
        var t2 = t * t;
        var t3 = t2 * t;

        /*
         * Formula: s(-ttt + 2tt - t)P1 + s(-ttt + tt)P2 + (2ttt - 3tt + 1)P2 + s(ttt - 2tt + t)P3 + (-2ttt + 3tt)P3 + s(ttt - tt)P4
         */
        var s = (1 - tension) / 2;

        var b1 = s * ((-t3 + (2 * t2)) - t);                      // s(-t3 + 2 t2 - t)P1
        var b2 = s * (-t3 + t2) + (2 * t3 - 3 * t2 + 1);          // s(-t3 + t2)P2 + (2 t3 - 3 t2 + 1)P2
        var b3 = s * (t3 - 2 * t2 + t) + (-2 * t3 + 3 * t2);      // s(t3 - 2 t2 + t)P3 + (-2 t3 + 3 t2)P3
        var b4 = s * (t3 - t2);                                   // s(t3 - t2)P4

        var x = (p0.x * b1 + p1.x * b2 + p2.x * b3 + p3.x * b4);
        var y = (p0.y * b1 + p1.y * b2 + p2.y * b3 + p3.y * b4);
        return cc.p(x, y);
    },

    getControlPointAt:function (controlPoints, pos) {
        var p = Math.min(controlPoints.length - 1, Math.max(pos, 0));
        return controlPoints[p];
    },

    generateExtraVertices:function (pointsOnLine) {

        var _t = this;

        var vertices = [], p, lt, deltaT = 1.0 / pointsOnLine.length;

        for (var i = 0; i < _t._segments + 1; i++) {

            var dt = i / _t._segments;
             // border
            if (dt === 1) {
                p = pointsOnLine.length - 1;
                lt = 1;
            } else {
                p = 0 | (dt / deltaT);
                lt = (dt - deltaT * p) / deltaT;
            }

            // Interpolate
            var newPos = _t.cardinalSplineAt(
                _t.getControlPointAt(pointsOnLine, p - 1),
                _t.getControlPointAt(pointsOnLine, p - 0),
                _t.getControlPointAt(pointsOnLine, p + 1),
                _t.getControlPointAt(pointsOnLine, p + 2),
                _t._tension, lt);
            vertices.push(newPos);
        }
        return vertices;
    },
});

module.exports = CardinalSplineLineNode;