/**
 * Created by alanmars on 15/4/15.
 */
var Subject = function() {
    this.subjectId = -1;
    this.subjectTmplId = 0;
    this.size = 1;
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
        this.size = jsonObj["size"];
    }
};

module.exports = Subject;