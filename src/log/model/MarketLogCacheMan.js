/**
 * Created by qinning on 16/5/16.
 */

var StorageControler = require("../../common/storage/StorageController");
var Util = require("../../common/util/Util");

//# initialize
//# cachedRecords schema:
//    # url1:
//    #   records: [{type: "event1"}, {type: "event2"}]
//#   seqNum: 100
//# url2:
//    #   records: [{type: "event1"}, {type: "event2"}]
//#   seqNum: 100

var MarketLogCacheMan = cc.Class.extend({
    LOGCACHE_MAX_RECORD_NUM: 100,
    ONE_MINUTE_MILLION_SECOND: 60 * 1000,
    LOGCACHE_STORAGE_KEY: "logCache.cachedRecords",
    cachedRecords: null,
    lastCacheToFileTime: 0,

    ctor: function () {
        var storageData = StorageControler.getInstance().getItem(this.LOGCACHE_STORAGE_KEY, "");
        if (storageData) {
            try {
                this.cachedRecords = JSON.parse(storageData);
            }
            catch (error) {
                cc.log("Failed load cached records from storage");
            }
        }

        this.lastCacheToFileTime = Date.now();

        if (!this.cachedRecords) {
            this.cachedRecords = {};
        }
    },

    _getCacheForUrl: function (url) {
        if (!this.cachedRecords[url]) {
            this.cachedRecords[url] = {
                records: [],
                seqNum: 0
            };
        }
        return this.cachedRecords[url];
    },

    persistCachedRecords: function (flush) {
        if (flush || (Date.now() - this.lastCacheToFileTime > this.ONE_MINUTE_MILLION_SECOND)) {
            this.lastCacheToFileTime = Date.now();
            StorageControler.getInstance().setItem(this.LOGCACHE_STORAGE_KEY, JSON.stringify(this.cachedRecords));
            cc.log("persistCachedRecords succesed, records:" + JSON.stringify(this.cachedRecords));
        }
    },

    fetchCachedRecords: function (url, withReportTime) {
        var records = this._getCacheForUrl(url).records;

        if (withReportTime) {
            for (var item in records) {
                records[item].report_time = Math.floor(Date.now() / 1000);
            }
        }

        return records;
    },

    cacheRecord: function (url, record) {
        var cache = this._getCacheForUrl(url);
        record.seqNum = cache.seqNum;
        record.logId = Util.createUniqueId();
        record.clientTime = Math.floor(Date.now() / 1000);
        cache.seqNum += 1;
        if (cache.records.length < this.LOGCACHE_MAX_RECORD_NUM) {
            cache.records.push(record);
        }
    },

    cleanCahcedRecord: function (url) {
        var cache = this._getCacheForUrl(url);
        cache.records = [];
    }
});


MarketLogCacheMan._instance = null;
MarketLogCacheMan._firstUseInstance = true;

/**
 *
 * @returns {MarketLogCacheMan}
 */
MarketLogCacheMan.getInstance = function () {
    if (MarketLogCacheMan._firstUseInstance) {
        MarketLogCacheMan._firstUseInstance = false;
        MarketLogCacheMan._instance = new MarketLogCacheMan();
    }
    return MarketLogCacheMan._instance;
};

module.exports = MarketLogCacheMan;