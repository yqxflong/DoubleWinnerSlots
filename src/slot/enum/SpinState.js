/**
 * Created by alanmars on 15/4/15.
 * @enum {number}
 */
var SpinState = {
    SPIN_STATE_INVALID: -1,
    SPIN_STATE_ACCEL: 0,
    SPIN_STATE_STEADY: 1,
    SPIN_STATE_DECEL: 2,
    SPIN_STATE_EASE_IN: 3,
    SPIN_STATE_EASE_OUT: 4,
    SPIN_STATE_DROP_OLD: 5,
    SPIN_STATE_DROP_NEW: 6,
    SPIN_STATE_END: 7,
    SPIN_STATE_SHAKE_END: 8,
    SPIN_STATE_EASE_OUT_START: 9,
    SPIN_STATE_WAIT: 10
};
module.exports = SpinState;