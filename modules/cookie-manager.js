import { AsyncStorage } from 'react-native'
import { configNetwork, configLocal, configDynamic } from './config'

var __systemJSONCache = null;
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
    __systemJSONCache = null;
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
    __systemJSONCache = saveString;
    console.log('save', saveString);
    await AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie, saveString);
}

/**
 * 从缓存获取cookie
 */
async function getCookie() {
    if(__systemJSONCache != null) {
        return __systemJSONCache;
    }
    let temp = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].memberCookie);
    __systemJSONCache = temp==null?'':temp;
    console.log('read:', __systemJSONCache);
    return __systemJSONCache;
}

export { saveCookie, getCookie, clearCookie }