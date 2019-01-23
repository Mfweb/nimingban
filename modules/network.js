import { Platform } from 'react-native'
import RNFS from 'react-native-fs';

const apiBaseURL = 'https://adnmb1.com';

const appMark = 'HavfunClient-WeChatAPP';

const localDir = {
    imageCacheThumb: RNFS.CachesDirectoryPath + '/Cache/Image/Thumb',
    imageCacheFull: RNFS.DocumentDirectoryPath + '/Cache/Image/Full'
};

const apiURLs = {
    getForumList: apiBaseURL + '/Api/getForumList?appid=PinkAdao',
    getForumThread: apiBaseURL + '/Api/showf?appid=PinkAdao',
    getImageCDN: apiBaseURL + '/Api/getCdnPath?appid=PinkAdao'
};

/**
 * 
 * @param {Number} fid 板块ID
 * @param {Number} page 第几页
 */
async function getForumList(fid, page) {
    let response = await fetch(apiURLs.getForumThread, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            'User-Agent': appMark
        },
        body: 'id=' + fid + '&page=' + page
    });
    let res = await response.text();
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
 * 获取串图片
 * @param {String} imgMode 获取全图（image）还是缩略图（thumb）
 * @param {String} imageName 图片完整名
 */
async function getImage(imgMode, imageName) {
    try {
        var imgUrl = getImageCDN() + imgMode + '/' + imageName;
        var localPath = (imgMode === 'thumb' ? localDir.imageCacheThumb : localDir.imageCacheFull) + '/' + imageName.replace('/','-');

        if(await RNFS.exists(localPath)) {
            console.log('Get image from cache.');
            return {
                status: 'ok',
                download: false,
                path: localPath
            }
        }

        if ( !await RNFS.exists(localDir.imageCacheThumb) ) {
            console.log('Make new thumb image dir.');
            let a = await RNFS.mkdir(localDir.imageCacheThumb, { NSURLIsExcludedFromBackupKey: true });
            console.log(a);
        }
        if ( !await RNFS.exists(localDir.imageCacheFull) ) {
            console.log('Make new full image dir.');
            await RNFS.mkdir(localDir.imageCacheFull, { NSURLIsExcludedFromBackupKey: true });
        }
        let downloadRes = await RNFS.downloadFile({
            fromUrl: imgUrl,
            toFile: localPath,
            headers: {
                'User-Agent': appMark
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

export { getForumList, getImageCDN, getImage};