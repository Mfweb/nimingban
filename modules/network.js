import CookieManager from 'react-native-cookies'
import { configNetwork } from './config'
import { saveCookie, getCookie } from './cookie-manager'

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
export { request, uploadFile }