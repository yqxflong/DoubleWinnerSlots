/**
 * Created by alanmars on 15/5/18.
 */
var AdStruct = function(show,interval,firstInterval) {
    this.showAds = show;
    this.showInterval = interval;
    this.deltaTime = firstInterval;
    this.isAdReady = false;
    this.isAdShow = false;
    this.isReadyForShow = false;
    this.isFirstShow = true;
};

module.exports = AdStruct;
