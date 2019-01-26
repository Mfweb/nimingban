import { AsyncStorage } from 'react-native'
import RNFS from 'react-native-fs';

// 主岛主地址
const apiBaseURL = 'https://adnmb.com';

// 主岛重定向地址和CDN地址，动态获取
var apiRedirectURL = null;
var imageCDNURLs = null;

// app标示
const appMark = 'PinkAdao';

const localDir = {
    imageCacheThumb: RNFS.CachesDirectoryPath + '/Cache/Image/Thumb',
    imageCacheFull: RNFS.DocumentDirectoryPath + '/Cache/Image/Full'
};

const apiURLs = {
    timeLine: '/Api/timeline?appid=' + appMark,
    getForumList: '/Api/getForumList?appid=' + appMark,
    getForumThread: '/Api/showf?appid=' + appMark,
    getImageCDN: '/Api/getCdnPath?appid=' + appMark,
    getThreadReply: '/Api/thread?appid=' + appMark
};

const apiRequestHeader = {
    'content-type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'HavfunClient-' + appMark
};

/**
 * 为fetch增加超时
 * @param {object} fetch_promise fetch promise
 * @param {number} timeout 超时事件，毫秒
 */
function _fetch(fetch_promise, timeout) {
    var abort_fn = null;
    var abort_promise = new Promise(function(resolve, reject) {
        abort_fn = function() {
            reject('time out');
        };
    });
    var abortable_promise = Promise.race([
        fetch_promise,
        abort_promise
    ]);

    setTimeout(function() {
        abort_fn();
    }, timeout);

    return abortable_promise;
}

/**
 * 检查并返回最新的host，
 * redirect: 'manual' 不知道为什么不起作用，所以独立检测一下
 */
async function checkRedirect() {
    if(apiRedirectURL != null) {
        return apiRedirectURL;
    }
    let response = await _fetch(fetch(apiBaseURL, {
        method: 'GET',
        headers: apiRequestHeader,
    }), 16000);
    if(response.url.indexOf('/Forum')) {
        apiRedirectURL = response.url.replace('/Forum', '');
        return apiRedirectURL;
    }
    return null;
}

/**
 * 获取板块列表
 * @param {bool} force 是否强制从网络端获取
 */
