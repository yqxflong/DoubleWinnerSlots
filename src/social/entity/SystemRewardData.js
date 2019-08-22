/**
 * Created by qinning on 15/6/11.
 */

var SystemRewardData = function() {
    this.msg = '';
};

SystemRewardData.prototype.unmarshal = function(jsonObj) {
    this.msg = jsonObj["msg"];
};

module.exports = SystemRewardData;
