import React, { Component } from 'react'
import { Text, StyleSheet } from 'react-native'
import { parseDOM } from 'htmlparser2'
import { UISetting } from './config'

const htmlConstStyles = StyleSheet.create({
    a: {
        textDecorationLine: 'underline'
    },
    strong: {
        fontWeight: 'bold'
    },
    del: {
        textDecorationLine: 'line-through'
    }
});

const arrEntities = {
    'lt': '<', 'gt': '>', 'amp': '&', 'quot': '"',
    'nbsp': ' ', 'emsp': ' ', 'ensp': ' ', 'thinsp': ' ',
    'mdash': '—', 'ndash': '–', 'minus': '−', '-': '-',
    'oline': '‾', 'cent': '¢', 'pound': '£', 'euro': '€',
    'sect': '§', 'dagger': '†', 'Dagger': '‡', 'lsquo': '‘',
    'rsquo': '’', '\'': '\'', '#x263a': '☺', '#x2605':'★',
    '#x2606': '☆', '#x2610': '☐', 'middot': '·', 'bull': '•',
    'copy': '©', 'reg': '®', 'trade': '™', 'iquest': '¿','iexcl': '¡',
    'Aring': 'Å', 'hellip': '…', '#x2295': '⊕', '#x2299': '⊙','#x2640': '♀',
    '#x2642': '♂', 'ldquo': '“', 'rdquo': '”'
};

var arrEntityKeys = '';
Object.keys(arrEntities).forEach((item)=>{arrEntityKeys += item + '|';});
const entityReg = eval(`/&(${arrEntityKeys.substring(0, arrEntityKeys.length - 1)});/ig`);
function escape2Html(str) {
    return str.replace(entityReg, function(all,t){
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
    stringIn = stringIn.replace(/(\ |\r|\n)/ig, '');
    let tags = stringIn.split(';');
    tags.forEach(tagString => {
        let tagsObj = tagString.split(':');
        if(tagsObj.length == 2) {
            outPutArray[tagsObj[0]] = tagsObj[1];
        }
    });
    return outPutArray;
}

var domKey = 0;
/**
 * 将DOM转为JSX MAP
 * @param {object} htmlJSONIn DOM JSON结构
 * @param {string} tagName 递归传递的html标签名
 * @param {object} tagAttribs 递归传递的html标签属性
 */
function _getHTMLDom(htmlJSONIn, aCallback, tagName = null, tagAttribs = null, parentAttribs = {}) {
    let outPut = [];
    delete parentAttribs.class;
    htmlJSONIn.forEach(htmlTag => {
        if(!tagAttribs) {
            tagAttribs = {};
        }
        else if (tagAttribs.hasOwnProperty('style')) {
            tagAttribs = styleStringToObject(tagAttribs.style);
        }
        switch (htmlTag.type) {
            case 'text':
                htmlTag.data = escape2Html(htmlTag.data);
                switch (tagName) {
                    case 'a':
                        outPut.push(<Text key={domKey++} onPress={()=>aCallback(tagAttribs)} style={[htmlConstStyles.a, {color: UISetting.colors.linkColor}]}>{htmlTag.data}</Text>);
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
                    case 'p':
                    case 'div':
                    case 'form':
                    case 'label':
                        outPut.push(<Text key={domKey++} style={parentAttribs}>{htmlTag.data}</Text>);
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
                if(htmlTag.name === 'p' || htmlTag.name === 'div') {
                    outPut.push(<Text key={domKey++}>{'\r\n'}</Text>);
                }
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
    let outDom = _getHTMLDom(parseDOM(htmlTextIn), aCallback);
    return <Text key={domKey++}>{outDom}</Text>;
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