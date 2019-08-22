/**
 * Created by alanmars on 15/4/15.
 */
var SubjectSpecialDescription = function() {
    this.specialTemplateId = 0;
    /**
     * @type {Array.<int>}
     */
    this.specialIds = null;
    /**
     * @type {Array.<string>}
     */
    this.specialDescriptions = null;
    /**
     * @type {Array.<string>}
     */
    this.specialTitles = null;
};

SubjectSpecialDescription.prototype = {
    constructor: SubjectSpecialDescription,
    unmarshal: function(jsonObj) {
        this.specialTemplateId = jsonObj["specialTemplateId"];
        this.specialIds = jsonObj["specialIds"];
        this.specialDescriptions = jsonObj["specialDescriptions"];
        this.specialTitles = jsonObj["specialTitles"];
    }
};

module.exports = SubjectSpecialDescription;