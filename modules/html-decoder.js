import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight } from 'react-native'
import { parseDOM } from 'htmlparser2'

const htmlConstStyles = StyleSheet.create({
    a: {
        color: '#4169E1',
        textDecorationLine: 'underline'
    },
    strong: {
        fontWeight: 'bold'
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
    let outPutArray = Array();
    let tags = stringIn.split(';');
    tags.forEach(tagString => {
        let tagsObj = tagString.split(':');
        if(tagsObj.length == 2) {
            let tempObj = new Object();
            tempObj[tagsObj[0].replace(' ','')] = tagsObj[1].replace(' ','');
            outPutArray.push(tempObj);
        }
    });
    return outPutArray;
}

/**
 * 将DOM转为JSX MAP
 * @param {object} htmlJSONIn DOM JSON结构
 * @param {number} countKey 用来累积Key的，起始为0
 * @param {string} tagName 递归传递的html标签名
 * @param {object} tagAttribs 递归传递的html表情属性
 */
function _getHTMLDom(htmlJSONIn, countKey = 0, tagName = null, tagAttribs = null) {
    let outPut = [];
    htmlJSONIn.forEach(htmlTag => {
        switch (htmlTag.type) {
            case 'text':
                switch (tagName) {
                    case 'a':
                        outPut.push(<Text style={htmlConstStyles.a} key={htmlTag.data + countKey++}>{htmlTag.data}</Text>);
                        break;
                    case 'b':
                    case 'strong':
                        outPut.push(<Text style={htmlConstStyles.strong} key={htmlTag.data + countKey++}>{htmlTag.data}</Text>);
                        break;
                    case 'br':
                        outPut.push(<Text key={htmlTag.data + countKey++}>\r\n</Text>);
                        break;
                    case 'font':
                        if(tagAttribs.hasOwnProperty('style') ) {
                            tagAttribs = styleStringToObject(tagAttribs.style);
                        }
                        outPut.push(<Text style={tagAttribs} key={htmlTag.data + countKey++}>{htmlTag.data}</Text>);
                        break;
                    case null:
                        outPut.push(<Text key={htmlTag.data + countKey++}>{htmlTag.data}</Text>);
                        break;
                    default:
                        console.warn('Unknow HTML tag:' + tagName);
                        outPut.push(<Text key={htmlTag.data + countKey++}>{htmlTag.data}</Text>);
                        break;
                }
                break;
            case 'tag':
                outPut = outPut.concat(_getHTMLDom(htmlTag.children, countKey, htmlTag.name, htmlTag.attribs))
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
 */
function getHTMLDom(htmlTextIn) {
    let domJSON = parseDOM( escape2Html(htmlTextIn) );
    //console.log(domJSON);
    let dom = _getHTMLDom(domJSON);
    return (
        <Text>{dom}</Text>
    );
}

export { getHTMLDom };