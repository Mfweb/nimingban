import CookieManager from 'react-native-cookies'
import { configNetwork } from './config'
import { saveCookie, getCookie } from './cookie-manager'

/**
 * 异步请求
 * @param {string} url 请求地址
 * @param {object} option 参数
 */
function _request(url, option) {
    var {
        method = 'GET',
        headers = [],
        body = '',
        timeout = 16000,
        onSuccess = null,
        onFail = null,
        onFinish = null,
        saveCookies = false,
    } = option;
    var xhr = new XMLHttpRequest();
    xhr.timeout = timeout;
    xhr.responseText = 'text';

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
    xhr.send(body);
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
                reject(res);
            }
            option.headers = option.headers==undefined?{}:option.headers;
            Object.assign(option.headers, configNetwork.apiRequestHeader);
            option.timeout = configNetwork.timeout;
            _request(url, option);
        } );
    });
} 

export { request }