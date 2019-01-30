import { AsyncStorage,Platform } from 'react-native'
import RNFS from 'react-native-fs';
import { getUrl } from './apis'
import { request } from './network'
import { saveCookie, getCookie, clearCookie } from './cookie-manager'
import { configNetwork, configLocal, configDynamic } from './config'

/**
 * 检查Session是否有效
 */
async function checkSession() {
    let url = await getUrl(configNetwork.memberUrl.memberCheckSession);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    try {
        var res = await request(url, {
            method: 'POST',
            saveCookies: true,
            headers: {
                'cookie': await getCookie()
            },
        });
    }catch(error){
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
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
    let imgUrl = await getUrl(configNetwork.memberUrl.getVerifyCode);
    if(imgUrl === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    try {
        var localPath = configLocal.localDirectory.imageCacheThumb + '/vcode.png';

        if ( !await RNFS.exists(configLocal.localDirectory.imageCacheThumb) ) {
            await RNFS.mkdir(configLocal.localDirectory.imageCacheThumb, { NSURLIsExcludedFromBackupKey: true });
        }
        if ( !await RNFS.exists(configLocal.localDirectory.imageCacheFull) ) {
            await RNFS.mkdir(configLocal.localDirectory.imageCacheFull, { NSURLIsExcludedFromBackupKey: true });
        }

        if ( await RNFS.exists(localPath) ) {
            await RNFS.unlink(localPath);
        }
        let downloadRes = await RNFS.downloadFile({
            fromUrl: imgUrl,
            toFile: localPath,
            headers: {'cookie': await getCookie()},
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
    let url = await getUrl(configNetwork.memberUrl.memberLogin);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    try {
        var res = await request(url, {
            method: 'POST',
            saveCookies: true,
            headers: {
                'cookie': await getCookie() 
            },
            body: `email=${username}&password=${password}&verify=${vcode}` 
        });
    }catch(error) {
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
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
    let url = await getUrl(configNetwork.memberUrl.memberSignup);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    try {
        var res = await request(url, {
            method: 'POST',
            saveCookies: true,
            headers: {
                'cookie': await getCookie() 
            },
            body: `email=${username}&agree=''&verify=${vcode}` 
        });    
    } catch(error) {
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
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
    let url = await getUrl(configNetwork.memberUrl.memberForgotPasswd);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    try {
        var res = await request(url, {
            method: 'POST',
            saveCookies: true,
            headers: {
                'cookie': await getCookie() 
            },
            body: `email=${username}&verify=${vcode}` 
        });
    } catch(error) {
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }

    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
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
    await clearCookie();
    await checkSession();
}

/**
 * 获取用户Cookie列表
 */
async function getUserCookies() {
    let url = await getUrl(configNetwork.memberUrl.memberGetCookiesList);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    try {
        var res = await request(url, {
            headers: {
                'cookie': await getCookie() 
            },
        });
    } catch(error) {
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    try {
        var resJSON = JSON.parse(res.body);
        return { status: 'error', errmsg: resJSON.info };
    } catch {
    }
    if ( res.body.indexOf('饼干列表') <= 0 ) {
        return { status: 'error', errmsg: '获取饼干列表失败' };
    }

    let content = res.body.replace(/ /g, '');
    content = content.replace(/\r/g, '');
    content = content.replace(/\n/g, '');

    let info = {
      warning: null,
      capacity: null,
      userIco: null
    };
    info.userIco = content.match(/tpl-header-list-user-ico"><imgsrc="[\s\S]*?"><\/span>/ig);
    if(info.userIco != null) {
      info.userIco = info.userIco[0].replace(/tpl-header-list-user-ico"><imgsrc="/g, '').replace(/"><\/span>/g, '');
    }

    info.warning = content.match(/<b>\[警告\]<\/b>[\s\S]*?<\/span>/ig);
    if (info.warning != null) {
      info.warning = '⚠️ [警告]' + info.warning[0].replace(/<b>\[警告\]<\/b>/g, '').replace(/<\/span>/g, '');
    }

    info.capacity = content.match(/饼干容量<bclass="am-text-primary">[\s\S]*?<\/b>/ig);
    if (info.capacity != null) {
      info.capacity = info.capacity[0].replace(/饼干容量<bclass="am-text-primary">/g, '').replace(/<\/b>/g, '');
    }

    let tbody = content.match(/<tbody>[\s\S]*?<\/tbody>/ig);
    if (tbody != null) {
      let tableRoll = tbody[0].match(/<tr>[\s\S]*?<\/tr>/ig);
      if (tableRoll != null) {
        let cookieList = Array();
        for (let i = 0; i < tableRoll.length; i++) {
          let find_td = tableRoll[i].match(/<td>[\s\S]*?<\/td>/ig);
          if (find_td != null) {
            cookieList.push({ id: find_td[1].replace(/(<td>)|(<\/td>)/g, ""), value: find_td[2].replace(/(<td><ahref="\#">)|(<\/a><\/td>)/g, "") });
          }
        }
        return { status: 'ok', res: {cookies:cookieList,info: info} };
      }
      else {
        return { status: 'ok', res: {cookies:[], info: info} };
      }
    }
    else {
        return { status: 'error', errmsg: '获取信息失败' };
    }
}


async function deleteUserCookie(cookieid) {
    let url = await getUrl(`${configNetwork.memberUrl.memberDeleteCookie}${cookieid}.html`);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    try {
        var res = await request(url, {
            headers: {
                'cookie': await getCookie() 
            },
        });
    } catch(error) {
        return { status: 'error', errmsg: `http:${error.stateCode},${error.errMsg}` };
    }
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    console.log(res);
}


async function getNewUserCookie() {

}

async function startVerified() {
    
}

export {
    checkSession,
    getVerifyCode,
    login,
    register,
    forgotPassword,
    logout,
    getUserCookies,
    deleteUserCookie,
    getNewUserCookie,
    startVerified
};