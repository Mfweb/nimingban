import SQLite from 'react-native-sqlite-storage'
import { configDynamic, configLocal } from './config'
import RNFS from 'react-native-fs'

const modeString = {
    browse: 'UserBrowseHistory',
    reply: 'UserReplyHistory',
    image: 'UserImageHistory',
    cache: 'UserThreadCache'
};

var __historySQLite = null;

/**
 * 删掉某一个表
 * @param {string} tableName 表名
 */
function __deleteHistoryTable(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`DROP TABLE ${tableName}`, [], (tx, results) => {
                resolve();
            });
        });
    });
}

/**
 * 清空某一个表
 * @param {string} mode 表名
 */
function clearHistory(mode) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`DELETE FROM ${modeString[mode]}`, [], (tx, results) => {
                resolve(results);
            });
        });
    });
}
/**
 * 创建某一个表
 * @param {string} tableName 表名
 */
function historyTableInit(tableName) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (id INTEGER PRIMARY KEY AUTOINCREMENT, island VARCHAR(5), tid INTEGER DEFAULT 0, cache TEXT, addtime INTEGER DEFAULT 0)`, [], (tx, results) => {
                console.log(results);
                tx.executeSql(`CREATE UNIQUE INDEX index_island_only_${tableName} on ${tableName} (island, tid);`);
                resolve();
            });
        });
    });
}

/**
 * 创建串缓存表
 */
function cacheTableInit() {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`CREATE TABLE IF NOT EXISTS UserThreadCache (id INTEGER PRIMARY KEY, island VARCHAR(8), img VARCHAR(128), ext VARCHAR(8), now VARCHAR(64), userid VARCHAR(128), name TEXT, email TEXT, title TEXT, content TEXT, sage INTEGER DEFAULT 0, admin INTEGER DEFAULT 0, replyCount INTEGER DEFAULT 0, replyTo INTEGER DEFAULT 0)`, [], (tx, results) => {
                console.log(results);
                tx.executeSql(`CREATE UNIQUE INDEX index_island_only_UserThreadCache on UserThreadCache (island, id);`);
                resolve();
            });
        });
    });
}

/**
 * 数据库初始化
 */
function init() {
    return new Promise((resolve, reject)=>{
        __historySQLite = SQLite.openDatabase({name: 'history.db', location: 'default'}, async ()=>{
            await historyTableInit('UserBrowseHistory');
            await historyTableInit('UserReplyHistory');
            await historyTableInit('UserImageHistory');
            await cacheTableInit();
        }, (e)=>{
            resolve({status: 'error', errmsg: e});
        });
    });
}
/**
 * 插入内容到历史记录
 * @param {string} mode 插入到哪一个表里
 * @param {object} detail 串内容
 * @param {int} time 时间戳
 */
function addNewHistory(mode, detail, time) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            if(mode === 'cache') {
                let sql = `REPLACE INTO ${modeString[mode]}(id,island,img,ext,now,userid,name,email,title,content,sage,admin,replyCount,replyTo)`;
                for(let i = 0; i < detail.datas.length; i++) {
                    let item = detail.datas[i];
                    sql +=
                    ` SELECT ${item.id},'${configDynamic.islandMode}','${item.img}','${item.ext}','${item.now}', '${item.userid}','${item.name}', '${item.email}','${item.title}','${item.content}',${item.sage},${item.admin},0,${detail.replyTo}`
                    if(i !== detail.datas.length - 1) {
                        sql += ' UNION ALL';
                    }
                }
                tx.executeSql(sql, [], (tx, results) => {
                    resolve();
                });
                return;
            }
            tx.executeSql(`REPLACE INTO ${modeString[mode]}(island, tid, cache, addtime) VALUES('${configDynamic.islandMode}',${detail.id},'${JSON.stringify(detail)}',${time})`, [], (tx, results) => {
                resolve();
            });
        });
    });
}

/**
 * 获取历史记录
 * @param {string} mode 哪一个记录
 * @param {int} page 分页
 */
async function getHistory(mode, page) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`SELECT * FROM ${modeString[mode]} WHERE island='${configDynamic.islandMode}' ORDER BY addtime DESC LIMIT ((${page}-1)*20),20`, [], (tx, results) => {
                resolve(results);
            });
        });
    });
}

/**
 * 从缓存获取某个ID的内容
 * @param {string} id ID
 */
async function getDetailFromCache(id) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            tx.executeSql(`SELECT * FROM UserThreadCache WHERE island='${configDynamic.islandMode}' AND id=${id}`, [], (tx, results) => {
                resolve(results);
            });
        });
    });
}

/**
 * 从缓存中获取串数据
 * @param {number} tid 串ID
 * @param {number} page 分页
 */
async function getThreadReplys(tid, page) {
    return new Promise((resolve, reject) => {
        __historySQLite.transaction((tx) => {
            // 获取主题串
            tx.executeSql(`SELECT * FROM UserThreadCache WHERE island='${configDynamic.islandMode}' AND id=${tid} AND replyTo=0`, [], (tx, results) => {
                if(results.rows.length === 0) {
                    resolve({status: 'error'});
                    return;
                }
                var threadDetail = results.rows.item(0);
                // 获取回复
                tx.executeSql(`SELECT * FROM UserThreadCache WHERE island='${configDynamic.islandMode}' AND replyTo=${tid} ORDER BY now DESC LIMIT ((${page}-1)*19),19`, [], (tx, results) => {
                    threadDetail.replys = results.rows.raw();
                    resolve({status: 'ok', data: threadDetail});
                });
            });
        });
    });
}

const history = {
    init: init,
    addNewHistory: addNewHistory,
    getHistory: getHistory,
    getDetailFromCache: getDetailFromCache,
    clearHistory: clearHistory,
    getThreadReplys: getThreadReplys
}
export { history }