/**
 * Created by alanmars on 15/4/15.
 */
var Line = require("./Line");
var Symbol = require("./Symbol");
var SubjectPanel = require("./SubjectPanel");
var SubjectSpecialDescription = require("./SubjectSpecialDescription");
var SubjectDescription = require("./SubjectDescription");
var EnumPayTableItem = require("./EnumPayTableItem");
var SymbolId = require("../enum/SymbolId");
var WinEffect = require("./WinEffect");
var PrizePoolType = require("../enum/PrizePoolType");
var FunctionType = require("../enum/FunctionType");

var SubjectTmpl = function () {
    this.subjectTmplId = 0;
    this.subjectMode = 0;
    this.slotSceneType = 0;
    this.bonusId = 0;
    this.unlockStar = 0;
    /**
     * The shape of panel
     * @type {number}
     */
    this.panelType = 0;

    this.freeSpinPanels = 0;
    this.normalSpinPanels = 0;

    this.reelCol = 0;
    this.reelRow = 0;
    this.stackSymbols = {};
    this.spinType = 0;
    this.symbolOpType = 0;
    this.symbolMoveMode = 0;

    this.name = null;
    this.displayName = null;
    this.bgName = null;
    this.reelName = null;
    this.resRootDir = null;
    this.reelDir = null;
    this.symbolBatchName = "";
    this.symbolBatchPlistPath = "";
    this.commonSymbolBatchName = "";
    this.commonSymbolBatchPlistPath = "";
    this.slotTheme = 0;

    this.spinBgMusic = null;
    this.freeSpinBgMusic = null;
    this.musicDownloadDir = "";
    this.winEffectMap = {};
    this.prizePoolType = 0;
    this.functionType = 0;

    /**
     * @type {Array.<Array.<Line>>}
     */
    this.lines = [];               //2D Line Array
    this.symbolIds = [];
    /**
     * @type {object.<number, Symbol>}
     */
    this.symbols = {};
    this.panels = [];

    this.specialDescription = null;
    /**
     * @type {Array.<SubjectDescription>}
     */
    this.descriptions = [];
    /**
     * @type {Array.<EnumPayTableItem>}
     */
    this.specialPayTables = [];
    this.spinUiTitleName = null;
    this.spinUiBottomName = null;
    this.spinUiBottomNameIphone = null;
    this.payTableType = 0;
};

