/**
 * Created by alanmars on 15/4/17.
 */
var SymbolMoveMode = {
    /*
     public static const kSymbolMoveModeDownward:int         = 1;
     public static const kSymbolMoveModeUpward:int           = 2;    // 向上
     public static const kSymbolMoveModeDownAndUp:int        = 3;    // 上下交错
     public static const kSymbolMoveModeDownwardEaseout:int  = 4;    // 蓄劲向下
     public static const kSymbolMoveModeUpwardEaseout:int    = 5;    // 蓄劲向上
     public static const kSymbolMoveModeShake:int            = 6;    //
     public static const kSymbolMoveModeShakeEnd:int         = 7;
     */
    SYMBOL_MOVE_MODE_DOWNWARD_EASE_OUT: 4,
    SYMBOL_MOVE_MODE_SHAKE_END: 7,
    SYMBOL_MOVE_MODE_STEADY_END: 8
};

module.exports = SymbolMoveMode;