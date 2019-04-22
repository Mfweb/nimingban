import CookieManager from 'react-native-cookies'
import { saveCookie } from '../cookie-manager'
import { configNetwork, configDynamic } from '../config'

/**
 * 异步请求
 * @param {string} url 请求地址
 * @param {object} option 参数
 * @param {string} uploadImg 是否上传图片
 * @param {string} imageKeyName 图片key
 */
function _request(url, option, uploadImg = null, imageKeyName = null) {
    var {
        method = 'GET',
        headers = [],
        body = {},
        timeout = 16000,
        onSuccess = null,
        onFail = null,
        onFinish = null,
        onProgress = null,
        saveCookies = false,
    } = option;
    var xhr = new XMLHttpRequest();
    xhr.timeout = timeout;
    xhr.responseText = 'text';

    let formData = new FormData();
    if(uploadImg !== null) {
        let file = {
            uri: uploadImg,
            type: 'multipart/form-data',
            name: uploadImg.substring(uploadImg.lastIndexOf('/') + 1)
        };
        formData.append(imageKeyName, file);
    }
    for(let key in body) {
        formData.append(key, body[key]);
    }
    xhr.upload.onprogress = e => {
        if(onProgress && typeof onProgress === 'function' && e.lengthComputable){
            let percent = Math.floor(e.loaded / e.total * 80) ;
            onProgress(percent);
        }
    }
    xhr.onprogress = e=> {
        if(onProgress && typeof onProgress === 'function' && e.lengthComputable){
            let percent = Math.floor(e.loaded / e.total * 20 + 80) ;
            onProgress(percent);
        }
    }
    xhr.onerror = e => {
        var failData = {
            stateCode: -1,
            errMsg: 'network error'
        };
        onFail!==null?onFail(failData):'';
        onFinish!==null?onFinish():''; 
    }
    xhr.ontimeout = e => {
        var failData = {
            stateCode: -2,
            errMsg: 'timeout'
        };
        onFail!==null?onFail(failData):'';
        onFinish!==null?onFinish():''; 
    }
    xhr.onload = e => {
        if(xhr.status === 200) {
            var successData = {
                stateCode: xhr.status,
                body: xhr.responseText,
                headers: {},
                responseURL: xhr.responseURL
            };
            var headersList = xhr.getAllResponseHeaders().replace(/ /g,'').split('\r\n');
            headersList.forEach(headerLine => {
                let headerLineArray = headerLine.split(':');
                if(headerLineArray.length >= 2) {
                    successData.headers[headerLineArray[0]] = headerLine.substr(headerLineArray[0].length + 1);
                }
                else {
                    console.log(headerLine);
                }
            });
            if(saveCookies) {
                if(successData.headers.hasOwnProperty('Set-Cookie')) {
                    saveCookie(successData.headers['Set-Cookie']).then(()=>{
                        onSuccess!==null?onSuccess(successData):'';
                        onFinish!==null?onFinish():'';
                    }).catch(()=>{
                        onSuccess!==null?onSuccess(successData):'';
                        onFinish!==null?onFinish():'';
                    });
                }
                else {
                    onSuccess!==null?onSuccess(successData):'';
                    onFinish!==null?onFinish():'';
                }
            }
            else {
                onSuccess!==null?onSuccess(successData):'';
                onFinish!==null?onFinish():'';
            }
        }
        else {
            var failData = {
                stateCode: xhr.status,
                errMsg: xhr.responseText
            };
            onFail!==null?onFail(failData):'';
            onFinish!==null?onFinish():'';
        }
    }
    xhr.open(method, url, true);
    for(var key in headers) {
        xhr.setRequestHeader(key, headers[key]);
    }
    xhr.send(formData);
}

/**
 * 网络 Promise 对象
 * @param {string} url 请求地址
 * @param {object} option 参数
 */
function request(url, option = {}) {
    return CookieManager.clearAll().then(() => {
        return new Promise( (resolve, reject) => {
            option.onSuccess = (res) => {
                resolve(res);
            }
            option.onFail = (res) => {
                resolve(res);
            }
            option.headers = option.headers==undefined?{}:option.headers;
            Object.assign(option.headers, configNetwork.apiRequestHeader);
            option.timeout = option.timeout==undefined? configNetwork.timeout:option.timeout;
            _request(url, option);
        } );
    });
}

/**
 * 上传文件 Promise 对象
 * @param {string} url 请求地址
 * @param {object} option 参数
 */
function uploadFile(url, img, imgKey, option = {}) {
    return CookieManager.clearAll().then(() => {
        return new Promise( (resolve, reject) => {
            option.onSuccess = (res) => {
                resolve(res);
            }
            option.onFail = (res) => {
                resolve(res);
            }
            option.headers = option.headers==undefined?{}:option.headers;
            Object.assign(option.headers, configNetwork.apiRequestHeader);
            option.headers['content-type'] = 'multipart/form-data';
            option.timeout = option.timeout==undefined? configNetwork.timeout:option.timeout;
            _request(url, option, img, imgKey);
        } );
    });
}

/**
 * 检查并返回最新的host，
 * 免得之后30x出问题
 */
async function checkRedirect() {
    // 如果不支持30x，直接返回固定地址
    if( !configNetwork.baseUrl[configDynamic.islandMode].useRedirect ) {
        return configNetwork.baseUrl[configDynamic.islandMode].base;
    }
    // 已经拿到了跳转之后的地址
    if(configDynamic.apiRedirectURL[configDynamic.islandMode] != null) {
        return configDynamic.apiRedirectURL[configDynamic.islandMode];
    }
    console.log('get new redirect');
    var response = await request(configNetwork.baseUrl[configDynamic.islandMode].base);
    if(response.stateCode != 200) {
        console.warn('get redirect error');
        return null;
    }
    if(response.responseURL.indexOf('/Forum')) {
        configDynamic.apiRedirectURL[configDynamic.islandMode] = response.responseURL.replace('/Forum', '');
        return configDynamic.apiRedirectURL[configDynamic.islandMode];
    }
    return null;
}

/**
 * 拼接url
 * @param {string} urlLink url参数
 */
async function getUrl(urlLink) {
    let url = await checkRedirect();
    return url===null?null:(url+urlLink);
}

/**
 * 获取图片CDN
 */
async function getImageCDN() {
    if(configDynamic.imageCDNURL[configDynamic.islandMode] == null) {
        console.log('get new image cdn url');
        let url = await getUrl(configNetwork.apiUrl.getImageCDN);
        if(url === null) {
            return null;
        }
        var response = await request(url);
        if(response.stateCode != 200) {
            return null;
        }
        try {
            let cdnList = JSON.parse(response.body);
            let maxRate = {url: 'https://nmbimg.fastmirror.org/', rate: 0};
            cdnList.forEach(item => {
                if(item.rate > maxRate.rate) {
                    maxRate = item;
                }
            });
            configDynamic.imageCDNURL[configDynamic.islandMode] = maxRate.url;
            return configDynamic.imageCDNURL[configDynamic.islandMode];
        }catch(error) {
            return null;
        }
    }
    else {
        return configDynamic.imageCDNURL[configDynamic.islandMode];
    }
}

export {
    /**
     * 网络请求
     */
    request,
    /**
     * 上传文件
     */
    uploadFile,
    /**
     * 检查并返回最新的host
     */
    checkRedirect,
    /**
     * 通过host拼接URL
     */
    getUrl,
    /**
     * getImageCDN
     */
    getImageCDN
}