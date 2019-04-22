import RNFS from 'react-native-fs';
import { request, getUrl } from '../network'
import { setUserCookieFromString, getCookie, clearCookie } from '../../cookie-manager'
import { configNetwork, configLocal } from '../../config'

/**
 * 检查Session是否有效
 */
async function checkSession() {
    let url = await getUrl(configNetwork.memberUrl.memberCheckSession);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie()
        },
    });

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
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            email: username,
            password: password,
            verify: vcode 
        }
    });
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

    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            email: username,
            agree: '',
            verify: vcode 
        }
    }); 

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
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            email: username,
            verify: vcode 
        }
    });

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
}

/**
 * 获取用户Cookie列表
 */
async function getUserCookies() {
    let url = await getUrl(configNetwork.memberUrl.memberGetCookiesList);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
    });
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

/**
 * 删除一个用户饼干
 * @param {number} cookieid 饼干ID
 * @param {string} vcode 验证码
 */
async function deleteUserCookie(cookieid, vcode) {
    let url = await getUrl(`${configNetwork.memberUrl.memberDeleteCookie}${cookieid}.html`);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            verify: vcode
        }
    });
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
 * 获取一个新用户饼干
 * @param {string} vcode 验证码
 */
async function getNewUserCookie(vcode) {
    let url = await getUrl(configNetwork.memberUrl.memberGetNewCookie);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            verify: vcode
        }
    });
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
 * 获取实名认证信息
 */
async function getVerifiedInfo() {
    let url = await getUrl(configNetwork.memberUrl.memberGetCertifiedStatus);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
    });
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    var resText = res.body;
    try {
        let resJSON = JSON.parse(resText);
        return { status: 'error', errmsg: resJSON.info };
    } catch (error) {
        if(resText.indexOf('实名状态') > 0) {
            resText = resText.replace(/ /g, '').replace(/\r/g, '').replace(/\n/g, '');
            let certStatus = {
                statusString: '错误',
                phoneNumber: '错误',
                statusBool: false
            };
            let cert_status = resText.split('实名状态')[1].match(/<b>[\s\S]*?<\/b>/i);
            if (cert_status != null) {
              certStatus.statusString = cert_status[0].replace(/(<b>)|(<\/b>)/ig, '');
            }
            else {
              certStatus.statusString = '状态错误';
            }
            if (resText.indexOf('已绑定手机') > 0) {//手机认证已经成功的
                let phoneContent = resText.split('已绑定手机')[1].replace(/(><)/g, "").match(/>[\s\S]*?</i);
                if (phoneContent != null) {
                    phoneContent = phoneContent[0].replace(/(>)|(<)/ig, "");
                    if (phoneContent != null) {
                        certStatus.phoneNumber = phoneContent;
                    }
                }
                certStatus.statusBool = true;
            }
            else if (resText.indexOf('绑定手机') > 0) {//未进行手机实名认证
                certStatus.phoneNumber = '未认证';
                certStatus.statusBool = false;
            }
            return { status: 'ok', info: certStatus }
        }
        else {
            return { status: 'error', errmsg: '获取实名状态错误' };
        }
    }
}

/**
 * 开始进入实名认证
 * @param {string} mobile 手机号
 * @param {string} countryID 国家号
 * @param {string} vcode 验证码
 */
async function startVerified(mobile, countryID, vcode) {
    let url = await getUrl(configNetwork.memberUrl.memberStartMobileCert);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            verify: vcode,
            mobile_country_id: countryID,
            mobile: mobile
        }
    });
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    var resText = res.body;
    try {
        let resJSON = JSON.parse(resText);
        return { status: 'error', errmsg: resJSON.info };
    } catch (error) {
        if(resText.indexOf('本次的验证码') > 0) {
            resText = resText.replace(/\r/g, "").replace(/\n/g, "");
            let bodyMatch = resText.match(/<form[\s\S]*?>[\s\S]*?<\/form>/ig);
            if(bodyMatch != null) {
                bodyMatch = bodyMatch[0].replace(/tpl-form-maintext">[\s\D]*<b>/ig, "Sdata\"><b>").replace(/ /ig, '');
                var info = {
                    authMobile: '错误',
                    authCode: '错误',
                    expireDate: '未知',
                    yourMobile: '错误'
                };

                let authMobile = bodyMatch.match(/发送下面的验证码到\<b\>(\+)*([0-9])+/ig);
                if(authMobile) {
                    info.authMobile = authMobile[0].replace(/发送下面的验证码到\<b\>/ig, '');
                }

                let authCode = bodyMatch.match(/本次的验证码.*(\<b\>){1}([0-9]){5}/ig);
                if(authCode) {
                    info.authCode = authCode[0].substring(authCode[0].length - 5);
                }

                let expireDate = bodyMatch.match(/过期时间.*(\<b\>){1}\d{4}\-\d{2}\-\d{2}/ig);
                let expireTime = bodyMatch.match(/过期时间.*(\<b\>){1}.*\d{2}:\d{2}:\d{2}/ig);
                if(expireDate && expireTime) {
                    info.expireDate = expireDate[0].substring(expireDate[0].length - 10) + ' ' + expireTime[0].substring(expireTime[0].length - 8);
                }

                let yourMobile = bodyMatch.match(/(您的手机\<){1}.*(\>\+){1}\d+/ig);
                if(yourMobile) {
                    info.yourMobile = yourMobile[0].replace(/(您的手机\<){1}.*(\>\+){1}/ig, '+');
                }
                return { status: 'ok', msg: info };
            }
            else {
                return { status: 'error', errmsg: '未知错误 2' };
            }
        }
        else {
            console.error(resText);
            return { status: 'error', errmsg: '未知错误' };
        }
    }
}

/**
 * 检查实名认证短信
 */
async function checkVerifiedSMS() {
    let url = await getUrl(configNetwork.memberUrl.memberMobileCheck);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'GET',
        headers: {
            'cookie': await getCookie() 
        },
    });
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }
    var resText = res.body;
    return { status: 'ok', msg: resText };
}

/**
 * 修改密码
 * @param {string} oldpw 旧密码
 * @param {string} newpw 新密码
 * @param {string} newpw2 新密码2
 */
async function changePassword(oldpw, newpw, newpw2) {
    let url = await getUrl(configNetwork.memberUrl.memberChangePassword);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'POST',
        saveCookies: true,
        headers: {
            'cookie': await getCookie() 
        },
        body: {
            oldpwd: oldpw,
            pwd: newpw,
            repwd: newpw2
        }
    });
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
 * 获取并应用一个用户饼干
 * @param {string} id 饼干id
 */
async function getEnableUserCookie(id, saveMark = 'userMember') {
    let url = await getUrl(`${configNetwork.memberUrl.memberGetCookieDetail}${id}.html`);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }
    var res = await request(url, {
        method: 'GET',
        headers: {
            'cookie': await getCookie() 
        }
    });
    if(res.stateCode != 200) {
        return { status: 'error', errmsg: `http:${res.stateCode},${res.errMsg}` };
    }//setUserCookieFromString
    if(res.headers.hasOwnProperty('Set-Cookie')) {
        let sta = await setUserCookieFromString(res.headers['Set-Cookie'], saveMark);
        if(sta === true) {
            return { status: 'ok' };
        }
        else {
            return { status: 'error', errmsg: `获取饼干错误` };
        }
    }
    else {
        return { status: 'error', errmsg: `获取饼干错误` };
    }
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
    startVerified,
    getVerifiedInfo,
    checkVerifiedSMS,
    changePassword,
    getEnableUserCookie
};