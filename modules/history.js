import SQLite from 'react-native-sqlite-storage'

var __historySQLite = null;
function __clearHistory(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`DROP TABLE ${tableName}`, [], (tx, results) => {
                console.log(results);
                resolve();
            });
        });
    });
}
function historyTableInit(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, tid INTEGER DEFAULT 0, cache TEXT, addtime INTEGER DEFAULT 0)`, [], (tx, results) => {
                console.log(results);
                resolve();
            });
        });
    });
}

function init() {
    return new Promise((resolve, reject)=>{
        __historySQLite = SQLite.openDatabase({name: 'history.db', location: 'default'}, async ()=>{
            await __clearHistory('UserBrowseHistory');
            await __clearHistory('UserReplyHistory');
            await historyTableInit('UserBrowseHistory');
            await historyTableInit('UserReplyHistory');
        }, (e)=>{
            resolve({status: 'error', errmsg: e});
        });
    });
}

function addNewHistory(mode, detail, time) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`INSERT INTO ${mode==='browse'?'UserBrowseHistory':'UserReplyHistory'}(tid, cache, addtime) VALUES(${detail.id},'${JSON.stringify(detail)}',${time})`, [], (tx, results) => {
                console.log(results);
                resolve();
            });
        });
    });
}

const history = {
    init: init,
    addNewHistory: addNewHistory
}
export { history }