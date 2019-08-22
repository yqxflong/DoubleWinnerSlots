/**
 * Created by qinning on 15/4/22.
 */

/**
 * net config
 * @type {{NETWORK_URL: string, NEtWORK_PORT: number}}
 */

var ServerURLType = require("../enum/ServerURLType");
var VersionStatus = require("../enum/VersionStatus");
var ThemeName = require("../enum/ThemeName");

var Config = {
    version: VersionStatus.VERSION_LOCAL,

    themeName: ThemeName.THEME_DOUBLE_WINNER,
    appVersion: 0,
    resVersion: "0.0.1",
    resPath: "res_double_winner",
    debugVersion: "L1.0.58",
    releaseVersion: "1.0.12",
    logProjName: "DoubleWinner",
    jsVersion: 0,
    hockeyAppBundleId: "com.zentertain.doublewinner.web",
    hockeyAppId: "cb1f189055fe423f945cb81a309e6c20",
    bindFacebookReward: 500000,
    debugPorts: {
        securePorts: [9978],
        insecurePorts: [9976]
    },
    simuDebugPorts: {
        securePorts: [9958],
        insecurePorts: [9956]
    },
    releasePorts: {
        securePorts: [4001],
        insecurePorts: [4000]
    },
    fanPageUrl: "https://www.facebook.com/doublewinnerslots"
    //localDebugMode: true,

    //testForSoundMode: false,
    //testForSoundSubjectId: 60110,
    //testIndex: 0,
};

Config.getAppVersion = function () {
    var clientAppVersion = 0;
    try {
        clientAppVersion = jsb_wtc.LogicHelper.getInstance().getAppVersion();
    } catch (e) {
        clientAppVersion = 0;
    }
    return clientAppVersion;
};

Config.isRelease = function() {
    return Config.version === VersionStatus.VERSION_RELEASE;
};

Config.isDebug = function() {
    return Config.version === VersionStatus.VERSION_DEBUG;
};

Config.isLocal = function() {
    return Config.version === VersionStatus.VERSION_LOCAL;
};

Config.getServerURL = function(urlType)
{
    var result;
    switch (Config.version)
    {
        case VersionStatus.VERSION_RELEASE:
        {
            switch (urlType)
            {
                case ServerURLType.LOGIN_SERVER_URL:
                    result = "slots-doublewinner-gate.tuanguwen.com";
                    break;
                case ServerURLType.RESOURCES_SERVER_URL:
                    result = "https://d2snxliyvcd9rj.cloudfront.net/double_winner";
                    break;
                case ServerURLType.LOG_SERVER_URL:
                    result = "https://slots-doublewinner-statistic.tuanguwen.com/DoubleWinnerStatistic/logactions";
                    break;
                case ServerURLType.PURCHASE_URL:
                    result = "https://slots-doublewinner-gate.tuanguwen.com/social-server/product/";
                    break;
            }
        }
            break;
        case VersionStatus.VERSION_DEBUG:
        {
            switch (urlType)
            {
                case ServerURLType.LOGIN_SERVER_URL:
                    result = "slots-team-test-new.tuanguwen.com";
                    break;
                case ServerURLType.RESOURCES_SERVER_URL:
                    result = "https://slots-team-test-new.tuanguwen.com/double_winner";
                    break;
                case ServerURLType.LOG_SERVER_URL:
                    result = "https://slots-team-test-server-v0.tuanguwen.com/DoubleWinnerStatistic/logactions";
                    break;
                case ServerURLType.PURCHASE_URL:
                    result = "https://slots-team-test-new.tuanguwen.com/double_winner_server/product/";
                    break;
            }
        }
            break;
        case VersionStatus.VERSION_LOCAL:
        {
            switch (urlType) {
                case ServerURLType.LOGIN_SERVER_URL:
                    result = "slots-team-test-new.tuanguwen.com";
                    break;
                case ServerURLType.RESOURCES_SERVER_URL:
                    result = "https://slots-team-test-new.tuanguwen.com/double_winner";
                    break;
                case ServerURLType.LOG_SERVER_URL:
                    result = "https://slots-team-test-server-v0.tuanguwen.com/DoubleWinnerStatistic/logactions";
                    break;
            }
        }
    }
    return result;
};

Config.getServerPort = function () {
    var result;
    switch (Config.version) {
        case VersionStatus.VERSION_RELEASE:
            return Config._getPorts(!cc.sys.isNative, Config.releasePorts);
            break;
        case VersionStatus.VERSION_DEBUG:
            return Config._getPorts(!cc.sys.isNative, Config.debugPorts);
            break;
        case VersionStatus.VERSION_LOCAL:
            return Config._getPorts(!cc.sys.isNative, Config.debugPorts);
            break;
    }
    return result;
};

Config._getPorts = function (isSecure, portObj) {
    var portsArr;
    if (isSecure) {
        portsArr = portObj.securePorts;
    } else {
        portsArr = portObj.insecurePorts;
    }
    var index = Util.randomNextInt(portsArr.length);
    return portsArr[index];
};

Config.getServerList = function () {
    var ServerData = require("../entity/ServerData");
    var serverList = [];

    var serverData;
    if (cc.sys.isNative) {
        //serverData = new ServerData();
        //serverData.serverName = "SimulatorServer";
        //serverData.serverUrl = "slots-team-test-server-v0.tuanguwen.com";
        //serverData.serverPort = Config._getPorts(false, Config.simuDebugPorts);
        //serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "胜利电脑";
        serverData.serverUrl = "10.0.3.95";
        serverData.serverPort = Config._getPorts(false, Config.debugPorts);
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "测试服";
        serverData.serverUrl = "slots-team-test-new.tuanguwen.com";
        serverData.serverPort = Config._getPorts(false, Config.debugPorts);
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "simulator server";
        serverData.serverUrl = "slots-team-test-new.tuanguwen.com";
        serverData.serverPort = 9986;
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "正式服";
        serverData.serverUrl = "slots-doublewinner-gate.tuanguwen.com";
        serverData.serverPort = 4000;
        serverList.push(serverData);
    }
    else {
        //serverData = new ServerData();
        //serverData.serverName = "SimulatorServerEncrypt";
        //serverData.serverUrl = "slots-team-test-server-v0.tuanguwen.com";
        //serverData.serverPort = Config._getPorts(true, Config.simuDebugPorts);
        //serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "胜利电脑";
        serverData.serverUrl = "10.0.3.95";
        serverData.serverPort = Config._getPorts(true, Config.debugPorts);
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "测试服";
        serverData.serverUrl = "slots-team-test-new.tuanguwen.com";
        serverData.serverPort = Config._getPorts(true, Config.debugPorts);
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "simulator server";
        serverData.serverUrl = "slots-team-test-new.tuanguwen.com";
        serverData.serverPort = 9988;
        serverList.push(serverData);

        serverData = new ServerData();
        serverData.serverName = "正式服";
        serverData.serverUrl = "slots-doublewinner-gate.tuanguwen.com";
        serverData.serverPort = 4001;
        serverList.push(serverData);
    }
    return serverList;
};

module.exports = Config;
