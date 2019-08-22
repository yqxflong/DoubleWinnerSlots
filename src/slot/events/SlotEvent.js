/**
 * Created by alanmars on 15/4/18.
 */
var SlotEvent = {
    SLOT_NOTICE: "slotNotice",
    SLOT_MODIFY_WIN_RATE: "slotModifyWinRate",
    SLOT_WIN_RATE_CHANGED_NO_ANIM: "slotWinRateChangedNoAnim",
    SLOT_WIN_RATE_CHANGED: "slotWinRateChanged",
    SLOT_SPIN_STEP_END: "slotSpinStepEnd",
    SLOT_OUTPUT: "slotOutput",
    SLOT_UI: "slotUI",
    SLOT_BET_CHANGED: "slotBetChanged",
    SLOT_UPDATE_PRIZE_POOL: "slotUpdatePrizePool",
    SLOT_PRIZE_POOL_RESULT: "slotPrizePoolResult",
    SLOT_RESET_PRIZE_POOL: "slotResetPrizePool",
    SLOT_UPDATE_JACKPOT: "slotUpdateJackpot",
    SLOT_OTHER_WIN_JACKPOT: "slotOtherWinJackpot",
    SLOT_JACKPOT_STATUS_CHANGED: "slotJackpotStatusChanged",
    SLOT_HIT_DIAMOND_ANIM_COMPLETED: "slotHitDiamondAnimCompleted",
    SLOT_CLOSE_PRIZE_POOL_VIEW: "slotClosePrizePoolView",
    SLOT_REFRESH_FREE_SPIN: "slotRefreshFreeSpin"
};

module.exports = SlotEvent;