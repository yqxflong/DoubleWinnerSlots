var PlayerMan = (function () {
    var instance;

    function createInstance() {
        /**
         * protocol type => Protocol
         * @type {object.<string, Protocol>}
         */
        var playerMap = {};

        return {
            /**
             * @param {string} protocolType
             * @param {Protocol} protocol
             */
            addPlayer: function(udid, player) {
                playerMap[udid] = player;
                console.log("add player " + udid + " map size " + Object.keys(playerMap).length);
            },

            /**
             *
             * @param {string} protoType
             * @returns {Protocol}
             */
            getPlayer: function(udid) {
                return playerMap[udid];
            }
        };
    }

    return {
        getInstance: function () {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    };
})();

module.exports = PlayerMan;