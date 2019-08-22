var HourlyGameCardData = require('../entity/HourlyGameCardData');

var HourlyGameData = function(jsonObj) {
    this.startTime = jsonObj["startTime"];
    this.unclaimedChips = jsonObj["unclaimedChips"];
    this.cards = [];
    jsonObj.cards.forEach(function(cardObj) {
        var card = new HourlyGameCardData();
        card.unmarshal(cardObj);
        this.cards.push(card);
    });
};

HourlyGameData.prototype.getCard = function(cardId) {
    for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].id === cardId) {
            return this.cards[i];
        }
    }
    return null;
};

module.exports = HourlyGameData;