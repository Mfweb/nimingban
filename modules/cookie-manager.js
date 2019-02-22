import { AsyncStorage } from 'react-native'
import { configNetwork, configLocal, configDynamic } from './config'

/**
 * 将cookie字符串转为object
 * @param {string} cookieStr set-cookie格式的cookie字符串
 */
function _cookieStrToJson(cookieStr){
    if(cookieStr == null) {
        return null;
    }
    let outCookie = new Object();
    let cookieLine = cookieStr.replace(/ /g,'').split(';');
    cookieLine.forEach(item => {
        let cookie = item.split('=');
        if(cookie.length == 2) {
            if(cookie[0] != 'path' && cookie[0] != 'expires' && cookie[0] != 'Max-Age') {
                outCookie[cookie[0]] = cookie[1];
            }
        }
    });
    return outCookie;
}

/**
 * 将object格式cookie转为字符串格式
 * @param {object} cookieIn object格式cookie
 */
function _cookieJsonToStr(cookieIn) {
    var outCookie = '';
    for(var key in cookieIn) {
        outCookie += `${key}=${cookieIn[key]};`;
    }
    if(outCookie.length > 2) {
        outCookie = outCookie.substr(0, outCookie.length - 1);
    }
    return outCookie;
}

/**
 * 清空所有cookie
 */
async function clearCookie() {
    configDynamic.systemCookie[configDynamic.islandMode] = null;
    await AsyncStorage.removeItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie);
}

/**
 * 更新cookie，如果有就覆盖，如果没有就增加
 * @param {string} cookieIn 要设置的cookies
 */
async function saveCookie(cookieIn) {
    console.log('save:' + cookieIn);
    let savedCookies = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie);
    if(savedCookies != null) {
        savedCookies = _cookieStrToJson(savedCookies);
    }
    if(savedCookies == null) {
        savedCookies = new Object();
    }

    let cookieLine = _cookieStrToJson(cookieIn);
    for(var key in cookieLine) {
        savedCookies[key] = cookieLine[key];
    }

    let saveString = _cookieJsonToStr(savedCookies);
    configDynamic.systemCookie[configDynamic.islandMode] = saveString;
    console.log('save', saveString);
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie, saveString);
}

/**
 * 从缓存获取cookie
 */
async function getCookie() {
    if(configDynamic.systemCookie[configDynamic.islandMode] != null) {
        return configDynamic.systemCookie[configDynamic.islandMode];
    }
    let temp = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie);
    configDynamic.systemCookie[configDynamic.islandMode] = temp==null?'':temp;
    console.log('read:', configDynamic.systemCookie[configDynamic.islandMode]);
    return configDynamic.systemCookie[configDynamic.islandMode];
}
/****************用户饼干****************/
/**
 * 从原始数据获取并应用一个饼干
 * @param {string} rawString 原始数据
 */
async function setUserCookieFromString(rawString) {
    let cookieLine = _cookieStrToJson(rawString);
    if(cookieLine == null) {
        return false;
    }

    if(cookieLine.hasOwnProperty('userhash')) {
        setUserCookie(cookieLine['userhash']);
        await addUserCookieList('userMember', cookieLine['userhash']);//添加到饼干列表
        return true;
    }
    else {
        return false;
    }
}

/**
 * 直接应用一个饼干
 * @param {string} value 饼干内容
 */
async function setUserCookie(value) {
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].userCookie, `userhash=${value}`);
    configDynamic.userCookie[configDynamic.islandMode] = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].userCookie);
}

/**
 * 获取用户饼干
 */
async function getUserCookie() {
    if(configDynamic.userCookie[configDynamic.islandMode] !== null) {
        return configDynamic.userCookie[configDynamic.islandMode];
    }
    configDynamic.userCookie[configDynamic.islandMode] = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].userCookie);
    console.log('cookie:', configDynamic.userCookie[configDynamic.islandMode]);
    return configDynamic.userCookie[configDynamic.islandMode];
}

/**
 * 增加一个新饼干
 * @param {string} mark 标记
 * @param {string} newCookie 饼干内容
 */
async function addUserCookieList(mark, value) {
    let allCookies = await getUserCookieList();
    for(let i = 0; i < allCookies.length; i++) {
        if(allCookies[i].value == value) {
            return false;
        }
    }
    let newCookieObj = {
        mark: mark,
        value: value
    };
    allCookies.push(newCookieObj);
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].userCookieList, JSON.stringify(allCookies));
    return true;
}
/**
 * 移除指定饼干
 * @param {string} value 内容
 */
async function removeUserCookieList(value) {
    let allCookies = await getUserCookieList();
    for(let i = 0; i < allCookies.length; i++) {
        if(allCookies[i].value == value) {
            allCookies.splice(i, 1);
            await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].userCookieList, JSON.stringify(allCookies));
            break;
        }
    }
}
/**
 * 获取所有用户饼干
 */
async function getUserCookieList() {
    let tempCookies = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].userCookieList);
    if(tempCookies) {
        try {
            return JSON.parse(tempCookies);
        } catch {
        }
    }
    return [];
}
export { 
    saveCookie, 
    getCookie, 
    clearCookie, 
    setUserCookieFromString, 
    setUserCookie,
    getUserCookie,
    addUserCookieList,
    getUserCookieList,
    removeUserCookieList
}