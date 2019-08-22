/**
 * Created by qinning on 15/4/22.
 */
var Util = require("../util/Util");
//require("../thirdparty/pomelo/pomelo-cocos2d-js");
require('@zentertain/pomelo-cocos2d-js');
var Config = require("./../util/Config");
var ProtocolMan = require("../protocol/ProtocolMan");
var LogMan = require("../../log/model/LogMan");
var ErrorInfoType = require("../../log/enum/ErrorInfoType");
var PopupMan = require("../model/PopupMan");

var pomelo = window.pomelo;
var PomeloClient = cc.Class.extend({
    _isInitOk: false,
    _connectStartTime: 0,
    _serverUrl: null,
    _portNumber: 0,
    _requestStartTime: 0,
    _ownerDisconnect: false,
    ctor: function () {
        pomelo.on("close", this.onClose.bind(this));
        pomelo.on("disconnect", this.onDisconnected.bind(this));
        pomelo.on("error", this.onError.bind(this));
        pomelo.on("reconnect", this.onReconnect.bind(this));
        pomelo.on("onProtocol", this.onProtocol.bind(this));
    },

    /**
     * 这是往往是客户端的第一次调用，params中应该指出要连接的服务器的ip和端口号，cb会在连接成功后进行回调;
     * @param {string} serverUrl
     * @param {number} portNumber
     */
    init: function (serverUrl, portNumber, callback) {
        this._isInitOk = false;
        this._serverUrl = serverUrl;
        this._portNumber = portNumber;
        this._connectStartTime = Util.getCurrentTime();
        var self = this;
        var options = {
            host: serverUrl,
            port: portNumber,
            log: true
        };
        if (!cc.sys.isNative) {
            options.secure = true;
        }
        pomelo.init(options, function () {
            cc.log("pomelo init ok !! Time to connect to pomelo Server: " + (Util.getCurrentTime() - self._connectStartTime));
            self._isInitOk = true;
            callback();
        });
    },

    /**
     * 请求服务，route为服务端的路由，格式为"..", msg为请求的内容，cb会响应回来后的回调
     * @param {string} route
     * @param {object} param
     * @param {function} callback
     */
    request: function (route, param, callback) {
        if (!this._isInitOk) {
            cc.log("PomeloClient isInitOK = false!!! request discarded!!!!!\n");
            return;
        }
        this._requestStartTime = Util.getCurrentTime();
        var self = this;
        try {
            pomelo.request(route, param, function (data) {
                cc.log("pomelo request ok !! Time to request to pomelo Server: " + ( Util.getCurrentTime() - self._requestStartTime));
                callback(data);
                //cc.log(JSON.stringify(data));
            });
        } catch (e) {
            console.log("pomelo request error:" + e.name + ":" + e.message);
        }
    },

    /**
     * 发送notify，不需要服务器回响应的，因此没有对响应的回调，其他参数含义同request
     * @param {string} route
     * @param {string} msg
     */
    notify: function (route, msg) {
        if (!this._isInitOk) {
            return;
        }
        pomelo.notify(route, msg);
    },

    /**
     * disconnect web socket
     * @param isShowErrorDialog
     */
    disconnect: function (isShowErrorDialog) {
        cc.log("client disconnect");
        if (!isShowErrorDialog) {
            this._ownerDisconnect = true;
        }
        pomelo.disconnect();
    },

    /**
     * pomelo关闭回调
     */
    onClose: function () {
        cc.log("PomeloClient on close");
        //PopupMan.popupNetWorkError();
    },

    /**
     * pomelo disconnected 回调
     */
    onDisconnected: function () {
        cc.log("PomeloClient on disconnected");
        this._isInitOk = false;
        if(this._ownerDisconnect) {
            this._ownerDisconnect = false;
            return;
        }
        PopupMan.popupNetWorkError();
    },

    /**
     * pomelo error回调
     */
    onError: function (data) {
        cc.log("PomeloClient on error");
        this._isInitOk = false;
        LogMan.getInstance().errorInfo(ErrorInfoType.POMELO_SOCKET_CONN_ERROR, data);
        //PopupMan.popupNetWorkError();
    },

    onReconnect: function () {
        cc.log("PomeloClient on reconnct");
    },

    /**
     * pomelo 监听某一事件（服务器主动推送消息监听）
     * @param {string} route
     * @param {function} callback
     */
    on: function (route, callback) {
        if (!this._isInitOk) {
            return;
        }
        pomelo.on(route, function (data) {
            callback(data);
        });
    },

    onProtocol: function (data) {
        cc.log(JSON.stringify(data));
        var protoCtor = ProtocolMan.getInstance().getProtocol(data["type"]);
        if (protoCtor) {
            var protocol = new protoCtor();
            protocol.unmarshal(data);
            protocol.execute();
        }
    },

    isConnected: function () {
        return this._isInitOk;
    }
});

PomeloClient._instance = null;
PomeloClient._firstUseInstance = true;

/**
 *
 * @returns {PomeloClient}
 */
PomeloClient.getInstance = function () {
    if (PomeloClient._firstUseInstance) {
        PomeloClient._firstUseInstance = false;
        PomeloClient._instance = new PomeloClient();
    }
    return PomeloClient._instance;
};

module.exports = PomeloClient;

