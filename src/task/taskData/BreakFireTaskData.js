var FireInfo = require("../entity/FireInfo");

var BreakFireTaskData = function(jsonObj) {
    this.fireInfos = [];
    this.oldFireInfos = [];

    var i = 0;
    var fireInfosArray = jsonObj["chainInfos"];
    if (fireInfosArray) {
        for (i = 0; i < fireInfosArray.length; ++i) {
            var oneFireInfo = new FireInfo(fireInfosArray[i]);
            this.fireInfos.push(oneFireInfo);
        }
    }

    var oldFireInfosArray = jsonObj["oldChainInfos"];
    if (oldFireInfosArray) {
        for (i = 0; i < oldFireInfosArray.length; ++i) {
            var oneOldFireInfo = new FireInfo(oldFireInfosArray[i]);
            this.oldFireInfos.push(oneOldFireInfo);
        }
    }
};

module.exports = BreakFireTaskData;