SubjectTmpl.prototype = {
    constructor: SubjectTmpl,
    unmarshal: function (jsonObj) {
        this.subjectTmplId = jsonObj["subjectTmplId"];
        this.subjectMode = jsonObj["subjectMode"];
        this.slotSceneType = jsonObj["slotSceneType"];
        this.bonusId = jsonObj["bonusId"];
        this.unlockStar = jsonObj["unlockStar"];
        this.panelType = jsonObj["panelType"];

        this.freeSpinPanels = jsonObj["freeSpinPanels"];
        this.normalSpinPanels = jsonObj["normalSpinPanels"];

        this.reelCol = jsonObj["reelCol"];
        this.reelRow = jsonObj["reelRow"];

        var stackSymbolsObj = jsonObj["stackSymbols"];
        if (stackSymbolsObj) {
            for (var stackSymbolStr in stackSymbolsObj) {
                if (stackSymbolsObj.hasOwnProperty(stackSymbolStr)) {
                    var stackSymbolId = parseInt(stackSymbolStr);
                    this.stackSymbols[stackSymbolId] = stackSymbolsObj[stackSymbolStr];
                }
            }
        }

        this.spinType = jsonObj["spinType"];
        this.symbolOpType = jsonObj["symbolOpType"];
        this.symbolMoveMode = jsonObj["symbolMoveMode"];

        this.name = jsonObj["name"];
        this.displayName = jsonObj["displayName"];
        this.bgName = jsonObj["bgName"];
        this.reelName = jsonObj["reelName"];
        this.resRootDir = jsonObj["resRootDir"];

        var reelDirs = jsonObj["reelDirs"];
        if(reelDirs && reelDirs.length > 0) {
            this.reelDir = reelDirs[0];
        }

        this.symbolBatchName = jsonObj["symbolBatchName"] || "";
        this.symbolBatchPlistPath = jsonObj["symbolBatchPlistPath"] || "";
        this.commonSymbolBatchName = jsonObj["commonSymbolBatchName"] || "";
        this.commonSymbolBatchPlistPath = jsonObj["commonSymbolBatchPlistPath"] || "";
        this.slotTheme = jsonObj["slotTheme"] || 0;

        this.spinBgMusic = jsonObj["spinBgMusic"];
        this.freeSpinBgMusic = jsonObj["freeSpinBgMusic"];
        this.musicDownloadDir = jsonObj["musicDownloadDir"] || "";
        var winEffectMapObj = jsonObj["winEffectMap"];
        if (winEffectMapObj) {
            for (var winLevelStr in winEffectMapObj) {
                if (winEffectMapObj.hasOwnProperty(winLevelStr)) {
                    this.winEffectMap[parseInt(winLevelStr)] = new WinEffect(winEffectMapObj[winLevelStr]);
                }
            }
        }

        var i;
        var jsonLine2DArray = jsonObj["lines"];
        for (i = 0; i < jsonLine2DArray.length; ++i) {
            this.lines[i] = [];
            for (var j = 0; j < jsonLine2DArray[i].length; ++j) {
                var line = new Line();
                line.unmarshal(jsonLine2DArray[i][j]);
                this.lines[i][j] = line;
            }
        }

        var jsonSymbolObj = jsonObj["symbols"];
        for (var symbolIdStr in jsonSymbolObj) {
            var symbolId = parseInt(symbolIdStr);
            var symbol = new Symbol();
            symbol.unmarshal(jsonSymbolObj[symbolIdStr]);

            this.symbolIds.push(symbolId);
            this.symbols[symbolId] = symbol;
        }

        var panelArray = jsonObj["panels"];
        for (i = 0; i < panelArray.length; ++i) {
            var panel = new SubjectPanel();
            panel.unmarshal(panelArray[i]);
            this.panels.push(panel);
        }

        var payTableConfig = jsonObj["payTableConfig"];
        if (payTableConfig) {
            this.specialDescription = new SubjectSpecialDescription();
            this.specialDescription.unmarshal(payTableConfig["specialDescription"]);

            var descArray = payTableConfig["descriptions"];
            for (i = 0; i < descArray.length; ++i) {
                var subjectDesc = new SubjectDescription();
                subjectDesc.unmarshal(descArray[i]);
                this.descriptions.push(subjectDesc);
            }
            this.payTableType = payTableConfig["payTableType"];
        }

        var specialPayTableArray = jsonObj["specialPayTables"];
        if (specialPayTableArray) {
            for (i = 0; i < specialPayTableArray.length; ++i) {
                var enumPayTableItem = new EnumPayTableItem();
                enumPayTableItem.unmarshal(specialPayTableArray[i]);
                this.specialPayTables.push(enumPayTableItem);
            }
        }

        this.spinUiTitleName = jsonObj["spinUiTitleName"];
        this.spinUiBottomName = jsonObj["spinUiBottomName"];
        this.spinUiBottomNameIphone = jsonObj["spinUiBottomNameIphone"];
        if (jsonObj["prizePoolType"]) {
            this.prizePoolType = jsonObj["prizePoolType"];
        } else {
            this.prizePoolType = PrizePoolType.PRIZE_POOL_NORMAL;
        }
        if (jsonObj["functionType"]) {
            this.functionType = jsonObj["functionType"];
        } else {
            this.prizePoolType = FunctionType.FUNCTION_TYPE_CLASSIC;
        }
    },

    /**
     * @param {Number} panelId
     * @param {Number} lineIndex
     * @return {Line}
     */
    getLine: function (panelId, lineIndex) {
        return this.lines[panelId][lineIndex];
    },

    /**
     * @param {number} panelId
     * @returns {Number}
     */
    getLineCount: function (panelId) {
        return this.lines[panelId].length;
    },

    /**
     * @returns {number} the maximum line count of all panels
     */
    getMaxLineCount: function () {
        var result = 0;
        for (var i = 0; i < this.lines.length; ++ i)
        {
            var line1d = this.lines[i];
            if (line1d.length > result)
            {
                result = line1d.length;
            }
        }
        return result;
    },

    /**
     * @param {number} symbolId
     * @returns {Symbol}
     */
    getSymbol: function(symbolId) {
        return this.symbols[symbolId];
    },

    /**
     * @param {number} symbolId
     * @returns {number}
     */
    getSymbolWidht: function(symbolId) {
        return this.getSymbol(symbolId).symbolW;
    },

    /**
     * @param {number} symbolId
     * @returns {number}
     */
    getSymbolHeight: function(symbolId) {
        return this.getSymbol(symbolId).symbolH;
    },

    /**
     * get the symbol with maximum height
     * @returns {Symbol}
     */
    getMaxHeightSymbol: function() {
        var maxSymbolHeight = 0;
        var result = null;
        for (var symbolId in this.symbols) {
            if (this.symbols.hasOwnProperty(symbolId)) {
                var symbol = this.getSymbol(parseInt(symbolId));
                if (symbol.symbolH > maxSymbolHeight) {
                    maxSymbolHeight = symbol.symbolH;
                    result = symbol;
                }
            }
        }
        return result;
    },

    /**
     * @param {number} symbolId
     * @returns {boolean}
     */
    isConsecutiveSymbol: function(symbolId) {
        if (symbolId == SymbolId.SYMBOL_ID_INVALID || symbolId == -2) return false;
        var symbol = this.getSymbol(symbolId);
        return symbol.symbolH > 1;
    },

    getWinEffect: function (winLevel) {
        return this.winEffectMap[winLevel];
    },

    replaceBySpecialPaytable: function(specialPaytableObj) {
        var self = this;
        specialPaytableObj.value.forEach(function (paytable) {
            var symbolId = paytable.symbolId;
            delete paytable.symbolId;

            var symbol = self.getSymbol(symbolId);
            symbol.payTables = paytable;
        });
    }
};

module.exports = SubjectTmpl;