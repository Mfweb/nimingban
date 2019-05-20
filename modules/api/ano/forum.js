import AsyncStorage from '@react-native-community/async-storage';
import { request, getUrl } from '../network'
import { configNetwork, configLocal, configDynamic } from '../../config'
import { getUserCookie } from '../../cookie-manager'
import { history } from '../../history'

/**
 * 将板块名字提取出来并缓存
 * @param {object} forumNames 板块完整列表
 */
async function saveForumNameCache(forumNames) {
    let forumNameList = new Object();
    forumNames.forEach(groupItem => {
        groupItem.forums.forEach(item=>{
            forumNameList[item.id.toString()] = item.name;
        });
    });
    configDynamic.forumNamecache[configDynamic.islandMode] = forumNameList;
    await AsyncStorage.setItem(
        configLocal.localStorageName[configDynamic.islandMode].forumNameCache,
        JSON.stringify(forumNameList)
    );
}

/**
 * 获取板块名字列表
 */
async function getForumNameCache() {
    if(configDynamic.forumNamecache[configDynamic.islandMode] == null) {
        let localData = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].forumNameCache);
        if(localData == null) {
            await getForumList(true);
        }
        else {
            configDynamic.forumNamecache[configDynamic.islandMode] = JSON.parse(localData);
        }
    }
    return configDynamic.forumNamecache[configDynamic.islandMode];
}

/**
 * 获取板块列表
 * @param {bool} force 是否强制从网络端获取
 */
async function getForumList(force = false) {
    let localItem = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].forumCache);
    // 本地没有缓存，或者需要强制获取
    if(localItem === null || force === true) {
        let url = await getUrl(configNetwork.apiUrl.getForumList);
        if(url === null) {
            return { status: 'error', errmsg: '获取host失败' };
        }
        var response = await request(url);
        if(response.stateCode != 200) {
            return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
        }
        localItem = response.body
        // 缓存到本地
        await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].forumCache, localItem);
    }

    try {
        let resJSON = JSON.parse(localItem);
        if(force === true) {
            saveForumNameCache(resJSON);
        }
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: error };
    }
}

/**
 * 获取板块内串列表
 * @param {Number} fid 板块ID
 * @param {Number} page 第几页
 */
async function getThreadList(fid, page) {
    let url = await getUrl((fid == -1)?configNetwork.apiUrl.timeLine:configNetwork.apiUrl.getForumThread);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var response = await request(url, {
        method: 'POST',
        headers: {
            'cookie': await getUserCookie()
        },
        body: {
            id: fid,
            page: page
        },
    });

    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    try {
        let resJSON = JSON.parse(response.body);
        if( fid == -1 ) {
            let forumNameList = await getForumNameCache();
            if(forumNameList !== null) {
                resJSON.forEach(item => {
                    item.fname = forumNameList[item.fid.toString()];
                });
            }
        }
        // 缓存串
        history.addNewHistory('cache', {replyTo: 0, datas: resJSON});
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

/**
 * 根据板块ID获取板块名字
 * @param {string} fid 板块ID
 */
async function getForumNameByID(fid) {
    let forumNameList = await getForumNameCache();
    if(forumNameList === null) {
        return 'Unknow';
    }
    return forumNameList[fid.toString()];
}

/**
 * 根据名字查找板块ID
 * @param {string} name 板块名字
 */
async function getForumIDByName(name) {
    let forumNameList = await getForumNameCache();
    if(forumNameList === null) {
        return 'Unknow';
    }
    return Object.keys(forumNameList).find(k => {return forumNameList[k] == name})
}

export {
    /**
     * 获取板块列表
     */
    getForumList,
    /**
     * 获取板块中串列表
     */
    getThreadList,
    /**
     * 通过ID获取板块名
     */
    getForumNameByID,
    /**
     * 通过板块名获取ID
     */
    getForumIDByName,
    /**
     * 将板块名字提取出来并缓存
     */
    saveForumNameCache,
    /**
     * 获取板块名字列表
     */
    getForumNameCache
};