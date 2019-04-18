import React from 'react'
import { Text, View, StyleSheet, Dimensions, TouchableOpacity, Animated } from 'react-native'
import { getHTMLDom } from '../modules/html-decoder'
import { converDateTime } from '../modules/date-time'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { history } from '../modules/history'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'
import { UISetting } from '../modules/config'

const styles = StyleSheet.create({
    mainListItem: {
        marginTop: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
    },
    touchActiveView: {
        position: 'absolute',
        opacity: 0.3,
        width: '200%',
        height: '100%',
        left: '-200%',
        top: 0,
        zIndex: 995,
        borderTopRightRadius: 500,
        borderBottomRightRadius: 500,
    },
    mainListItemContent: {
        fontSize: 20,
        paddingLeft: 8,
        paddingRight: 8
    },
    mainListItemBottom: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 3,
        paddingLeft: 8,
        paddingRight: 13
    },
    mainListReplayCountText: {
        marginLeft: 3,
        fontSize: 18
    },
    displayNone: {
        display: 'none'
    }
});

class MainListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayData:{},
            imgLocalUri: null,
            translateNow: new Animated.Value(0),
            fullImageDownloading: false
        }
    }
    _startAnime(to, success=()=>{}) {
        //this.state.translateNow.setValue(0);
        Animated.timing(
            this.state.translateNow,
            {
                toValue: to,
                duration: 200,
                useNativeDriver: true,
                stiffness: 80
            }
        ).start(success);
    }
    _onPress = () => {
        requestAnimationFrame(()=>{
            this.props.navigation.navigate('Details', {
                threadDetail: {
                    id: this.props.itemDetail.id,
                    img: this.props.itemDetail.img,
                    ext: this.props.itemDetail.ext,
                    now: this.props.itemDetail.now,
                    userid: this.props.itemDetail.userid,
                    name: this.props.itemDetail.name,
                    email: this.props.itemDetail.email,
                    title: this.props.itemDetail.title,
                    content: this.props.itemDetail.content,
                    sage: this.props.itemDetail.sage,
                    admin: this.props.itemDetail.admin,
                }
            });
        });
        history.addNewHistory('browse', this.props.itemDetail, Date.parse(new Date()));
        this._startAnime(Dimensions.get('window').width * 2, ()=>this._startAnime(0));
    }

    componentDidMount() {
        this._updateData(this.props.itemDetail);
    }
    componentWillUnmount() {
    }
    componentWillReceiveProps(res) {
        this._updateImage(res.itemDetail.localImage);
    }
    _updateImage = (localUri) => {
        if(this.state.imgLocalUri != localUri) {
            this.setState({
                imgLocalUri: localUri
            });
        }
    }

    _updateData = (itemDetail)=>{
        let displayData = {};
        displayData['userID'] = getHTMLDom(itemDetail.userid);
        displayData['threadContent'] = getHTMLDom(itemDetail.content, (url)=>{
            if( (url.href.indexOf('/t/') >= 0) && (
                (url.href.indexOf('adnmb') >= 0) || (url.href.indexOf('nimingban') >= 0) || (url.href.indexOf('h.acfun'))
            ) ) {
                let threadNo = url.href.split('/t/')[1];
                this.props.navigation.navigate('Details', {
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
        });
        //let replayCountText = itemDetail.remainReplys ? (itemDetail.remainReplys.toString() + "(" + itemDetail.replyCount + ")") : itemDetail.replyCount;
        displayData['replayCountText'] = itemDetail.replyCount;
        displayData['fName'] = itemDetail.fname;
        displayData['displayTime'] = converDateTime(itemDetail.now);
        this.setState({
            displayData: displayData,
            imgLocalUri: null,
        });
    }
    render() {
        let { itemDetail } = this.props;
        return (
            <TouchableOpacity 
                style={[styles.mainListItem, {
                    backgroundColor: UISetting.colors.threadBackgroundColor,
                    shadowColor: UISetting.colors.defaultBackgroundColor
                }]} 
                onPress={this._onPress} activeOpacity={1}>
                <Animated.View style={[styles.touchActiveView, {backgroundColor: UISetting.colors.globalColor, transform: [{ translateX: this.state.translateNow}]}]}/>
                <MainListItemHeader itemDetail={itemDetail} po={null}/>

                <Text style={[styles.mainListItemContent, {color: UISetting.colors.threadFontColor}]}>
                    {this.state.displayData['threadContent']}
                </Text>
                <MainListImage 
                    tid={itemDetail.id}
                    navigation={this.props.navigation}
                    Toast={this.props.Toast}
                    localUri={this.state.imgLocalUri}
                    imgUri={itemDetail.img + itemDetail.ext}/>
                <View style={this.state.displayData['replayCountText']===undefined? styles.displayNone: styles.mainListItemBottom}>
                    <Icon name={'bubble'} size={24} color={UISetting.colors.globalColor} />
                    <Text style={[styles.mainListReplayCountText, {color: UISetting.colors.globalColor}]}>{this.state.displayData['replayCountText']}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export { MainListItem }