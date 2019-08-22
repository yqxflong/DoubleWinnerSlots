var ClassicSlotMan = require("../model/ClassicSlotMan");
var SlotConfigMan = require("../config/SlotConfigMan");
var SlotSceneType = require("../enum/SlotSceneType");
var NormalSlotScene = require("./NormalSlotScene");
var ClassicSlotScene = require("./ClassicSlotScene");

//Double winner
var MagicWorld60101SlotScene = require("./MagicWorld60101SlotScene");
var MagicWorld60102SlotScene = require("./MagicWorld60102SlotScene");
var MagicWorld60103SlotScene = require("./MagicWorld60103SlotScene");
var MagicWorld60104SlotScene = require("./MagicWorld60104SlotScene");
var MagicWorld60105SlotScene = require("./MagicWorld60105SlotScene");
var MagicWorld60106SlotScene = require("./MagicWorld60106SlotScene");
var MagicWorld60107SlotScene = require("./MagicWorld60107SlotScene");
var MagicWorld60108SlotScene = require("./MagicWorld60108SlotScene");
var MagicWorld60109SlotScene = require("./MagicWorld60109SlotScene");
var MagicWorld60110SlotScene = require("./MagicWorld60110SlotScene");

/**
 * Created by alanmars on 15/5/26.
 */
var SlotSceneFactory = {
    create: function () {
        var result;
        var subjectId = ClassicSlotMan.getInstance().subjectId;
        var subject = SlotConfigMan.getInstance().getSubject(subjectId);
        var subjectTmpl = SlotConfigMan.getInstance().getSubjectTmpl(subject.subjectTmplId);
        switch (subjectTmpl.slotSceneType) {
            case SlotSceneType.SLOT_SCENE_NORMAL:
                result = new NormalSlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_CLASSIC:
                result = new ClassicSlotScene();
                break;

            // Double winner
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_01:
                result = new MagicWorld60101SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_02:
                result = new MagicWorld60102SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_03:
                result = new MagicWorld60103SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_04:
                result = new MagicWorld60104SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_05:
                result = new MagicWorld60105SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_06:
                result = new MagicWorld60106SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_07:
                result = new MagicWorld60107SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_08:
                result = new MagicWorld60108SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_09:
                result = new MagicWorld60109SlotScene();
                break;
            case SlotSceneType.SLOT_SCENE_MAGIC_WORLD_10:
                result = new MagicWorld60110SlotScene();
                break;
        }

        return result;
    }
};

module.exports = SlotSceneFactory;