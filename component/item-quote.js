import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native'
import { getDetail } from '../modules/api/ano/thread'
import { getHTMLDom } from '../modules/html-decoder'
import { converDateTime } from '../modules/date-time'
import { UISetting } from '../modules/config'

const styles = StyleSheet.create({
    quoteView: {
        borderWidth: 1,
        borderLeftWidth: 6,
        borderRadius: 4,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 3,
        width: 'auto'
    },
    quoteOriginalText: {
        fontSize: 18
    },
    quoteHeader: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 15
    },
    sendTime: {
        fontSize: 18,
    },
    sendCookieName: {
        fontSize: 18
    },
    sendCookieNameBigVIP: {
        fontSize: 18,
        color: 'red'
    },
    sendCookieNamePO: {
        borderWidth: 1,
        borderRadius: 2
    },
    quoteText: {
        color: '#789922',
        fontSize: 20,
        lineHeight: 20,
        paddingLeft: 8,
        paddingRight: 8
    },
});

class ItemQuote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayText: "",
            userID: '',
            sendTime: '',
            userIDStyles: [],
            content: [<Text key={-1} style={styles.quoteOriginalText}>正在获取...</Text>]
        }
    }
    isUnmount = true;
    componentDidMount() {
        this.isUnmount = false;
        let dpId = this.props.id.match(/\d{1,11}/)[0];
        this._getDetail(dpId);
    }
    _getDetail = async (id) => {
        let detail = await getDetail(id);
        if(detail.status === 'ok') {
            var userIDStyles = [];
            if(detail.res.admin == 1) {
                userIDStyles.push(styles.sendCookieNameBigVIP);
            }
            else {
                userIDStyles.push(styles.sendCookieName);
                userIDStyles.push({color: UISetting.colors.globalColor});
            }
            if(detail.res.userid == this.props.po){
                userIDStyles.push(styles.sendCookieNamePO);
                userIDStyles.push({
                    borderColor: UISetting.colors.globalColor,
                    backgroundColor: UISetting.colors.lightColor
                });
            }

            let contentBlocks = detail.res.content.split(/((?:&gt;|\>){2}No\.\d{1,11}(?:<br \/>)*(?:\n)*)/);
            let tempContent = [];
            for(let i = 0; i < contentBlocks.length; i++) {
                let content = contentBlocks[i];
                if(content === '' || content === null) {
                    continue;
                }
                if(/((&gt;){2}|(>){2})(No\.){0,1}\d{1,11}/.test(content)) {
                    let contentDom = getHTMLDom(content.replace('\n','').replace('<br />', ''), this._onPressUrl);
                    tempContent.push(
                        <Text key={'text-' + i}  style={styles.quoteText}>{contentDom}</Text>
                    );
                    tempContent.push(
                        <ItemQuote counter={this.props.counter + 1} key={'quote-' + i} id={content} navigation={this.props.navigation} po={this.props.po}></ItemQuote>
                    );
                }
                else {
                    let contentDom = getHTMLDom(content, this._onPressUrl);
                    tempContent.push(
                        <Text key={'text-' + i} style={[styles.quoteOriginalText, {color: UISetting.colors.lightFontColor}]}>{contentDom}</Text>
                    );
                }
            }
            if(this.isUnmount) {
                return;
            }
            this.setState({
                content: tempContent,
                userID: getHTMLDom(detail.res.userid, null),
                sendTime: converDateTime(detail.res.now),
                userIDStyles: userIDStyles
            });
        }
        else {
            if(this.isUnmount) {
                return;
            }
            this.setState({
                content: <Text>{'获取引用失败：' + detail.errmsg}</Text>
            });
        }
    }
    _onPressUrl = (url)=>{
        if( (url.href.indexOf('/t/') >= 0) && (
            (url.href.indexOf('adnmb') >= 0) || (url.href.indexOf('nimingban') >= 0) || (url.href.indexOf('h.acfun'))
        ) ) {
            let threadNo = url.href.split('/t/')[1];
            this.props.navigation.push('Details', {
                threadDetail: {
                    id: threadNo, 
                    userid: 'null', 
                    content: 'null',
                    now: '2099-12-12 12:12:12'
                }
            })
        }
        else {
            this.props.navigation.push('WebView', {
                URL: url.href
            });
        }
    }
    componentWillReceiveProps(res) {

    }
    componentWillUnmount() {
        this.isUnmount = true;
    }
    _goToDetailPage = () => {
        let dpId = this.props.id.match(/\d{1,11}/)[0];
        this.props.navigation.push('Details', {
            threadDetail: {
                id: dpId, 
                userid: 'null', 
                content: 'null',
                now: '2099-12-12 12:12:12'
            }
        })
    }
    render() {
        if(this.props.counter >= UISetting.nestedQuoteCount) {
            return null;
        }
        return (
            <TouchableOpacity 
                style={[styles.quoteView, {
                    borderColor: UISetting.colors.globalColor,
                    backgroundColor: UISetting.colors.lightColor
                }]} onPress={this._goToDetailPage} activeOpacity={0.7}>
                <View style={styles.quoteHeader}>
                    <Text style={this.state.userIDStyles}>
                        {this.state.userID}
                    </Text>
                    <Text style={[styles.sendTime, {color: UISetting.colors.globalColor}]}>
                        {this.state.sendTime}
                    </Text>
                </View>
                {this.state.content}
            </TouchableOpacity>
        );
    }
}

export { ItemQuote }