async function getForumList(force = false) {
    let localItem = await AsyncStorage.getItem('ForumList');
    if(localItem === null || force === true) {
        let url = await checkRedirect();
        if(url === null) {
            return { status: 'error', errmsg: '获取A岛host失败' };
        }
        url += apiURLs.getForumList;
        let response = await _fetch(fetch(url, {
            method: 'GET',
            headers: apiRequestHeader,
            cache: 'no-cache',
        }), 16000);
        localItem = await response.text();
        await AsyncStorage.setItem('ForumList', localItem);
    }
 
    try {
        let resJSON = JSON.parse(localItem);
        if(force === true) {
            let forumNameList = new Object();
            resJSON.forEach(groupItem => {
                groupItem.forums.forEach(item=>{
                    forumNameList[item.id.toString()] = item.name;
                });
            });
            await AsyncStorage.setItem('ForumNameList', JSON.stringify(forumNameList));
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
    let url = await checkRedirect();
    if(url === null) {
        return { status: 'error', errmsg: '获取A岛host失败' };
    }
    url += ( (fid == -1) ? apiURLs.timeLine : apiURLs.getForumThread );
    let response = await _fetch(fetch(url, {
        method: 'POST',
        cache: 'no-cache',
        headers: apiRequestHeader,
        body: 'id=' + fid + '&page=' + page
    }), 16000);
    let res = await response.text();
    try {
        let resJSON = JSON.parse(res);
        if( fid == -1 ) {
            let forumNameList = await AsyncStorage.getItem('ForumNameList');
            if(forumNameList !== null) {
                forumNameList = JSON.parse(forumNameList);
                resJSON.forEach(item => {
                    item.fname = forumNameList[item.fid.toString()];
                });
            }
        }

        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: error };
    }
}

/**
 * 获取串回复
 * @param {Number} tid 串ID
 * @param {Number} page 分页
 */
async function getReplyList(tid, page) {
    let url = await checkRedirect();
    if(url === null) {
        return { status: 'error', errmsg: '获取A岛host失败' };
    }
    url += apiURLs.getThreadReply;

    let response = await _fetch(fetch(url, {
        method: 'POST',
        headers: apiRequestHeader,
        cache: 'no-cache',
        body: 'id=' + tid + '&page=' + page
    }), 16000);
    let res = await response.text();
    if(res == '"该主题不存在"') {
        return { status: 'error', errmsg: '该主题不存在' };
    }
    try {
        let resJSON = JSON.parse(res);
        return { status: 'ok', res: resJSON };
    } catch (error) {
        return { status: 'error', errmsg: error };
    }
}

/**
 * 获取图片CDN（暂时是固定的）
 */
async function getImageCDN() {
    if(imageCDNURLs == null) {
        let url = await checkRedirect();
        if(url === null) {
            return null;
        }
        url += apiURLs.getImageCDN;
        let response = await _fetch(fetch(url, {
            method: 'GET',
            headers: apiRequestHeader,
            cache: 'no-cache',
        }), 16000);
        imageCDNURLs = await response.text();
    }
    if(imageCDNURLs == null) {
        return null;
    }
    try{
        let cdnList = JSON.parse(imageCDNURLs);
        let maxRate = {url: 'https://nmbimg.fastmirror.org/', rate: 0};
        cdnList.forEach(item => {
            if(item.rate > maxRate.rate) {
                maxRate = item;
            }
        });
        return maxRate.url;
    } catch(error) {
        return null;
    }
}

/**
 * 清空缩略图缓存
 */
async function clearImageCache() {
    try {
        await RNFS.unlink(localDir.imageCacheThumb);
    }catch(error) {

    }
}

/**
 * 获取串图片
 * @param {String} imgMode 获取全图（image）还是缩略图（thumb）
 * @param {String} imageName 图片完整名
 */
async function getImage(imgMode, imageName) {
    try {
        var imgUrl = await getImageCDN() + imgMode + '/' + imageName;
        var localPath = (imgMode === 'thumb' ? localDir.imageCacheThumb : localDir.imageCacheFull) + '/' + imageName.replace('/','-');

        if(await RNFS.exists(localPath)) {
            //console.log('Get image from cache.');
            return {
                status: 'ok',
                download: false,
                path: localPath
            }
        }

        if ( !await RNFS.exists(localDir.imageCacheThumb) ) {
            //console.log('Make new thumb image dir.');
            await RNFS.mkdir(localDir.imageCacheThumb, { NSURLIsExcludedFromBackupKey: true });
        }
        if ( !await RNFS.exists(localDir.imageCacheFull) ) {
            //console.log('Make new full image dir.');
            await RNFS.mkdir(localDir.imageCacheFull, { NSURLIsExcludedFromBackupKey: true });
        }
        let downloadRes = await RNFS.downloadFile({
            fromUrl: imgUrl,
            toFile: localPath,
            headers: {
                'User-Agent': 'HavfunClient-' + appMark
            },
            background: true,
            discretionary: true,
            cacheable: true,
        });

        let downloadStaRes = await downloadRes.promise;
        if(downloadStaRes.statusCode == 200 && downloadStaRes.bytesWritten > 0) {
            return {
                status: 'ok',
                download: true,
                path: localPath
            }
        }
        else {
            return {
                status: 'error',
                download: true,
                errmsg: 'http:' + downloadStaRes.statusCode.toString(),
                path: localPath
            }
        }

    } catch (error) {
        return {
            status: 'error',
            download: false,
            errmsg: error,
            path: localPath
        }
    }
}

export { getForumList, getThreadList, getImageCDN, getImage, clearImageCache, getReplyList};