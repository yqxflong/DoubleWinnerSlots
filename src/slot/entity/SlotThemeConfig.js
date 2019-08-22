/**
 * Created by ZenQhy on 16/6/21.
 */

var SlotThemeConfig = function () {
    this.resGroup = 0;
    this.slotBg = "";
    this.wheelFrame = "";
    this.columnNormalBg = "";
    this.themeAudio = "";
    this.winFrame = "";
};

SlotThemeConfig.prototype.unmarshal = function (jsonObj) {
    this.resGroup = jsonObj["resGroup"];
    this.slotBg = jsonObj["slotBg"];
    this.wheelFrame = jsonObj["wheelFrame"];
    this.columnNormalBg = jsonObj["columnNormalBg"];
    this.themeAudio = jsonObj["themeAudio"];
    this.winFrame = jsonObj["winFrame"];
};

module.exports = SlotThemeConfig;