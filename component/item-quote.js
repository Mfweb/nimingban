import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { getImage, getDetail } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'
import { converDateTime } from '../modules/date-time'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    quoteView: {
        borderLeftColor: globalColor,
        borderLeftWidth: 8,
        marginLeft: 8,
        marginRight: 8,
        marginBottom: 3,
        width: 'auto',
        backgroundColor: 'rgba(250,114,150,0.3)',
    },
    quoteOriginalText: {
        color: '#A9A9A9',
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
        color: globalColor,
        fontSize: 18,
    },
    sendCookieName: {
        color: globalColor,
        fontSize: 18
    },
    sendCookieNameBigVIP: {
        fontSize: 18,
        color: 'red'
    },
    sendCookieNamePO: {
        backgroundColor: '#FFE4E1'
    },
});

class ItemQuote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayText: "",
            originalText: '正在获取',
            userID: '',
            sendTime: '',
            userIDStyles: []
        }
    }
   
    componentDidMount() {
        let dpId = this.props.id.match(/\d{1,11}/)[0];
        this._getDetail(dpId);
    }
    _getDetail = async (id) => {
        let detail = await getDetail(id);
        if(detail.status === 'ok') {
            console.log(detail);
            var userIDStyles = [];
            if(detail.res.admin == 1) {
                userIDStyles.push(styles.sendCookieNameBigVIP);
            }
            else {
                userIDStyles.push(styles.sendCookieName);
            }
            if(detail.res.userid == this.props.po){
                userIDStyles.push(styles.sendCookieNamePO);
            }
            this.setState({
                originalText: getHTMLDom(detail.res.content, this._onPressUrl),
                userID: getHTMLDom(detail.res.userid, null),
                sendTime: converDateTime(detail.res.now),
                userIDStyles: userIDStyles
            });
        }
        else {
            this.setState({
                originalText: '获取引用失败：' + detail.errmsg
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
    }

    render() {
        return (
            <View style={styles.quoteView}>
                <View style={styles.quoteHeader}>
                    <Text style={this.state.userIDStyles}>
                        {this.state.userID}
                    </Text>
                    <Text style={styles.sendTime}>
                        {this.state.sendTime}
                    </Text>
                </View>
                <Text style={styles.quoteOriginalText}>
                {this.state.originalText}
                </Text>
            </View>
        );
    }
}

export { ItemQuote }