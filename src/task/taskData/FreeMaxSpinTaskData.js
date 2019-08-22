var FreeMaxSpinTaskData = function(jsonObj) {
    this.envokeTime = jsonObj["envokeTime"] || 0;
    this.lastSpinTime = jsonObj["lastSpinTime"] || 0;
    this.needRefresh = jsonObj["needRefresh"] || false;
};

module.exports = FreeMaxSpinTaskData;
