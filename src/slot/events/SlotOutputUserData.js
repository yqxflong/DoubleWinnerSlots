/**
 * Created by alanmars on 15/4/18.
 */
var SlotOutputUserData = cc.Class.extend({
    output: null,

    /**
     * @param {string} output
     */
    ctor: function(output) {
        this.output = output;
    }
});

module.exports = SlotOutputUserData;