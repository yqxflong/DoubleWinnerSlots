/**
 * Created by qinning on 15/5/5.
 */
var Util = require("../../common/util/Util");
var SlotConfigMan = require("../config/SlotConfigMan");
var ClassicSlotMan = require("../model/ClassicSlotMan");
var EventDispatcher = require("../../common/events/EventDispatcher");
var SlotEvent = require("../events/SlotEvent");
var BaseCCBController = require("./../../common/controller/BaseCCBController");
var NumberAnimation = require("../../common/animation/NumberAnimation");
var PrizePoolPlayerController = require("./PrizePoolPlayerController");
var dateFormat = require("dateformat");
var Config = require("../../common/util/Config");
var ThemeName = require("../../common/enum/ThemeName");
var AudioHelper = require("../../common/util/AudioHelper");
var ModalLayer = require("../../common/popup/ModalLayer");
var DeviceInfo = require("../../common/util/DeviceInfo");
var PrizePoolType = require("../enum/PrizePoolType");

var PLAYER_POS_OFFSET_Y = 85;
var PLAYER_POS_OFFSET_Y_2 = 75;
var PLAYER_NUM = 3;
var PRIZE_POOL_INTERVAL = 10;
var PRIZE_POOL_KEY = "prize_pool_key";

var MoveStatus = {
    MOVE_STATUS_IN : 0,
    MOVE_STATUS_OUT : 1,
    MOVE_STATUS_PROGRESS : 2
};

var PrizePoolController = function (prizePoolType) {
    this._countDownLabel = null;
    this._top1Label = null;
    this._top2Label = null;
    this._top3Label = null;
    this._playerNumLabel = null;
    this._playersNode = null;
    this._closeRankItem = null;

    this._bgSpr = null;
    this._playerPrizeNodeArr = [];
    /**
     * seconds
     * @type {number}
     */
    this._leftRefreshTime = PRIZE_POOL_INTERVAL;
    /**
     * million seconds
     * @type {number}
     */
    this._tournamentCountDownTime = 0;

    this._topLabelArr = [];

    this._curStatus = MoveStatus.MOVE_STATUS_OUT;
    this.itemWidth = 0;
    this.itemHeight = 0;

    this._outItem = null;
    this._inItem = null;

    this._prizePoolType = prizePoolType;

    this._playerOffsetY = 0;
    if (prizePoolType == PrizePoolType.PRIZE_POOL_POPUP) {
        if (DeviceInfo.isHighResolution()) {
            this._playerOffsetY = PLAYER_POS_OFFSET_Y;
        } else {
            this._playerOffsetY = PLAYER_POS_OFFSET_Y_2;
        }
    } else {
        this._playerOffsetY = PLAYER_POS_OFFSET_Y;
    }
};

Util.inherits(PrizePoolController, BaseCCBController);

PrizePoolController.prototype.onEnter = function () {
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_UPDATE_PRIZE_POOL, this.onUpdatePrizePool, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_PRIZE_POOL_RESULT, this.onPrizePoolResult, this);
    EventDispatcher.getInstance().addEventListener(SlotEvent.SLOT_RESET_PRIZE_POOL, this.onResetCountDownTime, this);
};

PrizePoolController.prototype.onExit = function () {
    this.stopSchedule();
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_UPDATE_PRIZE_POOL, this.onUpdatePrizePool, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_PRIZE_POOL_RESULT, this.onPrizePoolResult, this);
    EventDispatcher.getInstance().removeEventListener(SlotEvent.SLOT_RESET_PRIZE_POOL, this.onResetCountDownTime, this);
};

PrizePoolController.prototype.onDidLoadFromCCB = function () {
    BaseCCBController.prototype.onDidLoadFromCCB.call(this);

    if(this._bgSpr) {
        this.itemWidth = this._bgSpr.width;
        this.itemHeight = this._bgSpr.height;
        var modelLayer = new ModalLayer();
        modelLayer.setOpacity(0);
        this.rootNode.addChild(modelLayer, -1);
        modelLayer.width = this._bgSpr.width;
        modelLayer.height = this._bgSpr.height;
        modelLayer.x = -modelLayer.width;
    }
    this._topLabelArr.push(this._top1Label);
    this._topLabelArr.push(this._top2Label);
    this._topLabelArr.push(this._top3Label);
    this.initUI();
    this.initSchedule();
    this.sendGetPrizePoolCmd();
};

