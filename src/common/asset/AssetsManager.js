/**
 * Created by qinning on 15/4/14.
 */
var VERSION_ASSET_ID = "@version";
var MANIFEST_ASSET_ID = "@manifest";
var AssetsManager = cc.Class.extend({
    /**
     * {jsb.AssetsManager}
     */
    _am: null,
    /**
     * {number}失败次数
     */
    _failCount: 0,
    /**
     * {number}最大错误重试次数
     */
    _maxFailCount: 1,

    _listener: null,
    ctor: function () {
    },

    purge: function () {
        if (this._am) {
            this._am.release();
        }
        this._am = null;

        if(this._listener) {
            cc.eventManager.removeListener(this._listener);
            this._listener = null;
        }
    },

    retryDownloadAssets: function () {
        this._failCount = 0;
        this._maxFailCount = 5;
        if (this._am) {
            if(!this._am.getRemoteManifest().isLoaded()) {
                this._am.update();
            } else {
                this._am.downloadFailedAssets();
            }
        }
    },

    downloadAssets: function (projectManifestPath, storagePath, updateCallBack, endCallBack) {
        this._failCount = 0;
        this._maxFailCount = 5;
        this._am = new jsb.AssetsManager(projectManifestPath, storagePath);
        this._am.retain();
        if (!this._am.getLocalManifest().isLoaded()) {
            endCallBack("error_local_manifest_not_loaded");
            return;
        }
        var that = this;
        this._listener = new jsb.EventListenerAssetsManager(this._am, function (event) {
            switch (event.getEventCode()) {
                case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                    var msg = event.getMessage();
                    cc.log("UPDATE_PROGRESSION:" + msg);
                    var assetId = event.getAssetId();
                    cc.log("assetId:" + assetId);
                    var percent = event.getPercent();
                    if (percent == 0) {
                        percent = event.getPercentByFile();
                    }
                    if (assetId == VERSION_ASSET_ID || assetId == MANIFEST_ASSET_ID) {
                        updateCallBack(1, "update manifest");
                    } else {
                        updateCallBack(percent, msg);
                    }
                    break;
                case jsb.EventAssetsManager.UPDATE_FAILED:
                    cc.log("Update failed. " + event.getMessage());
                    that._failCount++;
                    if (that._failCount < that._maxFailCount) {
                        if (that._am) {
                            that._am.downloadFailedAssets();
                        }
                    }
                    else {
                        cc.log("Reach maximum fail count, exit update process");
                        that._failCount = 0;
                        endCallBack(event.getEventCode());
                    }
                    break;
                case jsb.EventAssetsManager.UPDATE_FINISHED:
                case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                    endCallBack(null);
                    break;

                case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                    cc.log("No local manifest file found, skip assets update.");
                    endCallBack(event.getEventCode());
                    break;
                case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
                    endCallBack(event.getEventCode());
                    cc.log("Fail to download manifest file, update skipped.");
                    break;
                case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                    endCallBack(event.getEventCode());
                    cc.log("Fail to parse manifest file, update skipped.");
                    break;
                case jsb.EventAssetsManager.ERROR_UPDATING:
                    cc.log("Asset update error: " + event.getMessage());
                    endCallBack(event.getEventCode());
                    break;
                case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                    cc.log(event.getMessage());
                    endCallBack(event.getEventCode());
                    break;
                default:
                    cc.log("default: " + event.getEventCode());
                    break;
            }
        });

        cc.eventManager.addListener(this._listener, 1);
        this._am.update();
    }
});

AssetsManager._instance = null;
AssetsManager._firstUseInstance = true;

/**
 *
 * @returns {AssetsManager}
 */
AssetsManager.getInstance = function () {
    if (AssetsManager._firstUseInstance) {
        AssetsManager._firstUseInstance = false;
        AssetsManager._instance = new AssetsManager();
    }
    return AssetsManager._instance;
};

module.exports = AssetsManager;
