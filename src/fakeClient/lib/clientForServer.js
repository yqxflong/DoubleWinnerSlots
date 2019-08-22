/**
 * Created by liuyue on 15-6-1.
 */
var WebSocket = require('ws');
var Protocol = require('pomelo-protocol');
var Package = Protocol.Package;
var Message = Protocol.Message;
var EventEmitter = require('events').EventEmitter;
var protocol = require('pomelo-protocol');
var protobuf = require('pomelo-protobuf');
var Util = require("../../common/util/Util");

//if (typeof Object.create !== 'function') {
//    Object.create = function (o) {
//        function F() {}
//        F.prototype = o;
//        return new F();
//    };
//}

var JS_WS_CLIENT_TYPE = 'js-websocket';
var JS_WS_CLIENT_VERSION = '0.0.1';

var RES_OK = 200;
var RES_OLD_CLIENT = 501;

var Pomelo = function() {
    EventEmitter.call(this);

    this.socket = null;
    this.reqId = 0;
    this.callbacks = {};
    this.handlers = {};
    this.routeMap = {};

    this.heartbeatInterval = 5000;
    this.heartbeatTimeout = this.heartbeatInterval * 2;
    this.nextHeartbeatTimeout = 0;
    this.gapThreshold = 100; // heartbeat gap threshold
    this.heartbeatId = null;
    this.heartbeatTimeoutId = null;
    this.handshakeCallback = null;

    this.initCallback = null;
};

Util.inherits(Pomelo, EventEmitter);

var handshakeBuffer = {
    'sys':{
        type: JS_WS_CLIENT_TYPE,
        version: JS_WS_CLIENT_VERSION
    },
    'user':{
    }
};

Pomelo.prototype.init = function(params, cb){
    this.params = params;
    params.debug = true;
    this.initCallback = cb;
    var host = params.host;
    var port = params.port;

    var url = 'ws://' + host;
    if(port) {
        url +=  ':' + port;
    }

    if (!params.type) {
        console.log('init websocket');
        handshakeBuffer.user = params.user;
        handshakeCallback = params.handshakeCallback;
        this.initWebSocket(url,cb);
    }
};

Pomelo.prototype.initWebSocket = function(url,cb){
    console.log("====="+url);
    var self = this;
    var onopen = function(event){
        console.log("===1==");
        console.log('[pomeloclient.init] websocket connected!');
        var obj = Package.encode(Package.TYPE_HANDSHAKE, Protocol.strencode(JSON.stringify(handshakeBuffer)));
        self.send(obj);
    };
    var onmessage = function(event) {
        //console.log("===2==");
        self.processPackage(Package.decode(event.data), cb);
        // new package arrived, update the heartbeat timeout
        if(self.heartbeatTimeout) {
            self.nextHeartbeatTimeout = Date.now() + self.heartbeatTimeout;
        }
    };
    var onerror = function(event) {
        console.log("===3=="+event);
        self.emit('io-error', event);
        console.log('socket error %j ',event);
    };
    var onclose = function(event){
        console.log("===4==");
        self.emit('close',event);
        console.log('socket close %j ',event);
    };
    this.socket = new WebSocket(url);
    this.socket.binaryType = 'arraybuffer';
    this.socket.onopen = onopen;
    this.socket.onmessage = onmessage;
    this.socket.onerror = onerror;
    this.socket.onclose = onclose;
    console.log("===5==");

    var heartbeatTimeoutCb = function() {
        var gap = self.nextHeartbeatTimeout - Date.now();
        if(gap > self.gapThreshold) {
            self.heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, gap);
        } else {
            console.error('server heartbeat timeout');
            self.emit('heartbeat timeout');
            self.disconnect();
        }
    };

    var heartbeat = function(data) {
        var obj = Package.encode(Package.TYPE_HEARTBEAT);
        if(self.heartbeatTimeoutId) {
            clearTimeout(self.heartbeatTimeoutId);
            self.heartbeatTimeoutId = null;
        }

        if(self.heartbeatId) {
            // already in a heartbeat interval
            return;
        }
        self.heartbeatId = setTimeout(function() {
            self.heartbeatId = null;
            self.send(obj);
            self.nextHeartbeatTimeout = Date.now() + self.heartbeatTimeout;
            self.heartbeatTimeoutId = setTimeout(heartbeatTimeoutCb, self.heartbeatTimeout);
        }, self.heartbeatInterval);
    };


    var handshake = function(data){
        data = JSON.parse(Protocol.strdecode(data));
        if(data.code === RES_OLD_CLIENT) {
            self.emit('error', 'client version not fullfill');
            return;
        }

        if(data.code !== RES_OK) {
            self.emit('error', 'handshake fail');
            return;
        }
        self.handshakeInit(data);
        var obj = Package.encode(Package.TYPE_HANDSHAKE_ACK);
        self.send(obj);
        if(self.initCallback) {
            self.initCallback(self.socket);
            self.initCallback = null;
        }
    };
    var onData = function(data){
        //probuff decode
        var msg = Message.decode(data);
        if(msg.id > 0){
            msg.route = self.routeMap[msg.id];
            delete self.routeMap[msg.id];
            if(!msg.route){
                return;
            }
        }
        msg.body = self.deCompose(msg);
        self.processMessage(msg);
    };

    var onKick = function(data) {
        self.emit('onKick');
    };
    this.handlers[Package.TYPE_HANDSHAKE] = handshake;
    this.handlers[Package.TYPE_HEARTBEAT] = heartbeat;
    this.handlers[Package.TYPE_DATA] = onData;
    this.handlers[Package.TYPE_KICK] = onKick;
};

