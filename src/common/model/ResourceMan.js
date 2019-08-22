/**
 * Created by qinning on 15/5/19.
 */

var AdControlMan = require("../../ads/model/AdControlMan");
var Util = require("../util/Util");
var CommonEvent = require("../events/CommonEvent");
var ClassicSlotMan = require("../../slot/model/ClassicSlotMan");
var Config = require("../util/Config");
var SlotAssetsManager = require("../asset/AssetsManager");
var LoadingController = require("../controller/LoadingController");
var ServerURLType = require("../enum/ServerURLType");
var SlotConfigMan = require("../../slot/config/SlotConfigMan");

var ResourceMan = cc.Class.extend({
    resUrl: null,
    packagePath: null,
    assetsConfigPath: null,
    version: null,
    engineVersion: null,
    ctor: function() {
        this.resUrl = Config.getServerURL(ServerURLType.RESOURCES_SERVER_URL);
        this.packagePath = Config.resPath;
        this.assetsConfigPath = "assets_config/";
        this.version = Config.resVersion;
        this.engineVersion = "3.6"
    },

    chapterAssetsBegin: function(chapterRootDir, loadedFunc, needRetryPopup) {
        if(Config.isLocal()) {
            loadedFunc(null);
            return;
        }
        if(cc.isUndefined(needRetryPopup)) needRetryPopup = true;
        if(cc.sys.isNative) {
            var manifestPath = jsb.fileUtils.getWritablePath() + this.assetsConfigPath + chapterRootDir;
            cc.log("manifestPath:"+manifestPath);

            if(!jsb.fileUtils.isDirectoryExist(manifestPath)) {
                if(jsb.fileUtils.createDirectory(manifestPath)) {
                    cc.log("create directory success");
                } else {
                    cc.log("create directory failed");
                    loadedFunc("create directory failed");
                    return;
                }
            }
            var configPath = this.assetsConfigPath + chapterRootDir;
            var manifestFileName = manifestPath + "/project.manifest";
            if(!jsb.fileUtils.isFileExist(manifestFileName)) {
                if(jsb_wtc.FileHelper.writeToFile(manifestFileName,
                        this.getProjectManifestContent(this.resUrl, this.packagePath, configPath, this.version, this.engineVersion))) {
                    cc.log("create file success");
                } else {
                    cc.log("create file fail");
                    loadedFunc("create manifest file fail");
                    return;
                }
            }

            var storagePath = jsb.fileUtils.getWritablePath() + chapterRootDir + "/";
            SlotAssetsManager.getInstance().downloadAssets(manifestFileName, storagePath, function (percent) {
                cc.log("SlotAssetsManager percent:" + percent);
                percent = percent / 100 * 97;
                LoadingController.dispatchLoadingEvent(percent / 100, true);
            }, function (error) {
                if(error != null) {
                    var LogMan = require("../../log/model/LogMan");
                    LogMan.getInstance().resourceUpdateRecord(error);
                    if(needRetryPopup) {
                        var PopupMan = require("./PopupMan");
                        PopupMan.popupCommonYesNoDialog("NETWORK ERROR", ["Retry downloading", "resources?"], "Yes", "No", function () {
                            SlotAssetsManager.getInstance().retryDownloadAssets();
                        },function () {
                            SlotAssetsManager.getInstance().purge();
                            loadedFunc(error);
                        });
                    }
                    else {
                        SlotAssetsManager.getInstance().retryDownloadAssets();
                    }
                }
                else {
                    SlotAssetsManager.getInstance().purge();
                    loadedFunc(error);
                }
                cc.log("SlotAssetsManager error:"+error);
            });
        }
    },

    getProjectManifestContent: function(resUrl,packagePath,configPath,version,engineVersion) {
        var content = '{' +
            '"packageUrl" : "%s/%s",' +
            '"remoteManifestUrl" : "%s/%s/project.manifest",' +
            '"remoteVersionUrl" : "%s/%s/version.manifest",' +
                '"version" : "%s",' +
                '"engineVersion" : "%s",' +
                '"assets" : {' +
                '}' +
            '}';
        content = Util.sprintf(content,resUrl,packagePath,resUrl,configPath,resUrl,configPath,version,engineVersion);
        cc.log("content:" + content);
        return content;
    },

    chapterAssetsFromRemoteBegin: function(url, chapterRootDir, loadedFunc) {
        if(cc.sys.isNative) {
            var manifestPath = jsb.fileUtils.getWritablePath() + this.assetsConfigPath + chapterRootDir;
            cc.log("manifestPath:"+manifestPath);

            if(!jsb.fileUtils.isDirectoryExist(manifestPath)) {
                if(jsb.fileUtils.createDirectory(manifestPath)) {
                    cc.log("create directory success");
                } else {
                    cc.log("create directory failed");
                    loadedFunc("create directory failed");
                    return;
                }
            }
            var configPath = this.assetsConfigPath + chapterRootDir;
            var manifestFileName = manifestPath + "/project.manifest";
            if(!jsb.fileUtils.isFileExist(manifestFileName)) {
                if(jsb_wtc.fileHelper.writeToFile(manifestFileName ,
                        this.getProjectManifestContentForRemoteRes(url, chapterRootDir, this.packagePath, configPath, this.version, this.engineVersion))) {
                    cc.log("create file success");
                } else {
                    cc.log("create file fail");
                    loadedFunc("create manifest file fail");
                    return;
                }
            }

            var storagePath = jsb.fileUtils.getWritablePath() + chapterRootDir + "/";
            SlotAssetsManager.getInstance().downloadAssets(manifestFileName, storagePath, function (percent) {
                cc.log("SlotAssetsManager percent:" + percent);
                percent = percent / 100 * 97;
                LoadingController.dispatchLoadingEvent(percent / 100, true);
            }, function (error) {
                if(error != null) {
                    var LogMan = require("../../log/model/LogMan");
                    LogMan.getInstance().resourceUpdateRecord(error);
                    var PopupMan = require("./PopupMan");
                    PopupMan.popupCommonDialog("Network Error", ["Retry downloading resources?"], ["OK"], [function () {
                        SlotAssetsManager.getInstance().retryDownAssets();
                    }], false);
                } else {
                    SlotAssetsManager.getInstance().purge();
                    loadedFunc(error);
                }
                cc.log("SlotAssetsManager error:"+error);
            });
        }
    },

    getProjectManifestContentForRemoteRes: function(resUrl,dir,packagePath,configPath,version,engineVersion) {
        var content = '{' +
            '"packageUrl" : "%s",' +
            '"remoteManifestUrl" : "%s/%s/project.manifest",' +
            '"remoteVersionUrl" : "%s/%s/version.manifest",' +
            '"version" : "%s",' +
            '"engineVersion" : "%s",' +
            '"assets" : { }' +
            '}';

        var content = Util.sprintf(content,resUrl,resUrl,dir,resUrl,dir,version,engineVersion);
        cc.log("content:" + content);
        return content;
    },
    
    releaseSlotResource: function (callback) {
        var subjectTmpl = this.getSubjectTmpl();
        if(cc.sys.isNative) {

        }
        else {
            var jsonResource = Util.sprintf(cc.loader.resPath + "resource_list/%s_%s/resource_list.json", subjectTmpl.resRootDir, subjectTmpl.subjectTmplId);
            cc.loader.loadJson(jsonResource, function(error, resultArr) {
                if(!error) {
                    if (resultArr && resultArr.length > 0) {
                        resultArr.forEach(function (fileName) {
                            var extName = cc.path.extname(fileName);
                            if (extName == ".png" || extName == ".jpg") {
                                cc.textureCache.removeTextureForKey(fileName);
                            }
                            else if (extName == ".plist") {
                                cc.spriteFrameCache.removeSpriteFramesFromFile(fileName);
                            }
                        });
                    }
                }
            });
        }

        if (callback) {
            callback();
        }
    },

    addSlotResource: function (callback) {
        var subjectTmpl = this.getSubjectTmpl();
        var resultArr = Util.loadJson(Util.sprintf("resource_list/%s_%s/resource_list.json", subjectTmpl.resRootDir, subjectTmpl.subjectTmplId));
        if (resultArr && resultArr.length > 0) {
            resultArr.forEach(function (fileName) {
                cc.log("fileName:" + fileName);
                var extName = cc.path.extname(fileName);
                if (extName == ".png" || extName == ".jpg") {
                    cc.textureCache.addImage(fileName);
                } else if (extName == ".plist") {
                    var index = fileName.indexOf(".");
                    if (index >= 0) {
                        var plistName = fileName.substr(0, index);
                        cc.spriteFrameCache.addSpriteFrames(Util.sprintf("%s.plist", plistName), Util.sprintf("%s.png", plistName));
                    }
                }
            });
        }
        if (callback) {
            callback();
        }
    },

    getSubjectTmpl: function () {
        var subjectId = ClassicSlotMan.getInstance().subjectId;
        var subject = SlotConfigMan.getInstance().getSubject(subjectId);
        var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
        return subjectTmpl;
    },

    stopResourceDownload: function () {
        SlotAssetsManager.getInstance().purge();
    }
});

ResourceMan._instance = null;
ResourceMan._firstUseInstance = true;

/**
 *
 * @returns {ResourceMan}
 */
ResourceMan.getInstance = function () {
    if (ResourceMan._firstUseInstance) {
        ResourceMan._firstUseInstance = false;
        ResourceMan._instance = new ResourceMan();
    }
    return ResourceMan._instance;
};

module.exports = ResourceMan;