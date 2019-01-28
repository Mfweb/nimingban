import { AsyncStorage,Platform } from 'react-native'
import RNFS from 'react-native-fs';
import { apiFunctions } from './apis'
import { request } from './network'

const memberApiURLs = {
    getVerifyCode: "/Member/User/Index/verify.html", //请求验证码

    memberLogin: "/Member/User/Index/login.html",//登录
    memberLogout: "/Member/User/Index/logout.html",//退出登录

    memberSignup: "/Member/User/Index/sendRegister.html",//注册
    memberForgotPasswd: "/Member/User/Index/sendForgotPassword.html",//忘记密码
    memberChangePassword: "/Member/User/Index/changePassword.html",//修改密码

    memberCheckSession: "/Member/User/Index/index.html",//检查是Session是否有效
    memberGetCookiesList: "/Member/User/Cookie/index.html",//饼干列表
    memberDeleteCookie: "/Member/User/Cookie/delete/id/",//删除饼干
    memberGetCookieDetail: "/Member/User/Cookie/switchTo/id/",//获取饼干内容
    memberGetNewCookie: "/Member/User/Cookie/apply.html",//获取新饼干
    
    memberGetCertifiedStatus: "/Member/User/Authentication/mobile.html",//认证状态
    memberStartMobileCert: "/Member/User/Authentication/mobileReverseAuthCode",//手机认证
    memberMobileCheck: "/Member/User/Authentication/isBindMobile",//手机认证校验
    
    getAuthPhone: "https://amember.mfweb.top/adao/member/getphone.php",//获取三酱验证手机号
}

function cookieStrToJson(cookieStr){
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

function cookieJsonToStr(cookieIn) {
    var outCookie = '';
    for(var key in cookieIn) {
        outCookie += `${key}=${cookieIn[key]};`;
    }
    if(outCookie.length > 2) {
        outCookie = outCookie.substr(0, outCookie.length - 1);
    }
    return outCookie;
}

async function _clearCookie() {
    await AsyncStorage.removeItem('MemberCookies');
}
/**
 * 更新饼干，如果有就覆盖，如果没有就增加
 * @param {string} cookieIn 要设置的cookies
 */
async function _saveCookie(cookieIn) {
    let savedCookies = await AsyncStorage.getItem('MemberCookies');
    if(savedCookies != null) {
        savedCookies = cookieStrToJson(savedCookies);
    }
    if(savedCookies == null) {
        savedCookies = new Object();
    }

    let cookieLine = cookieStrToJson(cookieIn);
    for(var key in cookieLine) {
        savedCookies[key] = cookieLine[key];
    }

    let saveString = cookieJsonToStr(savedCookies);
    console.log('save', saveString);
    await AsyncStorage.setItem('MemberCookies', saveString);
}
async function _getCookie() {
    let temp = await AsyncStorage.getItem('MemberCookies');
    console.log('read:', temp);
    return temp==null?'':temp;
}

/**
 * 检查Session是否有效
 */
async function checkSession() {
    let url = await apiFunctions.checkRedirect();
    if(url == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    url += memberApiURLs.memberCheckSession;

    let res = await request(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'cookie': await _getCookie()
        },
        timeout: 16000
    });
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    if(res.headers.hasOwnProperty('Set-Cookie')) {
        await _saveCookie(res.headers['Set-Cookie']);
    }
    let resText = res.body;
    if(resText.indexOf('饼干管理') > 0) {
        return {status: 'ok', session: true}
    }
    else {
        return {status: 'ok', session: false}
    }
}

/**
 * 获取验证码
 * 必须保证之前调用过其他memberAPI，session已经同步
 */
