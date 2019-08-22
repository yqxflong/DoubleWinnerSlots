/**
 * Created by alanmars on 15/7/23.
 */
var WinEffect = function (jsonObj) {
    this.effectName = jsonObj["effectName"];
    this.effectDuration = jsonObj["effectDuration"];
};

module.exports = WinEffect;