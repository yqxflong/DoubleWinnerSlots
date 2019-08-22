/**
 * Created by qinning on 15/4/23.
 */
var Config = require("../util/Config");
var StorageController = cc.Class.extend({
    setItem: function (key, value) {
        cc.sys.localStorage.setItem(this._getKey(key), value);
    },
    getItem: function (key, defaultValue) {
        var value = cc.sys.localStorage.getItem(this._getKey(key));
        if (value == null || value == "") {
            return defaultValue;
        }
        return value;
    },
    removeItem: function (key) {
        cc.sys.localStorage.removeItem(this._getKey(key));
    },
    _getKey: function (key) {
        return Config.logProjName + "_" + key;
    }
});

StorageController._instance = null;
StorageController._firstUseInstance = true;

/**
 *
 * @returns {StorageController}
 */
StorageController.getInstance = function () {
    if (StorageController._firstUseInstance) {
        StorageController._firstUseInstance = false;
        StorageController._instance = new StorageController();
    }
    return StorageController._instance;
};

module.exports = StorageController;