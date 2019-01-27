import { AsyncStorage } from 'react-native'
import RNFS from 'react-native-fs';
import {apiFunctions } from './apis'

const memberApiURLs = {
    getVerifyCode: "/Member/User/Index/verify.html", //请求验证码

    memberLogin: "/Member/User/Index/login.html",//登录
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

/**
 * 检查Session是否有效
 */
async function checkSession() {
    let url = await apiFunctions.checkRedirect();
    if(url == null) {
        return {status: 'error', errmsg: '获取host失败'}
    }
    url += memberApiURLs.memberCheckSession;
    let res = await apiFunctions._fetch(fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'cookie': await AsyncStorage.getItem('UserMemberCookie')
        }
    }), 16000);
    if(res.status != 200) {
        return {status: 'error', errmsg: 'http' + res.status}
    }
    if(res.headers.map['set-cookie']) {
        await AsyncStorage.setItem('UserMemberCookie', res.headers.map['set-cookie'].replace('path=/', ''));
    }
    let resText = await res.text();
    if(resText.indexOf('饼干管理') > 0) {
        return {status: 'ok', session: true}
    }
    else {
        return {status: 'ok', session: false}
    }
}

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
            headers: {
                'cookie': await AsyncStorage.getItem('UserMemberCookie')
            },
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


async function login(username, password, vcode) {

}

export { checkSession, getVerifyCode, login };