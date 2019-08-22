/**
 * Created by ZenQhy on 16/4/27.
 */

var ConnectedColData = function() {
    this.minRow = -1;
    this.maxRow = -1;
};

ConnectedColData.prototype = {
    constructor: ConnectedColData,

    getConnectedHeight: function () {
        if(this.minRow == -1 || this.maxRow == -1) return 0;
        return this.maxRow - this.minRow + 1;
    }
};

module.exports = ConnectedColData;