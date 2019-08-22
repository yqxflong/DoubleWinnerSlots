var JackpotStatus = require("../enum/JackpotStatus");
var TimeAccuJackpotInfo = require("./TimeAccuJackpotInfo");
var BetAccuJackpotInfo = require("./BetAccuJackpotInfo");
var JackpotType = require("../enum/JackpotType");

/**
 * Created by alanmars on 15/4/15.
 */


var Subject = function() {
    this.subjectId = -1;
    this.subjectTmplId = 0;
    this.unlockLevel = 0;
    this.ccbName = null;
    this.jackpotStatus = JackpotStatus.JACKPOT_STATUS_CLOSED;
    this.jackpotType = 0;
    this.jackpotIdList = null;

    this.jackpotInfoList = null;
    this.unlockGems = 0;
    /**
     * unlock card id array.
     * @type {Array.<number>}
     */
    this.unlockCards = [];

    /**
     * for client only
     * @type {number}
     */
    this.lockType = 0;
};

Subject.prototype = {
    constructor: Subject,
    /**
     *
     * @param {object} jsonObj
     */
    unmarshal: function (jsonObj) {
        this.subjectId = jsonObj["subjectId"];
        this.subjectTmplId = jsonObj["subjectTmplId"];
        this.unlockLevel = jsonObj["unlockLevel"];

        this.jackpotStatus = jsonObj["jackpotStatus"];
        this.jackpotType = jsonObj["jackpotType"];
        this.jackpotIdList = jsonObj["jackpotIdList"];
        this.unlockGems = jsonObj["unlockGems"];
        this.unlockStar = jsonObj["unlockStar"];

        if (jsonObj["jackpotInfoList"]) {
            this.jackpotInfoList = [];
            var jackpotInfoArray = jsonObj["jackpotInfoList"];
            for (var i = 0; i < jackpotInfoArray.length; ++ i) {
                var jackpotInfoObj = jackpotInfoArray[i];
                if (jackpotInfoObj["jackpotType"] === this.jackpotType) {
                    if (this.jackpotType === JackpotType.JACKPOT_TYPE_TIME_ACCU) {
                        var jackpotInfo = new TimeAccuJackpotInfo();
                        jackpotInfo.unmarshal(jackpotInfoObj);
                        this.jackpotInfoList.push(jackpotInfo);
                    } else if(this.jackpotType === JackpotType.JACKPOT_TYPE_BET_ACCU) {
                        var jackpotInfo = new BetAccuJackpotInfo();
                        jackpotInfo.unmarshal(jackpotInfoObj);
                        this.jackpotInfoList.push(jackpotInfoObj);
                    }
                }
            }
        }
        this.unlockCards = jsonObj["unlockCards"];
    }
};

module.exports = Subject;
