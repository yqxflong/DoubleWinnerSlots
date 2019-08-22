/**
 * Created by qinning on 15/4/24.
 */

var MessageDialogData = cc.Class.extend({
    dialogType: 0,
    ctor: function(dlgType){
        this.dialogType = dlgType;
    }
});

module.exports = MessageDialogData;