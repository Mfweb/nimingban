import { request, uploadFile, getUrl } from '../network'
import { configNetwork, configDynamic } from '../../config'
import { getUserCookie, addUserCookieFromString } from '../../cookie-manager'
import { history } from '../../history'

/**
 * 从网络获取串回复并缓存
 * @param {Number} tid 串ID
 * @param {Number} page 分页
 * @param {Bool} force 是否强制从网络获取
 */
async function getReplyListFromNet(tid, page) {
    let url = await getUrl(configNetwork.apiUrl.getThreadReply);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    var response = await request(url, {
        method: 'POST',
        headers: {
            'cookie': await getUserCookie()
        },
        body: {
            id: tid,
            page: page
        },
    });
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    try {
        let resJSON = JSON.parse(response.body);
        if(resJSON === '该主题不存在') {
            return { status: 'error', errmsg: resJSON };
        }
        // 更新本地缓存
        history.addNewHistory('cache', {replyTo: 0, datas: [resJSON]});
        history.addNewHistory('cache', {replyTo: resJSON.id, datas: resJSON.replys});
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

/**
 * 获取串回复
 * @param {Number} tid 串ID
 * @param {Number} page 分页
 * @param {Bool} force 是否强制从网络获取
 */
async function getReplyList(tid, page, force = false) {
    if(!force) {
        // 从缓存获取
        let cacheData = await history.getThreadReplys(tid, page);
        // 缓存中没有，或者可能是最后一页
        if(cacheData.status === 'ok' && cacheData.data.replys.length >= 19) {
            console.log('from cache');
            // 即使从缓存获取，也要再从服务器获取一次，更新本地数据库
            getReplyListFromNet(tid, page);
            return { status: 'ok', res: cacheData.data };
        }
    }
    console.log('from net');
    return await getReplyListFromNet(tid, page);
}

/**
 * 回复或发一个串
 * @param {string} tid 要回复的ID
 * @param {string} content 内容
 * @param {string} name 名字
 * @param {string} email 邮箱
 * @param {string} title 标题
 * @param {string} img 图片地址
 * @param {bool} waterMark 是否增加水印
 * @param {function} onProgress 上传进度
 */
async function replyNewThread(mode, tid, content, name="", email="", title="", img = null, waterMark = false, onProgress = null) {
    let url = await getUrl(mode == 1 ? configNetwork.apiUrl.replyThread : configNetwork.apiUrl.newThread);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    var response = null;
    if(img){
        let bodys = {
            resto: tid,
            fid: tid,
            name: name,
            email: email,
            title: title,
            content: content,
        };
        if(waterMark) {
            bodys.water = 'true'
        }
        response = await uploadFile(url, img, 'image', {
            method: 'POST',
            headers: {
                'cookie': await getUserCookie()
            },
            body: bodys,
            onProgress: onProgress
        });
    }
    else {
        response = await request(url, {
            method: 'POST',
            headers: {
                'cookie': await getUserCookie()
            },
            body: {
                resto: tid,
                fid: tid,
                name: name,
                email: email,
                title: title,
                content: content,
                water: waterMark,
                onProgress: onProgress
            },
        });
    }
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }
    //备胎岛发串回串自动获取饼干
    if(configDynamic.islandMode == 'bt' && response.headers.hasOwnProperty('Set-Cookie')) {
        console.log('find bt cookie');
        await addUserCookieFromString(response.headers['Set-Cookie']);
    }
    try {
        let resJSON = JSON.parse(response.body);
        if(resJSON.status == 0) {
            return { status: 'error', errmsg: resJSON.info };
        }
        else {
            return { status: 'ok', res: resJSON };
        }
    } catch (error) {
        return { status: 'error', errmsg: error };
    }
}

/**
 * 从服务器获取某个回复的内容
 * @param {string} id ID
 */
async function getDetailFromNet(id) {
    let url = await getUrl(configNetwork.apiUrl.getDetail + `&id=${id}`);
    if(url === null) {
        return { status: 'error', errmsg: '获取host失败' };
    }

    var response = await request(url);
    if(response.stateCode != 200) {
        return { status: 'error', errmsg: `http:${response.stateCode},${response.errMsg}` };
    }

    try {
        let resJSON = JSON.parse(response.body);
        if(resJSON === 'thread不存在') {
            return { status: 'error', errmsg: resJSON };
        }
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: `${error}\r\n${unescape(response.body.replace(/\\u/g, '%u'))}` };
    }
}

/**
 * 获取某个ID的内容
 * 如果之前查看过，那主串和回复都能直接从缓存读取
 * 如果之前没有查看过，那会首先当作主串获取，如果不存在则当作普通串获取
 * @param {string} id ID
 */
async function getDetail(id) {
    let detailCatch = await history.getDetailFromCache(id);
    if(detailCatch.rows.length === 0) { // 缓存中没有
        detailCatch = await getDetailFromNet(id);
        return detailCatch;
    }
    else {
        return { status: 'ok', res: detailCatch.rows.item(0) };
    }
}

export {
    /**
     * 获取串回复列表
     */
    getReplyList,
    /**
     * 回复或发串
     */
    replyNewThread,
    /**
     * 获取某个回复或串的详细（缓存
     */
    getDetail
};