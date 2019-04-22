import AsyncStorage from '@react-native-community/async-storage';
import { request, getUrl } from '../network'
import { configNetwork, configLocal, configDynamic } from '../../config'
import { getUserCookie, } from '../../cookie-manager'

/**
 * 检查一个串是否已订阅
 * @param {number} tid 串ID
 */
async function isSubscribed(tid) {
    if(configDynamic.feedTidList[configDynamic.islandMode] === null) {
        await getFeedList();
    }
    return configDynamic.feedTidList[configDynamic.islandMode].has(tid);
}
/**
 * 获取当前使用的订阅ID
 */
async function getFeedID() {
    if(configDynamic.feedID[configDynamic.islandMode] === null) {
        configDynamic.feedID[configDynamic.islandMode] = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].feedID);
        if(configDynamic.feedID[configDynamic.islandMode] === null) {
            configDynamic.feedID[configDynamic.islandMode] = Math.random().toString(36).substr(2);
            console.log(`new feedid:${configDynamic.feedID[configDynamic.islandMode]}`);
            AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].feedID, configDynamic.feedID[configDynamic.islandMode]);
            addFeedID(configDynamic.feedID[configDynamic.islandMode]);
        }
    }
    return configDynamic.feedID[configDynamic.islandMode];
}
/**
 * 添加订阅ID
 * @param {string} feedid 订阅ID
 */
async function addFeedID(feedid) {
    if(typeof feedid !== 'string' || feedid.length === 0) {
        return { status: 'err', errmsg: '请输入正确的订阅ID' };
    }
    var feedIDList = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].feedIDList);
    if(feedIDList === null) {
        feedIDList = [];
    }
    else {
        feedIDList = JSON.parse(feedIDList);
    }
    if(feedIDList.indexOf(feedid) >= 0) {
        return { status: 'err', errmsg: '已存在' };
    }
    feedIDList.push(feedid);
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].feedIDList, JSON.stringify(feedIDList));
    return { status: 'ok' };
}

/**
 * 移除订阅ID
 * @param {string} feedid 订阅ID
 */
async function removeFeedID(feedid) {
    if(typeof feedid !== 'string' || feedid.length === 0) {
        return { status: 'err', errmsg: '请输入正确的订阅ID' };
    }
    var feedIDList = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].feedIDList);
    if(feedIDList === null) {
        return { status: 'err', errmsg: '找不到该订阅ID' };
    }
    feedIDList = JSON.parse(feedIDList);
    if(feedIDList.indexOf(feedid) === -1) {
        return { status: 'err', errmsg: '找不到该订阅ID' };;
    }
    feedIDList.splice(feedIDList.indexOf(feedid),1);
    if(feedIDList.length === 0) {
        feedIDList.push(Math.random().toString(36).substr(2));
    }
    configDynamic.feedID[configDynamic.islandMode] = feedIDList[0];
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].feedID, configDynamic.feedID[configDynamic.islandMode]);
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].feedIDList, JSON.stringify(feedIDList));
    return { status: 'ok' };
}

/**
 * 获取订阅列表
 * @param {Number} feedid 订阅ID
 * @param {Number} page 第几页(无效)
 */
async function getFeedList(feedid = null, page = 1) {
    if(feedid === null) {
        feedid = await getFeedID();
    }
    let url = await getUrl(configNetwork.apiUrl.getFeed + '&uuid=' + feedid);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var response = await request(url, {
        method: 'POST',
        headers: {
            'cookie': await getUserCookie() 
        },
        body: {
            uuid: feedid,
            page: page
        },
    });
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    try {
        let resJSON = JSON.parse(response.body);
        configDynamic.feedTidList[configDynamic.islandMode] = new Set();
        resJSON.forEach(feedItem => {
            configDynamic.feedTidList[configDynamic.islandMode].add(feedItem.id);
        });
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

/**
 * 添加订阅
 * @param {number} tid 串ID
 */
async function addFeed(tid) {
    let feedID = await getFeedID();
    let url = await getUrl(configNetwork.apiUrl.addFeed);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var response = await request(url, {
        method: 'POST',
        headers: {
            'cookie': await getUserCookie() 
        },
        body: {
            uuid: feedID,
            tid: tid
        },
    });
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    try {
        let resJSON = JSON.parse(response.body);
        if(resJSON === '订阅大成功→_→') {
            configDynamic.feedTidList[configDynamic.islandMode].add(tid);
        }
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

/**
 * 删除订阅
 * @param {number} tid 串ID
 */
async function delFeed(tid) {
    let feedID = await getFeedID();
    let url = await getUrl(configNetwork.apiUrl.delFeed);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var response = await request(url, {
        method: 'POST',
        headers: {
            'cookie': await getUserCookie() 
        },
        body: {
            uuid: feedID,
            tid: tid
        },
    });
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    try {
        let resJSON = JSON.parse(response.body);
        if(resJSON === '取消订阅成功!') {
            configDynamic.feedTidList[configDynamic.islandMode].delete(tid);
        }
        return { status: 'ok', res: resJSON };
    } catch (error) {
        console.warn(error);
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

export { 
    /**
     * 获取订阅列表
     */
    getFeedList,
    /**
     * 将新串添加到订阅列表
     */
    addFeed,
    /**
     * 从订阅列表删除串
     */
    delFeed,
    /**
     * 检查串是否已订阅
     */
    isSubscribed,
    /**
     * 获取订阅ID（如果没有则自动生成
     */
    getFeedID,
    /**
     * 添加一个订阅ID
     */
    addFeedID,
    /**
     * 删除一个订阅ID（如果删除完了则再自动生成一个
     */
    removeFeedID
};