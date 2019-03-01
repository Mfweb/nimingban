import React, { Component } from 'react'
import { Text, StyleSheet } from 'react-native'
import { parseDOM } from 'htmlparser2'

const htmlConstStyles = StyleSheet.create({
    a: {
        color: '#4169E1',
        textDecorationLine: 'underline'
    },
    strong: {
        fontWeight: 'bold'
    },
    del: {
        textDecorationLine: 'line-through'
    }
});
function escape2Html(str) {
    var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
    return str.replace(/&(lt|gt|nbsp|amp|quot);/ig, function(all,t){
        return arrEntities[t];
    });
}

/**
 * 将字符串Style转为Object
 * 注意，HTML的style属性与RN不同，实际需要做一张对照表，但是由于岛上的Style就一个（美食版标题）
 * 而这个的属性color与RN相同，所以这里就没有做仔细的转译。
 * @param {String} stringIn 输入字符串
 */
function styleStringToObject(stringIn) {
    let outPutArray = {};
    let tags = stringIn.split(';');
    tags.forEach(tagString => {
        let tagsObj = tagString.split(':');
        if(tagsObj.length == 2) {
            outPutArray[tagsObj[0].replace(' ','')] = tagsObj[1].replace(' ','');
        }
    });
    return outPutArray;
}

var domKey = 0;
/**
 * 将DOM转为JSX MAP
 * @param {object} htmlJSONIn DOM JSON结构
 * @param {string} tagName 递归传递的html标签名
 * @param {object} tagAttribs 递归传递的html表情属性
 */
function _getHTMLDom(htmlJSONIn, aCallback, tagName = null, tagAttribs = null, parentAttribs = {}) {
    let outPut = [];
    htmlJSONIn.forEach(htmlTag => {
        if(!tagAttribs) {
            tagAttribs = {};
        }
        else if (tagAttribs.hasOwnProperty('style')) {
            tagAttribs = styleStringToObject(tagAttribs.style);
        }
        
        switch (htmlTag.type) {
            case 'text':
                switch (tagName) {
                    case 'a':
                        outPut.push(<Text key={domKey++} onPress={()=>aCallback(tagAttribs)} style={htmlConstStyles.a}>{htmlTag.data}</Text>);
                        break;
                    case 'b':
                    case 'strong':
                        outPut.push(<Text key={domKey++} style={Object.assign(tagAttribs, htmlConstStyles.strong, parentAttribs)}>{htmlTag.data}</Text>);
                        break;
                    case '<br':
                    case 'br':
                        outPut.push(<Text key={domKey++}>{'\r\n'}</Text>);
                        break;
                    case 'font':
                        outPut.push(<Text key={domKey++} style={Object.assign(tagAttribs, parentAttribs)}>{htmlTag.data}</Text>);
                        break;
                    case null:
                        let checkURL = replaceUrl(htmlTag.data);
                        if( checkURL != htmlTag.data ) {
                            outPut = outPut.concat(getHTMLDom(checkURL, aCallback));
                        }
                        else {
                            outPut.push(<Text key={domKey++} style={parentAttribs}>{htmlTag.data}</Text>);
                        }
                        break;
                    case 'div':
                    case 'form':
                    case 'label':
                        outPut.push(<Text key={domKey++} style={parentAttribs}>{htmlTag.data}</Text>);
                        outPut.push(<Text key={domKey++}>{'\r\n'}</Text>);
                        break;
                    case 's':
                    case 'strike':
                    case 'del':
                        outPut.push(<Text key={domKey++} style={Object.assign(tagAttribs, htmlConstStyles.del, parentAttribs)}>{htmlTag.data}</Text>);
                        break;
                    default:
                        console.warn('Unknow HTML tag:' + tagName);
                        outPut.push(<Text key={domKey++}>{htmlTag.data}</Text>);
                        break;
                }
                break;
            case 'tag':
                outPut = outPut.concat(_getHTMLDom(htmlTag.children, aCallback, htmlTag.name, htmlTag.attribs, tagAttribs))
                break;
            default:
                break;
        }
    });
    return outPut;
}

/**
 * 将HTM转为JSX MAP
 * @param {string} htmlTextIn HTML输入
 * @param {function} aCallback 点击A标签的回调
 */
function getHTMLDom(htmlTextIn, aCallback = ()=>{}) {
    let domJSON = parseDOM( escape2Html(htmlTextIn) );
    return _getHTMLDom(domJSON, aCallback);
}
/**
 * 将字符串中的链接转为超链接
 * 还不完善
 * @param {string} htmlTextIn 输入字符串
 */
function replaceUrl(htmlTextIn) {
    var re = /(http[s]?:\/\/([\w-]+.)+([:\d+])?(\/[\w-\.\/\?%&=]*)?)/gi;
    var s = htmlTextIn.replace(re, function(a) {
        return '<a href="' + a + '">' + a + '</a>';
    });
    //console.log(s);
    return s;
}

export { getHTMLDom };