//PrizePoolController.prototype.onTouchBegan = function (touch, event) {
//    var touchLocation = touch.getLocation(); // Get the touch position
//    touchLocation = this._bgSpr.getParent().convertToNodeSpace(touchLocation);
//    if(!cc.rectContainsPoint(this._bgSpr.getBoundingBox(), touchLocation)) {
//        if(this._curStatus == MoveStatus.MOVE_STATUS_OUT) {
//            this.moveIn();
//        } else if(this._curStatus == MoveStatus.MOVE_STATUS_OUT) {
//            this.moveOut();
//        }
//        return true;
//    }
//    return false;
//};

PrizePoolController.prototype.initUI = function () {
    var xOffset = 0;
    var yOffset = 0;
    if (Config.themeName === ThemeName.THEME_WTC) {
        xOffset = 0;
        yOffset = 10;
    }
    this._countDownLabel.setString("--:--");
    this._top1Label.setString("0");
    this._top2Label.setString("0");
    this._top3Label.setString("0");
    this._playerNumLabel.setString("0");
    for (var i = 0; i < PLAYER_NUM; ++i) {
        var playerNode = PrizePoolPlayerController.createFromCCB(this._prizePoolType);
        playerNode.y = (-1) * this._playerOffsetY * (i + 0.5) + yOffset;
        playerNode.x = xOffset;
        playerNode.controller.bindData(null);
        this._playersNode.addChild(playerNode);
        this._playerPrizeNodeArr.push(playerNode);
    }
    if (this._prizePoolType == PrizePoolType.PRIZE_POOL_NORMAL) {
        if (this._closeRankItem) {
            this._closeRankItem.visible = false;
        }
    } else {
        if (this._closeRankItem) {
            this._closeRankItem.visible = true;
        }
    }
};

PrizePoolController.prototype.initSchedule = function () {
    this.resetLeftRefreshTime();
    cc.director.getScheduler().scheduleCallbackForTarget(this, this.update, 1, cc.REPEAT_FOREVER, 0, false);
};

PrizePoolController.prototype.stopSchedule = function () {
    cc.director.getScheduler().unscheduleCallbackForTarget(this, this.update);
};

PrizePoolController.prototype.resetLeftRefreshTime = function () {
    this._leftRefreshTime = PRIZE_POOL_INTERVAL;
};

PrizePoolController.prototype.sendGetPrizePoolCmd = function () {
    ClassicSlotMan.getInstance().sendUpdatePrizePoolPlayersCmd();
};

/**
 * update every second
 * @param {float} dt
 */
PrizePoolController.prototype.update = function (dt) {
    /**
     * tournament count down
     */
    if (this._tournamentCountDownTime > 0) {
        var leftTime = this._tournamentCountDownTime - Date.now();
        if (leftTime > 0) {
            this._countDownLabel.setString(dateFormat(leftTime, "MM:ss", true));
        } else {
            this._countDownLabel.setString("--:--");
            this._tournamentCountDownTime = 0;
        }
    }

    /**
     * left refresh time count down
     */
    this._leftRefreshTime -= dt;
    if (this._leftRefreshTime <= 0) {
        this.sendGetPrizePoolCmd();
        this.resetLeftRefreshTime();
    }
};

PrizePoolController.prototype.onUpdatePrizePool = function (event) {
    /**
     * @type {S2CUpdatePrizePoolPlayers}
     */
    var prizeData = event.getUserData();
    if (this._tournamentCountDownTime <= 0) {
        var prizePoolLeftTime = parseInt(prizeData.leftTime);
        if (prizePoolLeftTime > 0) {
            this._tournamentCountDownTime = prizePoolLeftTime + Date.now();
        }
    }

    var players = prizeData.players;
    var rewards = prizeData.rewards;

    if (prizeData.playerNum > 0 || prizeData.leftTime > 0) {
        this._playerNumLabel.setString("" + prizeData.playerNum);
    }

    var i;
    for (i = 0; i < rewards.length; ++i) {
        this._topLabelArr[i].setString(Util.getCommaNum(rewards[i]));
    }

    for (i = 0; i < PLAYER_NUM; ++i) {
        var playerNode = this._playerPrizeNodeArr[i];
        if (i < players.length) {
            playerNode.controller.bindData(players[i]);
        } else if (prizeData.leftTime > 0) {
            playerNode.controller.bindData(null);
        }
    }

    this.resetLeftRefreshTime();
};

