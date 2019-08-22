/**
 * Created by liuyue on 15-6-2.
 */
var PomeloClientMan = (function () {
    var instance;

    function createInstance() {
        /**
         * protocol type => Protocol
         * @type {object.<string, Protocol>}
         */
        var clientMan = {};

        return {
            /**
             * @param {string} protocolType
             * @param {Protocol} protocol
             */
            addClient: function(udid, pomeloClient) {
                clientMan[udid] = pomeloClient;
                console.log("add pomelo client for " + udid + " map size " + Object.keys(clientMan).length);
            },

            /**
             *
             * @param {string} protoType
             * @returns {Protocol}
             */
            getClient: function(udid) {
                return clientMan[udid];
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

module.exports = PomeloClientMan;
