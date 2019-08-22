var ModalLayer = require("./ModalLayer");
var GameDirector = require("../model/GameDirector");

/**
 * Created by qinning on 15/4/29.
 */
var DialogManager = cc.Class.extend({
    DIALOG_ZORDER_BEGIN: 999,
    DIALOG_ZORDER_STEP: 2,

    /**
     * @types {ModalLayer}
     */
    _overlay: null,
    _scaleFactor: 0,
    /**
     * @types {Array.<ModalLayer>}
     */
    _dialogStack: null,

    _delayDialogQueue: null,

    ctor: function () {
        this._overlay = new ModalLayer();
        this._overlay.ignoreAnchorPointForPosition(false);
        this._overlay.setColor(cc.color.BLACK);
        this._overlay.setOpacity(190);
        this._overlay.setLocalZOrder(this.DIALOG_ZORDER_BEGIN);
        this._overlay.retain();
        this._scaleFactor = 1.0;
        this._dialogStack = [];
        this._delayDialogQueue = [];
    },

    popupForDelay: function (dlg) {
        dlg.retain();
        this._delayDialogQueue.push(dlg);
        if (this._delayDialogQueue.length == 1) {
            this.popup(dlg);
            dlg.release();
        }
    },

    checkDelayDialogQueue: function (dlg) {
        for (var i = 0; i < this._delayDialogQueue.length; ++i) {
            if (this._delayDialogQueue[i] == dlg) {
                this._delayDialogQueue.splice(i, 1);
                break;
            }
        }
        if (this._delayDialogQueue.length > 0) {
            dlg = this._delayDialogQueue.shift();
            setTimeout(function () {
                this.popup(dlg);
                dlg.release();
            }.bind(this), 500);
        }
    },

    popup: function (dlg) {
        dlg.ignoreAnchorPointForPosition(false);
        dlg.setScale(this._scaleFactor);
        dlg.setContentSize(cc.size(0,0));
        var dlgLen = this._dialogStack.length;
        if (dlgLen == 0) {
            dlg.setLocalZOrder(this.DIALOG_ZORDER_BEGIN);
        }
        else {
            dlg.setLocalZOrder(this._dialogStack[dlgLen - 1].getLocalZOrder() + this.DIALOG_ZORDER_STEP);
        }
        this._dialogStack.push(dlg);
        this._overlay.setLocalZOrder(dlg.getLocalZOrder() - 1);

        if (this._overlay.getParent() == null) {
            this.attachScene(this._overlay);
        }
        this.attachScene(dlg);
    },

    attachScene: function (node) {
        GameDirector.getInstance().popupScene.addChild(node);
    },

    close: function (dlg, dispose) {
        var closeIndex;
        var dlgLen = this._dialogStack.length;
        for (closeIndex = dlgLen - 1; closeIndex >= 0; --closeIndex) {
            if (dlg === this._dialogStack[closeIndex]) {
                break;
            }
        }

        if (closeIndex >= 0) {
            this._dialogStack.splice(closeIndex, 1);
            dlgLen = this._dialogStack.length;
            dlg.removeFromParent(dispose);
        } else {
            //throw new Error("The closed modal layer is not managed by CCDialogManager!");
            cc.log("The closed modal layer is not managed by DialogManager or it has already been closed!, closeIndex= %d, caller= %s\n", closeIndex, arguments.callee.caller);
            return;
        }

        if (dlgLen === 0) {
            this._overlay.removeFromParent(false);
        } else {
            var topIndex = dlgLen - 1;

            if (topIndex >= 0) {
                this._overlay.setLocalZOrder(this._dialogStack[topIndex].getLocalZOrder() - 1);
            } else {
                this._overlay.removeFromParent(false);
                this._dialogStack.length = 0;
            }
        }
    },

    closeAll: function () {
        var dlgLen = this._dialogStack.length;
        while (dlgLen != 0) {
            var modalLayer = this._dialogStack[dlgLen - 1];
            this.close(modalLayer, true);
            dlgLen = this._dialogStack.length;
        }
    }
});

DialogManager._instance = null;
DialogManager._firstUseInstance = true;

/**
 *
 * @returns {DialogManager}
 */
DialogManager.getInstance = function () {
    if (DialogManager._firstUseInstance) {
        DialogManager._firstUseInstance = false;
        DialogManager._instance = new DialogManager();
    }
    return DialogManager._instance;
};

module.exports = DialogManager;