PrizePoolController.prototype.onResetCountDownTime = function (event) {
    this._tournamentCountDownTime = 0;
};

PrizePoolController.prototype.onPrizePoolResult = function (event) {
    /**
     * @type {S2CPrizePoolResult}
     */
    var prizePoolResult = event.getUserData();

    this._tournamentCountDownTime = 0;
    this._countDownLabel.setString("--:--");

    var rewards = prizePoolResult.rewards;
    var players = prizePoolResult.players;

    this._playerNumLabel.setString("--");

    var i;
    for (i = 0; i < rewards.length; ++i) {
        this._topLabelArr[i].setString(Util.getCommaNum(rewards[i]));
    }

    for (i = 0; i < PLAYER_NUM; ++i) {
        var playerNode = this._playerPrizeNodeArr[i];
        if (i < players.length) {
            playerNode.controller.bindData(players[i]);
        } else {
            playerNode.controller.bindData(null);
        }
    }
};

PrizePoolController.prototype.moveIn = function () {
    AudioHelper.playBtnClickSound();
    this._curStatus = MoveStatus.MOVE_STATUS_PROGRESS;
    this.rootNode.runAction(cc.sequence(cc.moveTo(0.5, 0, this.rootNode.y).easing(cc.easeBackInOut()), cc.callFunc(this.afterMoveIn, this)));
};

PrizePoolController.prototype.moveOut = function () {
    AudioHelper.playBtnClickSound();
    this._curStatus = MoveStatus.MOVE_STATUS_PROGRESS;
    this.rootNode.runAction(cc.sequence(cc.moveTo(0.5, this.itemWidth, this.rootNode.y).easing(cc.easeBackInOut()), cc.callFunc(this.afterMoveOut, this)));
};

PrizePoolController.prototype.afterMoveIn = function () {
    this._curStatus = MoveStatus.MOVE_STATUS_IN;
    if(this._inItem) {
        this._inItem.visible = false;
    }
    if(this._outItem) {
        this._outItem.visible = true;
    }
};

PrizePoolController.prototype.afterMoveOut = function () {
    this._curStatus = MoveStatus.MOVE_STATUS_OUT;
    if(this._inItem) {
        this._inItem.visible = true;
    }
    if(this._outItem) {
        this._outItem.visible = false;
    }
};

PrizePoolController.prototype.moveClicked = function () {
    if(this._curStatus == MoveStatus.MOVE_STATUS_IN) {
        this.moveOut();
    } else if(this._curStatus == MoveStatus.MOVE_STATUS_OUT) {
        this.moveIn();
    }
};

PrizePoolController.prototype.closeRankClicked = function () {
    AudioHelper.playBtnClickSound();
    EventDispatcher.getInstance().dispatchEvent(SlotEvent.SLOT_CLOSE_PRIZE_POOL_VIEW);
};

PrizePoolController.createFromCCB = function () {
    return Util.loadNodeFromCCB("slot/prize_pool/oldvegas_prize_pool_bg.ccbi", null, "PrizePoolController", new PrizePoolController(PrizePoolType.PRIZE_POOL_NORMAL));
};

PrizePoolController.createFromCCBWithResolution = function () {
    var ccbFileName = "slot/prize_pool/oldvegas_prize_pool2_bg.ccbi";
    if (DeviceInfo.isHighResolution()) {
        ccbFileName = "slot/prize_pool/oldvegas_prize_pool_bg.ccbi";
    }
    return Util.loadNodeFromCCB(ccbFileName, null, "PrizePoolController", new PrizePoolController(PrizePoolType.PRIZE_POOL_POPUP));
};

module.exports = PrizePoolController;