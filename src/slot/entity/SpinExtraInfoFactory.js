var NormalSpinExtraInfo = require("./NormalSpinExtraInfo");
var ScatterSpinExtraInfo = require("./ScatterSpinExtraInfo");
var ClassicLockSpinExtraInfo = require("./ClassicLockSpinExtraInfo");
var JackpotDiamondSpinExtraInfo = require("./JackpotDiamondSpinExtraInfo");
var SpinExtraInfoType = require("../enum/SpinExtraInfoType");
var GodsAndKingsSpinExtraInfo = require("./GodsAndKingsSpinExtraInfo");
var TunnelOfFearSpinExtraInfo = require("./TunnelOfFearSpinExtraInfo");
var WatersOfAtlantisSpinExtraInfo = require("./WatersOfAtlantisSpinExtraInfo");
var VolcanoHellSpinExtraInfo = require("./VolcanoHellSpinExtraInfo");

// Double Winner
var MagicWorld60101SpinExtraInfo = require("./MagicWorld60101SpinExtraInfo");
var MagicWorld60102SpinExtraInfo = require("./MagicWorld60102SpinExtraInfo");
var MagicWorld60103SpinExtraInfo = require("./MagicWorld60103SpinExtraInfo");
var MagicWorld60104SpinExtraInfo = require("./MagicWorld60104SpinExtraInfo");
var MagicWorld60105SpinExtraInfo = require("./MagicWorld60105SpinExtraInfo");
var MagicWorld60106SpinExtraInfo = require("./MagicWorld60106SpinExtraInfo");
var MagicWorld60107SpinExtraInfo = require("./MagicWorld60107SpinExtraInfo");
var MagicWorld60108SpinExtraInfo = require("./MagicWorld60108SpinExtraInfo");
var MagicWorld60109SpinExtraInfo = require("./MagicWorld60109SpinExtraInfo");
var MagicWorld60110SpinExtraInfo = require("./MagicWorld60110SpinExtraInfo");

/**
 * Created by qinning on 15/4/27.
 */
var SpinExtraInfoFactory = {
    create: function(type) {
        var result = null;
        switch (type) {
            case SpinExtraInfoType.NORMAL_EXTRA_INFO:
                result = new NormalSpinExtraInfo();
                break;
            case SpinExtraInfoType.SCATTER_EXTRA_INFO:
                result = new ScatterSpinExtraInfo();
                break;
            case SpinExtraInfoType.CLASSIC_LOCK_EXTRA_INFO:
                result = new ClassicLockSpinExtraInfo();
                break;
            case SpinExtraInfoType.JACKPOT_DIAMOND_EXTRA_INFO:
                result = new JackpotDiamondSpinExtraInfo();
                break;

            //Grand Win
            case SpinExtraInfoType.GOD_KING_EXTRA_INFO:
                result = new GodsAndKingsSpinExtraInfo();
                break;
            case SpinExtraInfoType.TUNNEL_OF_FEAR_EXTRA_INFO:
                result = new TunnelOfFearSpinExtraInfo();
                break;
            case SpinExtraInfoType.WATERS_OF_ATLANTIS_EXTRA_INFO:
                result = new WatersOfAtlantisSpinExtraInfo();
                break;
            case SpinExtraInfoType.VOLCANO_HELL_EXTRA_INFO:
                result = new VolcanoHellSpinExtraInfo();
                break;

            // Double Winner
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_01:
                result = new MagicWorld60101SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_02:
                result = new MagicWorld60102SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_03:
                result = new MagicWorld60103SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_04:
                result = new MagicWorld60104SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_05:
                result = new MagicWorld60105SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_06:
                result = new MagicWorld60106SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_07:
                result = new MagicWorld60107SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_08:
                result = new MagicWorld60108SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_09:
                result = new MagicWorld60109SpinExtraInfo();
                break;
            case SpinExtraInfoType.MAGIC_WORLD_EXTRA_INFO_10:
                result = new MagicWorld60110SpinExtraInfo();
                break;
        }
        return result;
    }
};

module.exports = SpinExtraInfoFactory;