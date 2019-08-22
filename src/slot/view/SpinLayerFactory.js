var SpinLayerType = require("../enum/SpinLayerType");
var NormalSpinLayer = require("./NormalSpinLayer");
var ClassicSpinLayer = require("./ClassicSpinLayer");

// Double winner
var MagicWorld60101SpinLayer = require("./MagicWorld60101SpinLayer");
var MagicWorld60102SpinLayer = require("./MagicWorld60102SpinLayer");
var MagicWorld60103SpinLayer = require("./MagicWorld60103SpinLayer");
var MagicWorld60104SpinLayer = require("./MagicWorld60104SpinLayer");
var MagicWorld60105SpinLayer = require("./MagicWorld60105SpinLayer");
var MagicWorld60106SpinLayer = require("./MagicWorld60106SpinLayer");
var MagicWorld60107SpinLayer = require("./MagicWorld60107SpinLayer");
var MagicWorld60108SpinLayer = require("./MagicWorld60108SpinLayer");
var MagicWorld60109SpinLayer = require("./MagicWorld60109SpinLayer");
var MagicWorld60110SpinLayer = require("./MagicWorld60110SpinLayer");

//SPIN_LAYER_TUNNELS_OF_FEAR
/**
 * Created by alanmars on 15/5/26.
 */
var SpinLayerFactory = {
    /**
     * @param {SpinLayerType} spinLayerType
     * @param {number} subjectTmplId
     * @param {number} panelId
     * @returns {SpinLayer}
     */
    createSpinLayer: function (spinLayerType, subjectTmplId, panelId) {
        var result;
        switch (spinLayerType) {
            case SpinLayerType.SPIN_LAYER_NORMAL:
                result = new NormalSpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_CLASSIC:
                result = new ClassicSpinLayer(subjectTmplId, panelId);
                break;

            //Double winner
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_01:
                result = new MagicWorld60101SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_02:
                result = new MagicWorld60102SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_03:
                result = new MagicWorld60103SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_04:
                result = new MagicWorld60104SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_05:
                result = new MagicWorld60105SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_06:
                result = new MagicWorld60106SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_07:
                result = new MagicWorld60107SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_08:
                result = new MagicWorld60108SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_09:
                result = new MagicWorld60109SpinLayer(subjectTmplId, panelId);
                break;
            case SpinLayerType.SPIN_LAYER_MAGIC_WORLD_10:
                result = new MagicWorld60110SpinLayer(subjectTmplId, panelId);
                break;
        }
        return result;
    }
};

module.exports = SpinLayerFactory;