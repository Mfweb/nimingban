import { request, getUrl } from '../network'
import { configNetwork } from '../../config'
import { addUserCookieFromString } from '../../cookie-manager'

/**
 * 备胎岛直接领饼干
 */
async function realAnonymousGetCookie() {
    let url = await getUrl(configNetwork.apiUrl.getCookie);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    var response = await request(url);
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    if(response.body == '"error"') {
        return { status: 'error', errmsg: '获取失败，可能没开饼干' };
    }
    if(response.headers.hasOwnProperty('Set-Cookie')) {
        if(await addUserCookieFromString(response.headers['Set-Cookie'], false) == false) {
            return { status: 'error', errmsg: '解析饼干失败' };
        }
        else {
            return { status: 'ok' };
        }
    }
    else {
        return { status: 'error', errmsg: '没有找到饼干，可能没有开放' };
    }
}

export {
    /**
     * 备胎直接领饼干
     */
    realAnonymousGetCookie
}