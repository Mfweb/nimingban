import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl, Animated } from 'react-native'
import { getThreadList, getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView, ImageProcessView } from '../component/list-process-view'
import { TopModal } from '../component/top-modal'
import { converDateTime } from '../modules/date-time'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic } from '../modules/config'
import  { Toast } from '../component/toast'
import { history } from '../modules/history'
import { MainListImage } from '../component/list-image-view'
import { MainListItemHeader } from '../component/list-header'

const globalColor = '#fa7296';
var mToast = null;

const styles = StyleSheet.create({
    mainList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
    },
    mainListItem: {
        backgroundColor: '#FFF',
        marginTop: 10,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969'
    },
    mainListItemContent: {
        color: '#000',
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
        color: '#696969',
        fontSize: 18
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
    },
    touchActiveView: {
        position: 'absolute',
        backgroundColor: globalColor,
        opacity: 0.3,
        width: '200%',
        height: '100%',
        left: '-200%',
        top: 0,
        zIndex: 995,
        borderTopRightRadius: 500,
        borderBottomRightRadius: 500,
    },
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
            <TouchableOpacity style={styles.mainListItem} onPress={this._onPress} activeOpacity={1}>
                <Animated.View style={[styles.touchActiveView, {transform: [{ translateX: this.state.translateNow}]}]}/>
                <MainListItemHeader itemDetail={itemDetail} po={null}/>

                <Text style={styles.mainListItemContent}>
                    {this.state.displayData['threadContent']}
                </Text>
                <MainListImage 
                    navigation={this.props.navigation}
                    Toast={mToast}
                    localUri={this.state.imgLocalUri}
                    imgUri={itemDetail.img + itemDetail.ext}/>
                <View style={styles.mainListItemBottom}>
                    <Icon name={'bubble'} size={24} color={globalColor} />
                    <Text style={styles.mainListReplayCountText}>{this.state.displayData['replayCountText']}</Text>
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
            title:  `${configBase.islandList[configDynamic.islandMode].displayName}(${navigation.getParam('name', '时间线')})`,
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
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2, marginLeft: 5 }} onPress={params.menuFunctions} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            )
        }
    }

    componentDidMount() {
        this._initHistoryDataBase();
        this.fid = this.props.navigation.getParam('forumID', '-1');
        this.fname = this.props.navigation.getParam('name', '时间线');

        //clearImageCache();
        this._pullDownRefresh();
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
            newThread: this._newThread,
            menuFunctions: this._menuFunctions
        });
    }
    /**
     * 初始化历史数据库
     */
    _initHistoryDataBase = async () => {
        history.init();
    }
    /**
     * 发新串
     */
    _newThread = () => {
        if(this.fid == '-1') {
            this.TopModal.showMessage('错误','时间线不能发串，请在左侧选择要发串的板块。','确认');
            this.setState({ 
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
    /**
     * 右上角菜单
     */
    _menuFunctions = () =>{
        this.TopModal.showMessage('测试','功能未实现','确认');
    }

    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
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
    
    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading || this.state.loadEnd) {
            return;
        }
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
                    this.TopModal.showMessage('错误', `请求数据失败:${res.errmsg}`,'确认');
                    this.setState({ 
                        footerLoading: 0 
                    });
                }
            }).catch(()=>{
                this.TopModal.showMessage('错误', `请求数据失败`,'确认');
                this.setState({ 
                    footerLoading: 0 
                });
            });
        });
    }

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true, page: 1 }, function() {
            getThreadList(this.fid, this.state.page).then((res) => {
                if (res.status == 'ok') {
                    this.loadingImages = [];
                    this.setState({
                        threadList: res.res,
                        page: 2,
                        headerLoading: false,
                        loadEnd: false,
                    });
                }
                else {
                    this.TopModal.showMessage('错误', `请求数据失败${res.errmsg}`,'确认');
                    this.setState({ headerLoading: false });
                }
            }).catch((error)=>{
                this.TopModal.showMessage('错误', `请求数据失败${error}`,'确认');
                console.log(error)
                this.setState({ 
                    headerLoading: false 
                });
            });
        });
    }

    render() {
        return (
            <View style={{flex:1}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <Toast ref={(ref) => {mToast = ref}}/>
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
                    pageSize={20}
                    removeClippedSubviews={true}
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
}

export { HomeScreen };