async function getVerifyCode() {
    let imgUrl = await apiFunctions.checkRedirect();
    if(imgUrl == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    imgUrl += memberApiURLs.getVerifyCode;
    try {
        var localPath = apiFunctions.localDir.imageCacheThumb + '/vcode.png';

        if ( !await RNFS.exists(apiFunctions.localDir.imageCacheThumb) ) {
            await RNFS.mkdir(apiFunctions.localDir.imageCacheThumb, { NSURLIsExcludedFromBackupKey: true });
        }
        if ( !await RNFS.exists(apiFunctions.localDir.imageCacheFull) ) {
            await RNFS.mkdir(apiFunctions.localDir.imageCacheFull, { NSURLIsExcludedFromBackupKey: true });
        }

        if ( await RNFS.exists(localPath) ) {
            await RNFS.unlink(localPath);
        }
        let downloadRes = await RNFS.downloadFile({
            fromUrl: imgUrl,
            toFile: localPath,
            headers: {'cookie': await _getCookie()},
            background: true,
            discretionary: true,
            cacheable: true,
        });

        let downloadStaRes = await downloadRes.promise;
        if(downloadStaRes.statusCode == 200 && downloadStaRes.bytesWritten > 0) {
            return {
                status: 'ok',
                path: localPath
            }
        }
        else {
            return {
                status: 'error',
                errmsg: 'http:' + downloadStaRes.statusCode.toString(),
                path: localPath
            }
        }

    } catch (error) {
        return {
            status: 'error',
            errmsg: error,
            path: localPath
        }
    }
}

/**
 * 登录
 * @param {string} username 用户名
 * @param {string} password 密码
 * @param {string} vcode 验证码
 */
async function login(username, password, vcode) {
    let url = await apiFunctions.checkRedirect();
    if(url == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    url += memberApiURLs.memberLogin;
    let res = await request(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'cookie': await _getCookie() 
        },
        timeout: 16000,
        body: `email=${username}&password=${password}&verify=${vcode}` 
    });

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    if(res.headers.hasOwnProperty('Set-Cookie')) {
        await _saveCookie(res.headers['Set-Cookie']);
    }

    let resText = res.body;
    try {
        let resJSON = JSON.parse(resText);
        if(resJSON.status && resJSON.status == 1) {
            return { status: 'ok' };
        }
        else {
            return { status: 'error', errmsg: resJSON.info };
        }
    } catch (error) {
        return { status: 'error', errmsg: resText };
    }
}

/**
 * 注册
 * @param {string} username 邮箱
 * @param {string} vcode 验证码
 */
async function register(username, vcode) {
    let url = await apiFunctions.checkRedirect();
    if(url == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    url += memberApiURLs.memberSignup;

    let res = await request(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'cookie': await _getCookie() 
        },
        timeout: 16000,
        body: `email=${username}&agree=''&verify=${vcode}` 
    });

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    if(res.headers.hasOwnProperty('Set-Cookie')) {
        await _saveCookie(res.headers['Set-Cookie']);
    }

    let resText = res.body;
    try {
        let resJSON = JSON.parse(resText);
        if(resJSON.status && resJSON.status == 1) {
            return { status: 'ok' };
        }
        else {
            return { status: 'error', errmsg: resJSON.info };
        }
    } catch (error) {
        return { status: 'error', errmsg: resText };
    }
}

/**
 * 找回密码
 * @param {string} username 邮箱
 * @param {string} vcode 验证码
 */
async function forgotPassword(username, vcode) {
    let url = await apiFunctions.checkRedirect();
    if(url == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    url += memberApiURLs.memberForgotPasswd;

    let res = await request(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'cookie': await _getCookie() 
        },
        timeout: 16000,
        body: `email=${username}&verify=${vcode}` 
    });

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    if(res.headers.hasOwnProperty('Set-Cookie')) {
        await _saveCookie(res.headers['Set-Cookie']);
    }

    let resText = res.body;
    try {
        let resJSON = JSON.parse(resText);
        if(resJSON.status && resJSON.status == 1) {
            return { status: 'ok' };
        }
        else {
            return { status: 'error', errmsg: resJSON.info };
        }
    } catch (error) {
        return { status: 'error', errmsg: resText };
    }
}
/**
 * 退出登录
 */
async function logout() {
    await _clearCookie();
    await checkSession();
}

export { checkSession, getVerifyCode, login, register, forgotPassword, logout };