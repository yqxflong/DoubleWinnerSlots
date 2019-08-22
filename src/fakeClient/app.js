/**
 * Created by alanmars on 15/4/14.
 */
var ProtocolRegistry = require("./protocol/ProtocolRegistry");
var PomeloClient = require('./lib/clientForServer');
var PomeloClientMan = require('./model/PomeloClientMan');
var ProtocolMan = require('../common/protocol/ProtocolMan');
var appOption = require('./appOption');
var async = require('async');

ProtocolRegistry.register();

var host = appOption.host;
var port = appOption.port;
var count = appOption.count;

console.log("host " + host + " port " + port + " player count " + count);

var i = 0;

async.whilst (
    function () {
        return i < count;
    },
    function(callback) {
        i++;

        console.log("start client " + i);
        var client = new PomeloClient();
        client.init({
            host: host,
            port: port,
            log: true
        }, function (ws) {
            var C2SLogin = require("./protocol/C2SLogin");
            var c2slogin = new C2SLogin();
            c2slogin.udid = 'udid' + i;
            PomeloClientMan.getInstance().addClient(c2slogin.udid, client);
            c2slogin.facebookId = '';
            c2slogin.platformType = 0;
            c2slogin.send(c2slogin.udid);

            callback(null);
        });

        client.on("onProtocol", function (data) {
            console.log("onProtocol " + JSON.stringify(data));
            var protoCtor = ProtocolMan.getInstance().getProtocol(data["type"]);
            if (protoCtor) {
                var protocol = new protoCtor();
                protocol.unmarshal(data);
                protocol.execute();
            }
        });

    },
    function() {
        console.log("all players started");
    }
)



