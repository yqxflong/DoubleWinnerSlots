/**
 * Created by alanmars on 15/6/18.
 */
var NormalSpinLayer = require("./NormalSpinLayer");

var MultiNormalSpinLayer = NormalSpinLayer.extend({
    winGroupIndex: 0,

    ctor: function (subjectTmplId, panelId) {
        this._super(subjectTmplId, panelId);
    },

    blinkAllWinLines: function () {
        this.blinkWinFrameInAllWinLines();
        this.linesNode.runAction(cc.sequence(cc.delayTime(1.0), cc.callFunc(this.onBlinkAllWinLinesCompleted, this)));
    }
});

module.exports = MultiNormalSpinLayer;