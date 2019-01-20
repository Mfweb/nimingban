import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList,SafeAreaView,StatusBar, TouchableHighlight } from 'react-native'
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


function _getHTMLDom(htmlJSONIn, countKey = 0, tagName = null, tagAttribs = null) {
    let outPut = [];
    htmlJSONIn.forEach(htmlTag => {
        switch (htmlTag.type) {
            case 'text':
                switch (tagName) {
                    case 'a':
                    outPut.push(<Text style={htmlConstStyles.a} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
                    break;
                case 'strong':
                    console.log(htmlTag.data);
                    outPut.push(<Text style={htmlConstStyles.strong} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
                    break;
                case 'br':
                    outPut.push(<Text key={htmlTag.data+countKey++}>\r\n</Text>);
                    break;
                case 'font':
                    outPut.push(<Text style={tagAttribs} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
                    break;
                default:
                    outPut.push(<Text key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
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

function getHTMLDom(htmlTextIn, defaultFontSize = 20) {
    let domJSON = parseDOM(htmlTextIn);
    //console.log(domJSON);
    let dom = _getHTMLDom( domJSON );
    return (
        <Text>{dom}</Text>
    );
}

export { getHTMLDom };