/**
 * Created by qinning on 15/4/23.
 */

var PlayerMan = require("../model/PlayerMan");

var PurchaseTableName = "user_purchase_info";
var PurchaseTableColumn = {
    TRANSACTION_ID : "transactionId",
    USER_ID : "user_id",
    PURCHASE_INFO : "purchaseInfo"
};

/** usage
   if(cc.sys.isNative){
        var dbName = "data.db";
        jsb_wtc.DBHelper.getInstance().openDBHelperWithFileName(dbName);
        var createTableSql = Util.sprintf("create table if not exists %s" +
        "(" +
        "   %s text primary key," +
        "   %s text," +
        "   %s text" +
        ")","user_purchase_info","transactionId","user_id","purchaseInfo");
        if(jsb_wtc.DBHelper.getInstance().createTableWithContent(createTableSql)){
            cc.log("create table ok");
        }else{
            cc.log("create table fail");
        }

        jsb_wtc.DBHelper.getInstance().insertTableDataWithContent(Util.sprintf("insert into %s (%s,%s,%s) values (%s,%s,%s)","user_purchase_info","transactionId","user_id","purchaseInfo","111","222","333"));
        jsb_wtc.DBHelper.getInstance().updateTableDataWithContent(Util.sprintf("update %s set %s = %s where %s = %s","user_purchase_info","user_id","555","user_id","333"));
        //jsb_wtc.DB.sharedDB().UpdateTableDataWithContent("update user_purchase_info set purchaseInfo = lll");
        var st = jsb_wtc.DBHelper.getInstance().getTableData(Util.sprintf("select * from %s","user_purchase_info"));
        while(st.nextRow()){
            cc.log(st.valueString(1));
        }
    }
 */

var dbController = cc.Class.extend({
    dbName : "data.db",
    ctor : function(){
        jsb_wtc.DBHelper.getInstance().openDBHelperWithFileName(this.dbName);
    },

    createPurchaseTable : function(){
        var createTableSql = Util.sprintf("create table if not exists %s" +
        "(" +
        "   %s text primary key," +
        "   %s text," +
        "   %s text" +
        ")",PurchaseTableName,PurchaseTableColumn.TRANSACTION_ID,PurchaseTableColumn.USER_ID,PurchaseTableColumn.PURCHASE_INFO);
        if(jsb_wtc.DBHelper.getInstance().createTableWithContent(createTableSql)){
            cc.log("create table ok");
        }else{
            cc.log("create table fail");
        }
    },

    /**
     * if not exist,then insert or else update
     * @param transactionId
     * @param purchaseInfo
     * @returns {boolean}
     */
    updatePurchaseInfo : function(transactionId,purchaseInfo){
        var st = jsb_wtc.DBHelper.getInstance().getTableData(Util.sprintf("select * from %s where %s = %s",PurchaseTableName,PurchaseTableColumn.TRANSACTION_ID,transactionId));
        if(st.nextRow()) {
            return jsb_wtc.DBHelper.getInstance().updateTableDataWithContent(Util.sprintf("update %s set %s = %s where %s = %s and %s = %s", PurchaseTableName,
                PurchaseTableColumn.PURCHASE_INFO, purchaseInfo, PurchaseTableColumn.TRANSACTION_ID, transactionId, PurchaseTableColumn.USER_ID, this.getUserId()));
        }else{
            return jsb_wtc.DBHelper.getInstance().insertTableDataWithContent(Util.sprintf("insert into %s (%s,%s,%s) values (%s,%s,%s)", PurchaseTableName,
                PurchaseTableColumn.TRANSACTION_ID,PurchaseTableColumn.USER_ID,PurchaseTableColumn.PURCHASE_INFO, transactionId,this.getUserId(),purchaseInfo));
        }
    },
    getAllPurchaseInfo : function(){
        var result = {};
        var userId = this.getUserId();
        var st = jsb_wtc.DBHelper.getInstance().getTableData(Util.sprintf("select %s, %s from %s where user_id=%s",PurchaseTableColumn.TRANSACTION_ID,PurchaseTableColumn.PURCHASE_INFO,PurchaseTableName,userId));
        while(st.nextRow()){
            var transactionId = st.valueString(0);
            var purchaseInfo = st.valueString(1);
            result[transactionId] = purchaseInfo;
        }
        return result;
    },

    getUserId : function(){
        return PlayerMan.getInstance().playerId;
    }
});

dbController._instance = null;
dbController._firstUseInstance = true;

/**
 *
 * @returns {dbController}
 */
dbController.getInstance = function () {
    if (dbController._firstUseInstance) {
        dbController._firstUseInstance = false;
        dbController._instance = new dbController();
    }
    return dbController._instance;
};

module.exports = dbController;