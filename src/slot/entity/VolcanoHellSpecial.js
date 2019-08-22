
var VolcanoHellSpecial = function () {
    /**
     * @type {Array}
     */
    this.scatterWins = null;
};

VolcanoHellSpecial.prototype.unmarshal = function (jsonObj) {
    this.scatterWins = jsonObj["scatterWins"];
};

module.exports = VolcanoHellSpecial;