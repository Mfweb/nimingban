import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import { getThreadList, getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView, ImageProcessView } from '../component/list-process-view'
import { TopModal, TopModalApis } from '../component/top-modal'
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
        if(this.props.localUri) {
            // 图片已经下载到本地了
            let imageSource = this.props.localUri
            ?
            this.props.localUri
            :
            require('../imgs/loading.png');
            return (
                <Image style={this.props.imgUri ? styles.mainListItemImage : styles.displayNone}
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
        this.state = {
            displayData:{},
            imgLocalUri: null,
            imgUri: null
        }
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
            imgUri: itemDetail.img
        });
    }
    render() {
        let { itemDetail } = this.props;
        return (
            <TouchableOpacity onPress={this._onPress} activeOpacity={0.5}>
                <View style={styles.mainListItem}>
                    <View style={styles.mainListItemHeader}>
                        <View style={styles.mainListItemHeaderL1}>
                            <Text style={itemDetail.admin == 1 ? styles.mainListItemUserCookieNameBigVIP : styles.mainListItemUserCookieName}>
                                {this.state.displayData['userID']}
                            </Text>

                            <Text style={styles.mainListItemTid}>
                                No.{itemDetail.id}
                            </Text>

                            <Text style={styles.mainListItemTime}>
                                {this.state.displayData['displayTime']}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.mainListItemHeaderL2}>
                        <View style={styles.mainListItemHeaderL2L}>
                            <Text style={itemDetail.title == '无标题' ? styles.displayNone : styles.mainListItemTitle}>{itemDetail.title}</Text>
                            <Text style={itemDetail.name == '无名氏' ? styles.displayNone : styles.mainListItemName}>{itemDetail.name}</Text>
                        </View>

                        <View style={styles.mainListItemHeaderL2R}>
                            <Text style={this.state.displayData['fName'] ?styles.mainListItemForumName: styles.displayNone }>{this.state.displayData['fName']}</Text>
                            <Text style={itemDetail.sage == '0' ? styles.displayNone : styles.mainListItemSAGE}>SAGE</Text>
                        </View>

                    </View>

                    <Text style={styles.mainListItemContent}>
                        {this.state.displayData['threadContent']}
                    </Text>
                    <TouchableOpacity style={itemDetail.img?styles.mainListItemImageTouch:styles.displayNone} onPress={this._onPressImage} activeOpacity={0.5}>
                    <MainListImage 
                        localUri={this.state.imgLocalUri}
                        imgUri={this.state.imgUri}/>
                    </TouchableOpacity>


                    <View style={styles.mainListItemBottom}>
                        <Icon name={'bubble'} size={24} color={globalColor} />
                        <Text style={styles.mainListReplayCountText}>{this.state.displayData['replayCountText']}</Text>
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
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2, marginLeft: 5 }} onPress={params.menuFunctions} underlayColor={'#ffafc9'} activeOpacity={0.5} >
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
            newThread: this._newThread,
            menuFunctions: this._menuFunctions
        });
    }
    
    /**
     * 发新串
     */
    _newThread = () => {
        if(this.fid == '-1') {
            TopModalApis.showMessage(this.refs['msgBox'], '错误','时间线不能发串，请在左侧选择要发串的板块。','确认');
            this.setState({ 
                footerLoading: 0 
            });
            return;
        }
        if(!getUserCookie()) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误','你还没有饼干，请在饼干管理器中选择饼干。','确认');
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

    _menuFunctions = () =>{
        TopModalApis.showMessage(this.refs['msgBox'], '测试','功能未实现','确认');
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
               <TopModal ref={'msgBox'} />
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
                    TopModalApis.showMessage(this.refs['msgBox'],'错误', `请求数据失败:${res.errmsg}`,'确认');
                    this.setState({ 
                        footerLoading: 0 
                    });
                }
            }).catch(()=>{
                TopModalApis.showMessage(this.refs['msgBox'],'错误', `请求数据失败`,'确认');
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
                    TopModalApis.showMessage(this.refs['msgBox'],'错误', `请求数据失败${res.errmsg}`,'确认');
                    this.setState({ headerLoading: false });
                }
            }).catch((error)=>{
                TopModalApis.showMessage(this.refs['msgBox'],'错误', `请求数据失败${error}`,'确认');
                console.log(error)
                this.setState({ 
                    headerLoading: false 
                });
            });
        });
    }
}

export { HomeScreen };