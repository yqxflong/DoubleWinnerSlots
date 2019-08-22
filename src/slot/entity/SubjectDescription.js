/**
 * Created by alanmars on 15/4/15.
 */
var SubjectDescription = function() {
    this.descriptionTemplateId = 0;
    this.title = null;
    this.image = null;
    this.content = null;
    this.centerImg = false;
};

SubjectDescription.prototype = {
    constructor: SubjectDescription,
    unmarshal: function(jsonObj) {
        this.descriptionTemplateId = jsonObj["descriptionTemplateId"];
        this.title = jsonObj["title"];
        this.image = jsonObj["image"];
        this.content = jsonObj["content"];
        this.centerImage = jsonObj["centerImage"];
    }
};

module.exports = SubjectDescription;