Pomelo.prototype.disconnect = function() {
    if(this.socket) {
        if(this.socket.disconnect) this.socket.disconnect();
        if(this.socket.close) this.socket.close();
        console.log('disconnect');
        this.socket = null;
    }

    if(this.heartbeatId) {
        clearTimeout(this.heartbeatId);
        this.heartbeatId = null;
    }
    if(this.heartbeatTimeoutId) {
        clearTimeout(this.heartbeatTimeoutId);
        this.heartbeatTimeoutId = null;
    }
};

Pomelo.prototype.request = function(route, msg, cb) {
    msg = msg || {};
    route = route || msg.route;
    if(!route) {
        console.log('fail to send request without route.');
        return;
    }
    this.reqId++;
    this.sendMessage(this.reqId, route, msg);
    this.callbacks[this.reqId] = cb;
    this.routeMap[this.reqId] = route;
};

Pomelo.prototype.notify = function(route, msg) {
    msg = msg || {};
    this.sendMessage(0, route, msg);
};

Pomelo.prototype.sendMessage = function(reqId, route, msg) {
    var type = reqId ? Message.TYPE_REQUEST : Message.TYPE_NOTIFY;
    //compress message by protobuf
    var protos = !!this.data.protos?this.data.protos.client:{};
    if(!!protos[route]){
        msg = protobuf.encode(route, msg);
    }else{
        msg = Protocol.strencode(JSON.stringify(msg));
    }

    var compressRoute = 0;
    if(this.dict && this.dict[route]){
        route = this.dict[route];
        compressRoute = 1;
    }
    msg = Message.encode(reqId, type, compressRoute, route, msg);
    var packet = Package.encode(Package.TYPE_DATA, msg);
    this.send(packet);
};

var _host = "";
var _port = "";
var _token = "";
/*
 var send = function(packet){
 if (!!socket) {
 socket.send(packet.buffer || packet,{binary: true, mask: true});
 } else {
 setTimeout(function() {
 entry(_host, _port, _token, function() {console.log('Socket is null. ReEntry!')});
 }, 3000);
 }
 };
 */

Pomelo.prototype.send = function(packet){
    if (!!this.socket) {
        this.socket.send(packet.buffer || packet, {binary: true, mask: true});
    }
};
//var handler = {};

Pomelo.prototype.processPackage = function(msg){
    this.handlers[msg.type](msg.body);
};

Pomelo.prototype.processMessage = function(/*pomelo,*/ msg) {
    if(!msg || !msg.id) {
        // server push message
        // console.error('processMessage error!!!');
        this.emit(msg.route, msg.body);
        return;
    }
    //if have a id then find the callback function with the request
    var cb = this.callbacks[msg.id];
    delete this.callbacks[msg.id];
    if(typeof cb !== 'function') {
        return;
    }
    cb(msg.body);
    return;
};

//var processMessageBatch = function(pomelo, msgs) {
//    for(var i=0, l=msgs.length; i<l; i++) {
//        processMessage(pomelo, msgs[i]);
//    }
//};

Pomelo.prototype.deCompose = function(msg){
    var protos = !!this.data.protos ? this.data.protos.server : {};
    var abbrs = this.data.abbrs;
    var route = msg.route;
    try {
        //Decompose route from dict
        if(msg.compressRoute) {
            if(!abbrs[route]){
                console.error('illegal msg!');
                return {};
            }
            route = msg.route = abbrs[route];
        }
        if(!!protos[route]){
            return protobuf.decode(route, msg.body);
        }else{
            return JSON.parse(Protocol.strdecode(msg.body));
        }
    } catch(ex) {
        console.error('route, body = ' + route + ", " + msg.body);
    }
    return msg;
};

Pomelo.prototype.handshakeInit = function(data){
    if(data.sys && data.sys.heartbeat) {
        this.heartbeatInterval = data.sys.heartbeat * 1000;   // heartbeat interval
        this.heartbeatTimeout = this.heartbeatInterval * 2;        // max heartbeat timeout
    } else {
        this.heartbeatInterval = 0;
        this.heartbeatTimeout = 0;
    }
    this.initData(data);
    if(typeof this.handshakeCallback === 'function') {
        this.handshakeCallback(data.user);
    }
};

//Initilize data used in pomelo client
Pomelo.prototype.initData = function(data) {
    if(!data || !data.sys) {
        return;
    }
    this.data = this.data || {};
    var dict = data.sys.dict;
    var protos = data.sys.protos;
    //Init compress dict
    if(!!dict){
        this.data.dict = dict;
        this.data.abbrs = {};
        for(var route in dict){
            this.data.abbrs[dict[route]] = route;
        }
    }

    //Init protobuf protos
    if(!!protos){
        this.data.protos = {
            server : protos.server || {},
            client : protos.client || {}
        };
        if(!!protobuf){
            protobuf.init({encoderProtos: protos.client, decoderProtos: protos.server});
        }
    }
};

module.exports = Pomelo;
