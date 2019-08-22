/**
 * Created by ZenQhy on 16/6/7.
 */

var VideoSpinLayer = require("./VideoSpinLayer");
var TaskBreakChainController = require("../../task/controller/TaskBreakChainController");
var TaskMeltIceController = require("../../task/controller/TaskMeltIceController");
var TaskFireController = require("../../task/controller/TaskFireController");
var AudioHelper = require("../../common/util/AudioHelper");
var TaskType = require("../../task/enum/TaskType");
var SlotMan = require("../model/SlotMan");

var SpecialTaskSpinLayer = VideoSpinLayer.extend({
    specialTaskRootNode: null,
    specialTaskNodeMap: null,
    showedBreakAnim: false,
    lastSpecialTaskInfoMap: null,

    iceSymbolNodeMap: null,

    fireRootNodeMap: null,
    fireSymbolNodeMap: null,

    fireSymbolCount : 0,

    initUI: function () {
        this._super();
        this.specialTaskRootNode = new cc.Node();
        this.spinBoardNode.addChild(this.specialTaskRootNode, 52);
        this.specialTaskNodeMap = {};
        this.lastSpecialTaskInfoMap = {};

        this.iceSymbolNodeMap = {};

        this.fireRootNodeMap = {};
        this.fireSymbolNodeMap = {};

        this.fireSymbolCount = 0;
    },

    onSubRoundStart: function () {
        this._super();
        this.showedBreakAnim = false;

        var taskInfo = SlotMan.getCurrent().taskInfo;
        if(taskInfo && !cc.isUndefined(taskInfo) && taskInfo.taskType == TaskType.TASK_BREAK_FIRE) {
            for(var i = 0; i < this.fireSymbolCount; i++) {
                this.moveFireSymbols(i);
                this.showFireSymbols(i);
            }
        }
    },

    onSubRoundEnd: function () {
        var taskInfo = SlotMan.getCurrent().taskInfo;
        if(taskInfo && !cc.isUndefined(taskInfo) && taskInfo.taskType == TaskType.TASK_BREAK_FIRE) {
            var taskNewDetail = this.spinPanel.taskNewDetail;
            if (taskNewDetail.fireInfos) {
                for (var i = 0; i < taskNewDetail.fireInfos.length; ++i) {
                    var fireInfo = taskNewDetail.fireInfos[i];
                    this.lastSpecialTaskInfoMap[i] = fireInfo;
                }
            }
        }
    },

    /**
     * @param {Array.<ChainInfo>} chainInfos
     */
    onInitChainSymbols: function (chainInfos) {
        if (chainInfos) {
            for (var i = 0; i < chainInfos.length; ++i) {
                var chainInfo = chainInfos[i];
                if (chainInfo.count > 0) {
                    this.addChainSymbol(chainInfo);
                }
            }
        }
    },

    onInitIceSymbols: function (iceInfos) {
        if(iceInfos) {
            for (var i = 0; i < iceInfos.length; ++i) {
                var iceInfo = iceInfos[i];
                if (iceInfo.count > 0) {
                    this.addIceSymbol(iceInfo);
                }
            }
        }
    },

    onInitFireSymbols: function (fireInfos) {
        if (fireInfos) {
            for (var i = 0; i < fireInfos.length; ++i) {
                var fireInfo = fireInfos[i];
                if(fireInfo.count > 0) {
                    this.addFireSymbol(fireInfo, i);
                }
            }

            this.fireSymbolCount = fireInfos.length;
        }
    },

    onRefreshFireSymbolPos: function (fireInfos) {
        if (fireInfos) {
            for (var i = 0; i < fireInfos.length; ++i) {
                this.lastSpecialTaskInfoMap[i] = fireInfos[i];
            }
        }
    },

    /**
     * @param {ChainInfo} chainInfo
     */
    addChainSymbol: function (chainInfo) {
        var chainSymbolNode = this.getChainSymbolNode(chainInfo);
        this.specialTaskRootNode.addChild(chainSymbolNode);
        var chainKey = this._getChainKey(chainInfo.col, chainInfo.row);
        this.specialTaskNodeMap[chainKey] = chainSymbolNode;
        this.lastSpecialTaskInfoMap[chainKey] = chainInfo;
    },

    addIceSymbol: function (iceInfo) {
        var symbolSprite = this.getSymbolSprite(iceInfo.col, iceInfo.row, iceInfo.symbolId);
        this.specialTaskRootNode.addChild(symbolSprite);
        var iceSymbolNode = this.getIceNode(iceInfo);
        this.specialTaskRootNode.addChild(iceSymbolNode);

        var iceKey = this._getIceKey(iceInfo.col, iceInfo.row);
        this.specialTaskNodeMap[iceKey] = iceSymbolNode;
        this.lastSpecialTaskInfoMap[iceKey] = iceInfo;
        this.iceSymbolNodeMap[iceKey] = symbolSprite;
    },

    addFireSymbol: function (fireInfo, index) {
        var fireRootNode = new cc.Node();
        var fireRootNodePos = this.getSymbolPos(fireInfo.col, fireInfo.row);
        fireRootNode.setPosition(fireRootNodePos.x, fireRootNodePos.y);
        this.specialTaskRootNode.addChild(fireRootNode);

        var symbolSprite = this.getSymbolSprite(fireInfo.col, fireInfo.row, fireInfo.symbolId);
        symbolSprite.setPosition(0, 0);
        fireRootNode.addChild(symbolSprite, 0, 3);
        var fireSymbolNode = this.getFireNode(fireInfo);
        fireSymbolNode.setPosition(0, 0);
        fireRootNode.addChild(fireSymbolNode);

        this.fireRootNodeMap[index] = fireRootNode;
        this.specialTaskNodeMap[index] = fireSymbolNode;
        this.fireSymbolNodeMap[index] = symbolSprite;
        this.lastSpecialTaskInfoMap[index] = fireInfo;
    },

    /**
     * @param {ChainInfo} chainInfo
     */
    getChainSymbolNode: function (chainInfo) {
        var symbolPos = this.getSymbolPos(chainInfo.col, chainInfo.row);
        var chainSymbolNode = TaskBreakChainController.createFromCCB();
        chainSymbolNode.controller.showBreakChainNormal(chainInfo.count);
        chainSymbolNode.setPosition(symbolPos);
        return chainSymbolNode;
    },

    getIceNode: function (iceInfo) {
        var symbolPos = this.getSymbolPos(iceInfo.col, iceInfo.row);
        var iceNode = TaskMeltIceController.createFromCCB();
        iceNode.controller.showIceNormal(iceInfo.count);
        iceNode.setPosition(symbolPos);
        return iceNode;
    },

    getFireNode: function (fireInfo) {
        var symbolPos = this.getSymbolPos(fireInfo.col, fireInfo.row);
        var fireNode = TaskFireController.createFromCCB();
        fireNode.controller.showFireNormal(fireInfo.count);
        fireNode.setPosition(symbolPos);
        return fireNode;
    },

    /**
     * @param {ChainInfo} newChainInfo
     */
    showBreakChainAnim: function (newChainInfo) {
        var chainNode = this.specialTaskNodeMap[this._getChainKey(newChainInfo.col, newChainInfo.row)];
        if (chainNode) {
            chainNode.controller.showBreakChainAnim(newChainInfo.count);
        }
    },

    showIceMeltAnim: function (iceInfo) {
        var iceNode = this.specialTaskNodeMap[this._getIceKey(iceInfo.col, iceInfo.row)];
        if (iceNode) {
            iceNode.controller.showMeltIceAnim(iceInfo.count);
        }
    },

    showPutOutFireAnim: function (index, fireInfo) {
        var fireNode = this.specialTaskNodeMap[index];
        if (fireNode) {
            fireNode.controller.showPutOutFireAnim(fireInfo.count);
        }
    },

    _getChainKey: function (localCol, localRow) {
        return (localCol << 4) + localRow;
    },

    _getIceKey: function (localCol, localRow) {
        return (localCol << 4) + localRow;
    },

    showBreakAllChainsAnim: function () {
        var taskNewDetail = this.spinPanel.taskNewDetail;
        var i = 0;
        if (taskNewDetail) {
            if (taskNewDetail.chainInfos) {
                var hasBreakChainsAnim = false;

                for (i = 0; i < taskNewDetail.chainInfos.length; ++i) {
                    var chainInfo = taskNewDetail.chainInfos[i];
                    var lastChainKey = this._getChainKey(chainInfo.col, chainInfo.row);
                    var lastChainInfo = this.lastSpecialTaskInfoMap[lastChainKey];
                    if (lastChainInfo) {
                        if (lastChainInfo.count != chainInfo.count) {
                            this.showBreakChainAnim(chainInfo);
                            hasBreakChainsAnim = true;
                            this.lastSpecialTaskInfoMap[lastChainKey] = chainInfo;
                        }
                    }
                    else {
                        this.lastSpecialTaskInfoMap[lastChainKey] = chainInfo;
                    }
                }

                if (hasBreakChainsAnim) {
                    AudioHelper.playTaskEffect("task-break-thorns");
                }
            }
            else if (taskNewDetail.iceInfos) {
                var hasBreakIceAnim = false;

                for (i = 0; i < taskNewDetail.iceInfos.length; ++i) {
                    var iceInfo = taskNewDetail.iceInfos[i];
                    var lastIceKey = this._getIceKey(iceInfo.col, iceInfo.row);
                    var lastIceInfo = this.lastSpecialTaskInfoMap[lastIceKey];
                    if (lastIceInfo) {
                        if (lastIceInfo.count != iceInfo.count) {
                            this.showIceMeltAnim(iceInfo);
                            hasBreakIceAnim = true;
                            this.lastSpecialTaskInfoMap[lastIceKey] = iceInfo;

                            if(iceInfo.count == 0) {
                                this.iceSymbolNodeMap[lastIceKey].visible = false;
                            }
                        }
                    }
                    else {
                        this.lastSpecialTaskInfoMap[lastIceKey] = iceInfo;
                    }
                }

                if(hasBreakIceAnim) {
                    AudioHelper.playTaskEffect("task-ice-break");
                }
            }
            else if (taskNewDetail.fireInfos) {
                var hasPutOutFireAnim = false;
                for (i = 0; i < taskNewDetail.fireInfos.length; ++i) {
                    var fireInfo = taskNewDetail.fireInfos[i];
                    var lastFireInfo = this.lastSpecialTaskInfoMap[i];
                    if (lastFireInfo) {
                        if (lastFireInfo.count != fireInfo.count) {
                            this.showPutOutFireAnim(i, fireInfo);
                            hasPutOutFireAnim = true;

                            if(fireInfo.count == 0) {
                                this.fireSymbolNodeMap[i].visible = false;
                            }
                        }
                    }
                    this.lastSpecialTaskInfoMap[i] = fireInfo;
                }
            }
        }
    },

    hasBreakAllChainsAnim: function () {
        var taskNewDetail = this.spinPanel.taskNewDetail;
        var i = 0;
        if (taskNewDetail) {
            if (taskNewDetail.chainInfos) {
                var hasBreakChainsAnim = false;
                for (i = 0; i < taskNewDetail.chainInfos.length; ++i) {
                    var chainInfo = taskNewDetail.chainInfos[i];
                    var lastChainKey = this._getChainKey(chainInfo.col, chainInfo.row);
                    var lastChainInfo = this.lastSpecialTaskInfoMap[lastChainKey];
                    if (lastChainInfo) {
                        if (lastChainInfo.count != chainInfo.count) {
                            hasBreakChainsAnim = true;
                        }
                    }
                }
                return hasBreakChainsAnim;
            }
            else if (taskNewDetail.iceInfos) {
                var hasBreakIceAnim = false;
                for (i = 0; i < taskNewDetail.iceInfos.length; ++i) {
                    var iceInfo = taskNewDetail.iceInfos[i];
                    var lastIceKey = this._getIceKey(iceInfo.col, iceInfo.row);
                    var lastIceInfo = this.lastSpecialTaskInfoMap[lastIceKey];
                    if (lastIceInfo) {
                        if (lastIceInfo.count != iceInfo.count) {
                            hasBreakIceAnim = true;
                        }
                    }
                }
                return hasBreakIceAnim;
            }
            else if (taskNewDetail.fireInfos) {
                var hasPutOutFireAnim = false;
                for (i = 0; i < taskNewDetail.fireInfos.length; ++i) {
                    var fireInfo = taskNewDetail.fireInfos[i];
                    var lastFireInfo = this.lastSpecialTaskInfoMap[i];
                    if (lastFireInfo) {
                        if (lastFireInfo.count != fireInfo.count) {
                            hasPutOutFireAnim = true;
                        }
                    }
                }
                return hasPutOutFireAnim;
            }
        }

        return false;
    },

    moveFireSymbols: function (index) {
        if(this.fireRootNodeMap[index] != null && !cc.isUndefined(this.fireRootNodeMap[index])) {
            var fireInfo = this.lastSpecialTaskInfoMap[index];
            var fireSymbolNewPos = this.getSymbolPos(fireInfo.col, fireInfo.row);
            this.fireRootNodeMap[index].runAction(cc.moveTo(0.5, fireSymbolNewPos));
        }
    },

    showFireSymbols: function (index) {
        if(this.fireRootNodeMap[index] != null && !cc.isUndefined(this.fireRootNodeMap[index])) {
            var fireInfo = this.lastSpecialTaskInfoMap[index];
            var symbolSprite = this.fireRootNodeMap[index].getChildByTag(3);
            if(symbolSprite && fireInfo.count > 0) {
                symbolSprite.visible = true;
            }
        }
    },

    hideFireSymbols: function (col) {
        var taskInfo = SlotMan.getCurrent().taskInfo;
        if(taskInfo && !cc.isUndefined(taskInfo) && taskInfo.taskType == TaskType.TASK_BREAK_FIRE) {
            for(var i = 0; i < this.fireSymbolCount; i++) {
                var fireInfo = this.lastSpecialTaskInfoMap[i];
                if(fireInfo.col == col && this.fireRootNodeMap[i]) {
                    var symbolSprite = this.fireRootNodeMap[i].getChildByTag(3);
                    if(symbolSprite) symbolSprite.visible = false;
                }
            }
        }
    },

    showSpecialTaskAnimation: function () {
        this.overlayNode.visible = true;
        if (!this.showedBreakAnim) {
            this.showedBreakAnim = true;
            if(this.hasBreakAllChainsAnim()) {
                this.runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(this.showBreakAllChainsAnim, this), cc.delayTime(1.0), cc.callFunc(this.onShowSpecialTaskAnimationEnd, this)));
            }
            else {
                this.onShowSpecialTaskAnimationEnd();
            }
        }
        else {
            this.onShowSpecialTaskAnimationEnd();
        }
    }
});

module.exports = SpecialTaskSpinLayer;