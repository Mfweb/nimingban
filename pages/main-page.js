import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import { getThreadList, getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView, ImageProcessView } from '../component/list-process-view'
import { TopModal } from '../component/top-modal'
import { converDateTime } from '../modules/date-time'
import { getUserCookie } from '../modules/cookie-manager'
import Icon from 'react-native-vector-icons/SimpleLineIcons'


const globalColor = '#fa7296';

const styles = StyleSheet.create({
    mainList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
    },
    mainListItem: {
        backgroundColor: '#FFF',
        marginTop: 10,
        padding: 8,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
    },
    mainListItemContent: {
        color: '#000',
        fontSize: 20
    },
    mainListItemHeader: {

    },
    mainListItemHeaderL1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    mainListItemHeaderL2: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    mainListItemHeaderL2L: {
        marginLeft: 5,
    },
    mainListItemHeaderL2R: {
        marginRight: 5,
    },
    mainListItemUserCookieName: {
        fontSize: 18,
        color: globalColor
    },
    mainListItemUserCookieNameBigVIP: {
        fontSize: 18,
        color: 'red'
    },
    mainListItemTid: {
        fontSize: 18,
        color: globalColor
    },
    mainListItemTime: {
        fontSize: 18,
        color: globalColor
    },
    mainListItemTitle: {
        fontSize: 16,
        color: '#696969'
    },
    mainListItemName: {
        fontSize: 16,
        color: '#696969'
    },
    mainListItemSAGE: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 22
    },
    mainListItemForumName: {
        color: 'red',
        fontSize: 20
    },
    displayNone: {
        display: 'none'
    },
    mainListItemBottom: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 3,
        paddingRight: 5
    },
    mainListReplayCountText: {
        marginLeft: 3,
        color: '#696969',
        fontSize: 18
    },
    mainListItemImageTouch: {
        marginTop: 5,
        flex: 0,
        width: Dimensions.get('window').width / 2.5,
        height: Dimensions.get('window').width / 2.5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    mainListItemImage: {
        height: Dimensions.get('window').width / 2.5,
        width: Dimensions.get('window').width / 2.5,
        left: 0,
    },
    headerRightView: {
        flex: 1,
        flexDirection: 'row',
    },
    footerMessage: {
        color: '#696969',
        fontSize: 18,
        textAlign: 'center',
        padding: 8
    }
});

class MainListImage extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { itemDetail } = this.props;
        let imageSource = itemDetail.localImage?itemDetail.localImage:require('../imgs/loading.png');
        if(itemDetail.localImage) {
            return (
                <Image style={itemDetail.img?styles.mainListItemImage:styles.displayNone}
                source={ imageSource } 
                resizeMode='contain'
                />
            );
        }
        else {
            return (<ImageProcessView height={40} width={40}/>);
        }
    }
}

