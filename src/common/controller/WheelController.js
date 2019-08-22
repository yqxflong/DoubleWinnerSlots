var Util = require("../util/Util");
var BaseCCBController = require("./BaseCCBController");
var WheelStatus = require("../enum/WheelStatus");
var AudioPlayer = require("../audio/AudioPlayer");
var AudioHelper = require("../util/AudioHelper");

/**
 * Created by alanmars on 15/12/8.
 * @param {number} pocketNum - the number of pockets on the wheel
 */
var WheelController = function (pocketNum) {
    BaseCCBController.call(this);
    this.RESULT_LABEL_START_TAG = 300;
    this.ROTATE_ACCELERATION = 300;
    this.ROTATE_STEADY = 700;
    this._pocketNum = pocketNum;

    this._spinItem = null;

    /**
     * @type {cc.Node}
     * @private
     */
    this._wheelNode = null;
    /**
     * @type {Array.<cc.LabelTTF>}
     * @private
     */
    this._resultLabels = [];

    this._initRotation = 0;
    this._updateEnabled = false;
    this._wheelStatus = WheelStatus.WHEEL_STATUS_INVALID;
    this._resultRotation = 0;
    this._waitToRotateTime = 1.0;
    this._steadyRotateTime = 1.5;
    this._resultShowTime = 2.0;
    this._rotateSpeed = 0;

    /**
     * @type {function}
     * @private
     */
    this._onRotateCompleted = null;
    /**
     * @type {function}
     * @private
     */
    this._onShowResultCompleted = null;
    /**
     * @type {function}
     * @private
     */
    this._onSpinClickedCallback = null;
};

Util.inherits(WheelController, BaseCCBController);

WheelController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);
    for (var i = 0; i < this._pocketNum; ++ i) {
        var resultLabel = this._wheelNode.getChildByTag(this.RESULT_LABEL_START_TAG + i + 1);
        this._resultLabels.push(resultLabel);
    }
    this._initRotation = this._wheelNode.rotation;
};

WheelController.prototype.onEnter = function () {
    cc.director.getScheduler().scheduleUpdateForTarget(this, 0, false);
};

WheelController.prototype.onExit = function () {
    cc.director.getScheduler().unscheduleUpdateForTarget(this);
};

/**
 * @param {Array.<string>} pocketTxts - an array in which every element is the text for corresponding pocket.
 */
WheelController.prototype.initUI = function (pocketTxts) {
    for (var i = 0; i < this._pocketNum && i < pocketTxts.length; ++ i) {
        this._resultLabels[i].setString(Util.getCommaNum(pocketTxts[i]));
    }
};

WheelController.prototype.update = function (dt) {
    if (!this._updateEnabled) {
        return;
    }

    switch (this._wheelStatus) {
        case WheelStatus.WHEEL_STATUS_WAIT_TO_ROTATE:
        {
            this._waitToRotateTime -= dt;
            if (this._waitToRotateTime < 0) {
                this._wheelStatus = WheelStatus.WHEEL_STATUS_ACCELERATE_ROTATE;
                AudioHelper.playSlotEffect("roulette_spin");
            }
        }
            break;
        case WheelStatus.WHEEL_STATUS_ACCELERATE_ROTATE:
        {
            this._rotateSpeed += dt * this.ROTATE_ACCELERATION;
            this._addWheelRotation(dt * this._rotateSpeed);

            if (this._rotateSpeed >= this.ROTATE_STEADY) {
                this._rotateSpeed = this.ROTATE_STEADY;
                this._wheelStatus = WheelStatus.WHEEL_STATUS_STEADY_ROTATE;
            }
        }
            break;
        case WheelStatus.WHEEL_STATUS_STEADY_ROTATE:
        {
            this._addWheelRotation(dt * this._rotateSpeed);

            var deltaToResult = this._resultRotation - this._wheelNode.rotation;
            if (deltaToResult < 0) {
                deltaToResult += Util.PI_2_IN_DEGREE;
            }

            this._steadyRotateTime -= dt;
            if (this._steadyRotateTime <= 0 && deltaToResult >= 170.0 && deltaToResult <= 190.0) {
                this._wheelStatus = WheelStatus.WHEEL_STATUS_DECELERATE_ROTATE;
            }
        }
            break;
        case WheelStatus.WHEEL_STATUS_DECELERATE_ROTATE:
        {
            if (this._rotateSpeed > 100.0) {
                this._rotateSpeed -= dt * 300.0;
            } else {
                this._rotateSpeed -= dt * 50.0;
            }

            if (this._rotateSpeed <= 10.0) {
                this._rotateSpeed = 10.0;
            }

            this._addWheelRotation(dt * this._rotateSpeed);

            var wheelRotation = this._wheelNode.rotation;
            if (this._rotateSpeed <= 10.0 && wheelRotation <= (this._resultRotation + 5.0) && wheelRotation >= (this._resultRotation - 5.0)) {
                this._rotateSpeed = 0.0;
                this._wheelNode.rotation = this._resultRotation;

                this._wheelStatus = WheelStatus.WHEEL_STATUS_SHOW_RESULT;
                AudioHelper.playSlotEffect("roulette_stop");

                if (this._onRotateCompleted) {
                    this._onRotateCompleted();
                }
            }
        }
            break;
        case WheelStatus.WHEEL_STATUS_SHOW_RESULT:
        {
            this._resultShowTime -= dt;

            if (this._resultShowTime <= 0) {
                this._updateEnabled = false;
                this._wheelStatus = WheelStatus.WHEEL_STATUS_INVALID;

                if (this._onShowResultCompleted) {
                    this._onShowResultCompleted();
                }
            }
        }
            break;
        default:
            break;
    }
};

