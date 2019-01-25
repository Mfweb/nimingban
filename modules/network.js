import { AsyncStorage } from 'react-native'
import RNFS from 'react-native-fs';

const apiBaseURL = 'https://adnmb1.com';

const appMark = 'PinkAdao';

const localDir = {
    imageCacheThumb: RNFS.CachesDirectoryPath + '/Cache/Image/Thumb',
    imageCacheFull: RNFS.DocumentDirectoryPath + '/Cache/Image/Full'
};

const apiURLs = {
    timeLine: apiBaseURL + '/Api/timeline?appid=' + appMark,
    getForumList: apiBaseURL + '/Api/getForumList?appid=' + appMark,
    getForumThread: apiBaseURL + '/Api/showf?appid=' + appMark,
    getImageCDN: apiBaseURL + '/Api/getCdnPath?appid=' + appMark,
    getThreadReply: apiBaseURL + '/Api/thread?appid=' + appMark
};

const apiRequestHeader = {
    'content-type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    'User-Agent': 'HavfunClient-' + appMark
};

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
 * 获取板块列表
 * @param {bool} force 是否强制从网络端获取
 */
async function getForumList(force = false) {
    let localItem = await AsyncStorage.getItem('ForumList');
    if(localItem === null || force === true) {
        let response = await _fetch(fetch(apiURLs.getForumList, {
            method: 'GET',
            headers: apiRequestHeader,
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
    let response = await _fetch(fetch( fid==-1?apiURLs.timeLine:apiURLs.getForumThread, {
        method: 'POST',
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
    let response = await _fetch(fetch(apiURLs.getThreadReply, {
        method: 'POST',
        headers: apiRequestHeader,
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
function getImageCDN() {
    return 'https://nmbimg.fastmirror.org/'
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
        var imgUrl = getImageCDN() + imgMode + '/' + imageName;
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