class MainListItem extends React.Component {
    constructor(props) {
        super(props);
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
    }
    _onPressImage = () => {
        this.props.navigation.push('ImageViewer', {
            imgName: this.props.itemDetail.img + this.props.itemDetail.ext
        });
    }

    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        //console.log(this.props.itemDetail);
        let { itemDetail } = this.props;        
        let userID = getHTMLDom(itemDetail.userid);
        let threadContent = getHTMLDom(itemDetail.content, (url)=>{
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
        let replayCountText = itemDetail.replyCount;
        let fName = itemDetail.fname;
        let displayTime = converDateTime(itemDetail.now);

        return (
            <TouchableOpacity onPress={this._onPress} activeOpacity={0.5}>
                <View style={styles.mainListItem}>
                    <View style={styles.mainListItemHeader}>
                        <View style={styles.mainListItemHeaderL1}>
                            <Text style={itemDetail.admin == 1 ? styles.mainListItemUserCookieNameBigVIP : styles.mainListItemUserCookieName}>
                                {userID}
                            </Text>

                            <Text style={styles.mainListItemTid}>
                                No.{itemDetail.id}
                            </Text>

                            <Text style={styles.mainListItemTime}>
                                {displayTime}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.mainListItemHeaderL2}>
                        <View style={styles.mainListItemHeaderL2L}>
                            <Text style={itemDetail.title == '无标题' ? styles.displayNone : styles.mainListItemTitle}>{itemDetail.title}</Text>
                            <Text style={itemDetail.name == '无名氏' ? styles.displayNone : styles.mainListItemName}>{itemDetail.name}</Text>
                        </View>

                        <View style={styles.mainListItemHeaderL2R}>
                            <Text style={fName ?styles.mainListItemForumName: styles.displayNone }>{fName}</Text>
                            <Text style={itemDetail.sage == '0' ? styles.displayNone : styles.mainListItemSAGE}>SAGE</Text>
                        </View>

                    </View>

                    <Text style={styles.mainListItemContent}>
                        {threadContent}
                    </Text>
                    <TouchableOpacity style={itemDetail.img?styles.mainListItemImageTouch:styles.displayNone} onPress={this._onPressImage} activeOpacity={0.5}>
                        <MainListImage itemDetail={itemDetail} />
                    </TouchableOpacity>


                    <View style={styles.mainListItemBottom}>
                        <Icon name={'bubble'} size={24} color={globalColor} />
                        <Text style={styles.mainListReplayCountText}>{replayCountText}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerLoading: false,
            footerLoading: 0,
            threadList: Array(),
            page: 1,
            errmsg: null,
            errmsgModal: false,
            loadEnd: false,
            footerMessage: ''
        };
        /*this.viewabilityConfig = {
            minimumViewTime: 100,
            viewAreaCoveragePercentThreshold: 10,
            waitForInteraction: true,
        }*/
    }
    fid = -1;
    fname = '时间线';


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: 'A岛(' + navigation.getParam('name', '时间线') + ')',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <View style={styles.headerRightView}>
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={params.newThread} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'note'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2, marginLeft: 5 }} onPress={params.openLDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'options-vertical'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    componentDidMount() {
        this.fid = this.props.navigation.getParam('forumID', '-1');
        this.fname = this.props.navigation.getParam('name', '时间线');

        //clearImageCache();
        this._pullDownRefresh();
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
            newThread: this._newThread
        });
    }

    _newThread = () => {
        if(this.fid == '-1') {
            this.setState({ 
                errmsgModal: true,
                errmsg: '时间线不能发串，请在左侧选择要发串的板块。',
                footerLoading: 0 
            });
            return;
        }
        if(!getUserCookie()) {
            this.setState({ 
                errmsgModal: true,
                errmsg: '你还没有饼干，请在饼干管理器中选择饼干。',
                footerLoading: 0 
            });
            return;
        }
        this.props.navigation.push('NewPostScreen', {
            mode: 2,
            fname: this.fname,
            fid: this.fid
        });
    }
    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            //console.log(imgName);
            getImage('thumb', imgName).then((res) => {
                let imgUrl = require('../imgs/img-error.png');
                if(res.status == 'ok') {
                    imgUrl = {uri: 'file://' + res.path};
                }
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = imgUrl;
                this.setState({ threadList: tempList });
            }).catch(function() {
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ threadList: tempList });
            });
        }
        return (
        <MainListItem itemDetail={item} navigation={this.props.navigation} />)
    }

    _footerComponent = () => {
        if(this.state.footerLoading == 0) {
            return (<Text style={styles.footerMessage}>{this.state.footerMessage}</Text>);
        }
        else {
            let windowWidth = Dimensions.get('window').width;
            return (
                <ListProcessView toMax={windowWidth} height={8} />
            );
        }
    }
    /*_onViewableItemsChanged = ({changed}) => {
        console.log(changed);
    }*/
    render() {
        return (
            <View style={{flex:1}}>
               <TopModal
                    show={this.state.errmsgModal}
                    width={280}
                    title={'错误'}
                    rightButtonText={'确认'}
                    item={<Text style={{width: 260, fontSize: 20, margin: 10}}>{this.state.errmsg}</Text>}
                    onClosePress={()=>{
                        this.setState({
                            errmsgModal: false
                        });
                    }}
                    onRightButtonPress={()=>{
                        this.setState({
                            errmsgModal: false
                        });
                    }} />
                <FlatList
                    data={this.state.threadList}
                    extraData={this.state}
                    style={styles.mainList}
                    onRefresh={this._pullDownRefresh}
                    refreshing={this.state.headerLoading}
                    keyExtractor={(item, index) => {return item.id.toString() + '-' + index.toString()}}
                    renderItem={this._renderItem}
                    ListFooterComponent={this._footerComponent}
                    onEndReachedThreshold={0.1}
                    onEndReached={this._pullUpLoading}
                    onViewableItemsChanged={this._onViewableItemsChanged}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.headerLoading}
                            onRefresh={this._pullDownRefresh}
                            title="正在加载..."/>
                    }
                    /*viewabilityConfig={this.viewabilityConfig}*/
                />
            </View>
        );
    }

    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading || this.state.loadEnd) {
            return;
        }
        requestAnimationFrame(() => {
            this.setState({ footerLoading: 1 }, async function() {
                getThreadList(this.fid, this.state.page).then((res) => {
                    if (res.status == 'ok') {
                        let nextPage = this.state.page + 1;
                        var tempList = this.state.threadList.slice()
                        tempList = tempList.concat(res.res);
                        this.setState({
                            threadList: tempList,
                            page: nextPage,
                            footerLoading: 0,
                            loadEnd: res.res.length == 0? true: false,
                            footerMessage: res.res.length == 0?`加载完成 ${this.state.threadList.length}`:''
                        });
                    }
                    else {
                        this.setState({ 
                            errmsgModal: true,
                            errmsg: '请求数据失败:' + res.errmsg,
                            footerLoading: 0 
                        });
                    }
                }).catch(()=>{
                    this.setState({ 
                        errmsgModal: true,
                        errmsg: '请求数据失败',
                        footerLoading: 0 
                    });
                });
            });
        });
    }

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        requestAnimationFrame(() => {
            this.setState({ headerLoading: true, page: 1 }, function() {
                getThreadList(this.fid, this.state.page).then((res) => {
                    if (res.status == 'ok') {
                        this.loadingImages = [];
                        this.setState({
                            threadList: res.res,
                            page: 2,
                            headerLoading: false,
                            loadEnd: false
                        });
                    }
                    else {
                        this.setState({
                            errmsgModal: true,
                            errmsg: '请求数据失败:' + res.errmsg,
                        });
                    }
                    this.setState({ headerLoading: false });
                }).catch((error)=>{
                    console.log(error)
                    this.setState({ 
                        errmsgModal: true,
                        errmsg: '请求数据失败:' + error,
                        headerLoading: false 
                    });
                });
            });
        });
    }
}

export { HomeScreen };