/**
 * Created by alanmars on 15/4/16.
 */
var SymbolOpType = {
    SYMBOL_OP_TYPE_NORMAL: 0x1,
    SYMBOL_OP_TYPE_ONE_TO_ALL: 0x2,
    SYMBOL_OP_TYPE_WILD_GEN_WILD: 0x4,
    SYMBOL_OP_TYPE_DART_GEN_WILD: 0x8,
    SYMBOL_OP_TYPE_STACK_SYMBOL: 0x10,
    SYMBOL_OP_TYPE_MEGA_SYMBOL: 0x20
};

module.exports = SymbolOpType;