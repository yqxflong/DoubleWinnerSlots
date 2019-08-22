/**
 * Created by ZenQhy on 16/6/7.
 */

var VideoSlotScene = require("./VideoSlotScene");
var SpinStep = require("../enum/SpinStep");
var DrumMode = require("../enum/DrumMode");
var TaskType = require("../../task/enum/TaskType");

var SpecialTaskSlotScene = VideoSlotScene.extend({
    onEnterRoomExtraInfo: function () {
        var taskInfo = this.slotMan.taskInfo;
        var taskDetail = this.slotMan.taskDetail;
        var layerIndices = this.getSpinLayerIndices();
        var i = 0;
        if(taskInfo) {
            if(taskInfo.taskType == TaskType.TASK_BREAK_CHAIN) {
                if (taskDetail) {
                    for (i = 0; i < layerIndices.length; ++i) {
                        this.spinLayers[layerIndices[i]].onInitChainSymbols(taskDetail.chainInfos);
                    }
                }
            }
            else if(taskInfo.taskType == TaskType.TASK_BREAK_ICE) {
                if (taskDetail) {
                    for (i = 0; i < layerIndices.length; ++i) {
                        this.spinLayers[layerIndices[i]].onInitIceSymbols(taskDetail.iceInfos);
                    }
                }
            }
            else if(taskInfo.taskType == TaskType.TASK_BREAK_FIRE) {
                if (taskDetail) {
                    for (i = 0; i < layerIndices.length; ++i) {
                        this.spinLayers[layerIndices[i]].onInitFireSymbols(taskDetail.oldFireInfos);
                        this.spinLayers[layerIndices[i]].onRefreshFireSymbolPos(taskDetail.fireInfos);
                    }
                }
            }
        }
    }
});

module.exports = SpecialTaskSlotScene;