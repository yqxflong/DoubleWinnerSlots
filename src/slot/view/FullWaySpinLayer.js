/**
 * Created by alanmars on 15/6/18.
 */
var MultiNormalSpinLayer = require("./MultiNormalSpinLayer");

var FullWaySpinLayer = MultiNormalSpinLayer.extend({
    ctor: function (subjectTmplId, panelId) {
        this._super(subjectTmplId, panelId);
    }
});

module.exports = FullWaySpinLayer;