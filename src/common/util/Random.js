/**
 * Created by alanmars on 15/7/15.
 */
var Random = {
    /**
     * @param upperValue
     * @returns {number}
     */
    nextInt: function(upperValue) {
        return Math.floor(Math.random() * upperValue);
    },

    /**
     * randomly pick some integers from [0, n)
     * @param {number} n
     * @param {number} pick
     * @returns {Array.<number>}
     */
    pick: function(n, pickCount) {
        var ret = [];
        var data = [];
        var i;
        for (i = 0; i < n; ++ i) {
            data[i] = i;
        }

        for (i = 0; i < pickCount; ++ i) {
            var pos = this.nextInt(n);
            ret[i] = data[pos];
            data[pos] = data[n - 1];
            -- n;
        }

        return ret;
    }
};

module.exports = Random;