import RNFS from 'react-native-fs';
import { configNetwork, configLocal } from '../config'
import { getImageCDN } from './network'

/**
 * 清空缩略图缓存
 */
async function clearImageCache() {
    try {
        await RNFS.unlink(localDir.imageCacheThumb);
        return true;
    }catch(error) {
        return false;
    }
}

/**
 * 获取串图片
 * @param {String} imgMode 获取全图（image）还是缩略图（thumb） 还是自定义URL (customize)
 * @param {String} imageName 图片完整名
 * @param {String} localName 本地图片名（自定义模式）
 */
async function getImage(imgMode, imageName, localName = '') {
    try {
        var imgUrl = null;
        var localPath = null;
        if(imgMode == 'customize') {
            imgUrl = imageName;
            localPath = `${configLocal.localDirectory.imageCacheFull}/${localName}`;
        }
        else {
            imgUrl = await getImageCDN() + imgMode + '/' + imageName;
            localPath = (imgMode === 'thumb' ? configLocal.localDirectory.imageCacheThumb : configLocal.localDirectory.imageCacheFull) + '/' + imageName.replace('/','-');    
        }
        if(await RNFS.exists(localPath)) {
            return {
                status: 'ok',
                download: false,
                path: localPath
            }
        }

        if ( !await RNFS.exists(configLocal.localDirectory.imageCacheThumb) ) {
            console.log('Make new thumb image dir.');
            await RNFS.mkdir(configLocal.localDirectory.imageCacheThumb, { NSURLIsExcludedFromBackupKey: true });
        }
        if ( !await RNFS.exists(configLocal.localDirectory.imageCacheFull) ) {
            console.log('Make new full image dir.');
            await RNFS.mkdir(configLocal.localDirectory.imageCacheFull, { NSURLIsExcludedFromBackupKey: true });
        }
        let downloadRes = await RNFS.downloadFile({
            fromUrl: imgUrl,
            toFile: localPath,
            headers: configNetwork.apiRequestHeader,
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
            console.log('image download error',downloadStaRes.statusCode.toString());
            return {
                status: 'error',
                download: true,
                errmsg: 'http:' + downloadStaRes.statusCode.toString(),
                path: localPath
            }
        }

    } catch (error) {
        console.log('image download error2', error);
        return {
            status: 'error',
            download: false,
            errmsg: error,
            path: localPath
        }
    }
}


export {
    /**
     * 下载并缓存一张图片
     */
    getImage,
    /**
     * 清空图片缓存
     */
    clearImageCache
}