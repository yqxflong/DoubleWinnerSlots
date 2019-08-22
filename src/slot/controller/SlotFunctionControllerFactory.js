var FunctionType = require("../enum/FunctionType");
var SlotFunctionController = require("./SlotFunctionController");
var SlotTaskFunctionController = require("./SlotTaskFunctionController");

var SlotFunctionControllerFactory = {
    create: function (fileName, functionType) {
        var result;
        switch (functionType) {
            case FunctionType.FUNCTION_TYPE_CLASSIC:
                result = SlotFunctionController.createFromCCB(fileName);
                break;
            case FunctionType.FUNCTION_TYPE_VIDEO:
                result = SlotTaskFunctionController.createFromCCB(fileName);
                break;
            default:
                result = SlotFunctionController.createFromCCB(fileName);
        }
        return result;
    }
};

module.exports = SlotFunctionControllerFactory;