/**
 * @param {number} hitIndex
 * @param {function} onRotateCompleted
 * @param {function} onShowResultCompleted
 */
WheelController.prototype.rotate = function (hitIndex, onRotateCompleted, onShowResultCompleted) {
    this._resultRotation = Util.PI_2_IN_DEGREE - ((hitIndex*(Util.PI_2_IN_DEGREE/this._pocketNum) - this._initRotation))%Util.PI_2_IN_DEGREE;
    this._onRotateCompleted = onRotateCompleted;
    this._onShowResultCompleted = onShowResultCompleted;
    this._wheelStatus = WheelStatus.WHEEL_STATUS_WAIT_TO_ROTATE;
    this._updateEnabled = true;
};

WheelController.prototype.resetWheel = function () {
    this._wheelNode.rotation = this._initRotation;
};

/**
 * @param {number} deltaRotation
 * @private
 */
WheelController.prototype._addWheelRotation = function (deltaRotation) {
    var wheelRotation = this._wheelNode.rotation + deltaRotation;
    if (wheelRotation >= Util.PI_2_IN_DEGREE) {
        wheelRotation -= Util.PI_2_IN_DEGREE;
    }
    this._wheelNode.rotation = wheelRotation;
};

/**
 * To make this effect, you must invoke this before rotate
 * @param {number} resultShowTime
 */
WheelController.prototype.setResultShowTime = function (resultShowTime) {
    this._resultShowTime = resultShowTime;
};

/**
 * spin item clicked
 * @param event
 */
WheelController.prototype.spinClicked = function (event) {
    AudioHelper.playBtnClickSound();
    this._spinItem.enabled = false;
    if (this._onSpinClickedCallback) {
        this._onSpinClickedCallback();
    }

    var LogMan = require("../../log/model/LogMan");
    var UserStepId = require("../../log/enum/UserStepId");
    LogMan.getInstance().userStepRecord(UserStepId.USER_STEP_CLICK_DAILY_BONUS, -1);
};

/**
 * listen spin item click.
 * @param {Function} callback
 */
WheelController.prototype.onSpinClickedCallback = function (callback) {
    this._onSpinClickedCallback = callback;
};

/**
 * To make this effect, you must invoke this before rotate
 * @param {number} waitToRotateTime
 */
WheelController.prototype.setWaitToRotateTime = function (waitToRotateTime) {
    this._waitToRotateTime = waitToRotateTime;
};

/**
 * To make this effect, you must invoke this before rotate
 * @param {number} steadyRotateTime
 */
WheelController.prototype.setSteadyRotateTime = function (steadyRotateTime) {
    this._steadyRotateTime = steadyRotateTime;
};

/**
 * @param {string} filePath
 * @param {number} pocketNum
 * @returns {cc.Node}
 */
WheelController.createFromCCB = function (filePath, pocketNum) {
    return Util.loadNodeFromCCB(filePath, null, "WheelController", new WheelController(pocketNum));
};

module.exports = WheelController;