var DeviceInfo = require("../../common/util/DeviceInfo");
var SpinRegionPolicy = require("../enum/SpinRegionPolicy");

/**
 * Created by alanmars on 15/4/15.
 */
var SubjectPanel = function() {
    this.panelId = 0;
    this.slotCols = 0;
    this.slotRows = 0;
    this.spinRegionPolicy = SpinRegionPolicy.SPIN_REGION_POLICY_IPHONE4;
    /**
     * @type {cc.rect}
     */
    this.spinRegion = null;
    /**
     * @type {cc.Point}
     * @type {null}
     */
    this.spinRegionScale = null;
    /**
     * @type {cc.p}
     */
    this.subBgPos = null;
    this.winFrameName = null;
    this.winFrameAnimName = null;
    this.winFrameSX = 1;
    this.winFrameSY = 1;
    this.columnNormalBg = null;
    this.columnFreeSpinBg = null;
    this.subBgName = null;
    this.slotsWidth = 0;
    this.colShift = 0;
    this.rowShift = 0;
    this.eachRowCounts = [];
    this.spinLayerType = 0;
    this.checkConnectedIds = [];
};

SubjectPanel.prototype = {
    constructor: SubjectPanel,
    unmarshal: function(jsonObj) {
        this.panelId = jsonObj["panelId"];
        this.slotCols = jsonObj["slotCols"];
        this.slotRows = jsonObj["slotRows"];

        var spinRegionComps;
        var platformOffset = DeviceInfo.getPlatformOffset();
        this.spinRegionPolicy = jsonObj["spinRegionPolicy"] || SpinRegionPolicy.SPIN_REGION_POLICY_IPHONE4;
        if (this.spinRegionPolicy === SpinRegionPolicy.SPIN_REGION_POLICY_IPHONE4) {
            spinRegionComps = jsonObj["spinRegion"];
            this.spinRegion = cc.rect(
                spinRegionComps[0] + platformOffset.x,
                spinRegionComps[1] + platformOffset.y,
                spinRegionComps[2],
                spinRegionComps[3]
            );
            this.spinRegionScale = cc.p(1.0, 1.0);
        } else if (this.spinRegionPolicy === SpinRegionPolicy.SPIN_REGION_POLICY_BOTH) {
            var winSize = cc.director.getWinSize();
            if (winSize.height === 640) {
                spinRegionComps = jsonObj["spinRegionIphone4"];
                this.spinRegionScale = cc.p(spinRegionComps[4], spinRegionComps[5]);
                this.spinRegion = cc.rect(
                    spinRegionComps[0] - (1/this.spinRegionScale.x - 1)*0.5*spinRegionComps[2] + platformOffset.x,
                    spinRegionComps[1] - (1/this.spinRegionScale.y - 1)*0.5*spinRegionComps[3] + platformOffset.y,
                    spinRegionComps[2]/this.spinRegionScale.x,
                    spinRegionComps[3]/this.spinRegionScale.y
                );
            } else if (winSize.height === 768) {
                spinRegionComps = jsonObj["spinRegionIpad"];
                this.spinRegionScale = cc.p(spinRegionComps[4], spinRegionComps[5]);
                this.spinRegion = cc.rect(
                    spinRegionComps[0] - (1/this.spinRegionScale.x - 1)*0.5*spinRegionComps[2] + platformOffset.x,
                    spinRegionComps[1] - (1/this.spinRegionScale.y - 1)*0.5*spinRegionComps[3] + platformOffset.y,
                    spinRegionComps[2]/this.spinRegionScale.x,
                    spinRegionComps[3]/this.spinRegionScale.y
                );
            } else {
                throw new Error("Unsupported resolution");
            }
        } else {
            throw new Error("Unsupported spinRegionPolicy: " + this.spinRegionPolicy);
        }

        var subBgPosComps = jsonObj["subBgPos"];
        this.subBgPos = cc.p(subBgPosComps[0], subBgPosComps[1]);

        this.winFrameName = jsonObj["winFrameName"];
        this.winFrameAnimName = jsonObj["winFrameAnimName"];
        this.winFrameSX = jsonObj["winFrameSX"] || 1;
        this.winFrameSY = jsonObj["winFrameSY"] || 1;
        this.columnNormalBg = jsonObj["columnNormalBg"];
        this.columnFreeSpinBg = jsonObj["columnFreeSpinBg"];
        this.subBgName = jsonObj["subBgName"];
        this.slotsWidth = jsonObj["slotsWidth"];
        this.colShift = jsonObj["colShift"];
        this.rowShift = jsonObj["rowShift"];
        this.spinLayerType = jsonObj["spinLayerType"];
        this.eachRowCounts = jsonObj["eachRowCounts"];
        if(!this.eachRowCounts || this.eachRowCounts.length < this.slotCols) {
            this.eachRowCounts = [];
            for(var col = 0; col < this.slotCols; col++) {
                this.eachRowCounts.push(this.slotRows);
            }
        }
        this.checkConnectedIds = jsonObj["checkConnectedIds"] || [];
    }
};

module.exports = SubjectPanel;