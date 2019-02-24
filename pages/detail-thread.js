import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import { getReplyList, getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView,ImageProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { converDateTime } from '../modules/date-time'

const globalColor = '#fa7296';

const styles = StyleSheet.create({
    mainList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
    },
    mainListItem: {
        backgroundColor: '#FFF',
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
    mainListItemUserCookieNamePO: {
        backgroundColor: '#FFE4E1'
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
    displayNone: {
        display: 'none'
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
    ItemSeparator: {
        height: 1,
        backgroundColor: '#FFB6C1'
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
    downloadImage: {
        position: 'absolute',
        top: Dimensions.get('window').width / 2.5 / 2 - 20,
        left: Dimensions.get('window').width / 2.5 / 2 - 20,
        zIndex: 500
    }
});

var poID = '';
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
            imgUri: null,
            fullImageDownloading: false
        }
    }
    _onPress = () => {

    }
    _onPressImage = () => {
        if(this.state.fullImageDownloading) {
            return;
        }
        this.setState({
            fullImageDownloading: true
        }, async () => {
            let res = await getImage('image', this.props.itemDetail.img + this.props.itemDetail.ext);
            this.setState({
                fullImageDownloading: false
            });
            if(res.status === 'ok') {
                this.props.navigation.push('ImageViewer', {
                    imageUrl: res.path
                });
            }
            else {
                
            }
        });
    }
    componentDidMount() {
        this._updateData(this.props.itemDetail);
    }
    
    componentWillReceiveProps(res) {
        this._updateImage(res.itemDetail.localImage);
    }
    componentWillUnmount() {
    }
    _updateImage = (localUri) => {
        if(this.state.imgLocalUri != localUri) {
            this.setState({
                imgLocalUri: localUri
            });
        }
    }
    _updateData = (itemDetail) => {
        let displayData = {};
        //console.log(this.props.itemDetail);
        displayData['userID'] = getHTMLDom(itemDetail.userid);
        displayData['displayTime'] = converDateTime(itemDetail.now);

        displayData['threadContent'] = getHTMLDom(itemDetail.content, (url)=>{
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
        });
        displayData['userIDStyle'] = [];
        if(itemDetail.admin == 1) {
            displayData['userIDStyle'].push(styles.mainListItemUserCookieNameBigVIP);
        }
        else {
            displayData['userIDStyle'].push(styles.mainListItemUserCookieName);
        }
        if(itemDetail.userid == poID){
            displayData['userIDStyle'].push(styles.mainListItemUserCookieNamePO);
        }
        this.setState({
            displayData: displayData,
            imgLocalUri: null,
            imgUri: itemDetail.img
        });
    }
    render() {
        let { itemDetail } = this.props;
        return (
            <TouchableOpacity onPress={this._onPress} activeOpacity={0.8}>
                <View style={styles.mainListItem}>
                    <View style={styles.mainListItemHeader}>
                        <View style={styles.mainListItemHeaderL1}>
                            <Text style={this.state.displayData['userIDStyle']}>
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
                            <Text style={itemDetail.sage == '0' ? styles.displayNone : styles.mainListItemSAGE}>SAGE</Text>
                        </View>

                    </View>

                    <Text style={styles.mainListItemContent}>
                        {this.state.displayData['threadContent']}
                    </Text>
                    <TouchableOpacity style={itemDetail.img?styles.mainListItemImageTouch:styles.displayNone} onPress={this._onPressImage}>
                        <MainListImage 
                            localUri={this.state.imgLocalUri}
                            imgUri={this.state.imgUri}/>
                        <ImageProcessView style={this.state.fullImageDownloading?styles.downloadImage:styles.displayNone} height={40} width={40} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }
}

class DetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerLoading: false,
            footerLoading: 0,
            replyList: Array(),
            page: 1,
            loadEnd: false,
            footerMessage: ''
        };
    }

    isUnMount = false;
    localReplyCount = 0;
    threadDetail = null;
    static navigationOptions = ({navigation}) => {
        const { params = {} } = navigation.state;
        return {
            title: navigation.getParam('threadDetail', null).title,
            headerRight: (
                <View style={styles.headerRightView}>
                    <TouchableOpacity onPress={params.replyThread} style={{ marginRight: 8, marginTop: 2 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'note'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2, marginLeft: 5 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            )
        };
    };
    componentWillMount() {
        
    }
    componentDidMount() {
        this.threadDetail = this.props.navigation.getParam('threadDetail', null);
        poID = this.threadDetail.userid;
        this.props.navigation.setParams({ 
            openLDrawer: this.props.navigation.openDrawer,
            replyThread: this._replyThread
        });
        this.isUnMount = false;
        this.localReplyCount = 0;
        this.setState({
            replyList: [this.threadDetail]
        }, ()=>{
            this._pullDownRefresh();
        });
    }
    componentWillUnmount() {
        this.isUnMount = true;
    }

    _replyThread = () => {
        this.props.navigation.push('NewPostScreen', {
            mode: 1,
            replyId: this.threadDetail.id
        });
    }

    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            //console.log(imgName);
            getImage('thumb', imgName).then((res) => {
                if(this.isUnMount) {
                    return;
                }
                let imgUrl = require('../imgs/img-error.png');
                if(res.status == 'ok') {
                    imgUrl = {uri: 'file://' + res.path};
                }
                let tempList = this.state.replyList.slice();
                tempList[index].localImage = imgUrl;
                this.setState({ replyList: tempList });
            }).catch(function() {
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ threadList: tempList });
            });
        }
        return (
        <MainListItem itemDetail={item} navigation={this.props.navigation} />)
    }

    _itemSeparator = () =>(
        <View style={styles.ItemSeparator}></View>
    )

    _footerComponent = () => {
        if(this.state.footerLoading == 0) {
            return (
                <TouchableOpacity onPress={()=>{ this.setState({loadEnd: false}, this._pullUpLoading); }}>
                    <Text style={styles.footerMessage}>{this.state.footerMessage}</Text>
                </TouchableOpacity>
            );
        }
        else {
            let windowWidth = Dimensions.get('window').width;
            return (
                <ListProcessView toMax={windowWidth} height={8} />
            );
        }
    }

    render() {
        return (
            <View style={{flex:1}}>
               <TopModal ref={'msgBox'} />
                <FlatList
                    data={this.state.replyList}
                    extraData={this.state}
                    style={styles.mainList}
                    onRefresh={this._pullDownRefresh}
                    refreshing={this.state.headerLoading}
                    keyExtractor={(item, index) => {return item.id.toString() + '-' + index.toString()}}
                    renderItem={this._renderItem}
                    //onScroll={this._onScroll}
                    ListFooterComponent={this._footerComponent}
                    ItemSeparatorComponent={this._itemSeparator}
                    onEndReachedThreshold={0.1}
                    onEndReached={this._pullUpLoading}
                    onViewableItemsChanged={this._onViewableItemsChanged}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.headerLoading}
                            onRefresh={this._pullDownRefresh}
                            title="正在加载..."/>
                    }
                />
            </View>
        );
    }

    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading || this.state.loadEnd ) {
            return;
        }
        this.setState({ footerLoading: 1 }, async function() {
            getReplyList(this.threadDetail.id, this.state.page).then((res) => {
                if(this.isUnMount) {
                    return;
                }
                if (res.status == 'ok') {
                    //这一页是空的，到底了
                    if( ((res.res.replys.length == 1) && (res.res.replys[0].id == 9999999))
                        || (res.res.replys.length == 0) ) {
                        console.log('end');
                        this.setState({
                            footerLoading: 0,
                            loadEnd: true,
                            footerMessage: `加载完成,点击再次加载 ${this.state.replyList.length-1}/${res.res.replyCount}`
                        });
                    }
                    else {
                        //非第一页广告去掉
                        if( res.res.replys[0].id == 9999999 ) {
                            res.res.replys.splice(0, 1);
                        }
                        //计算上次拉到哪里
                        let cpCount = (this.localReplyCount > 0) ? (res.res.replys.length - this.localReplyCount) : res.res.replys.length;
                        //本页是否填满
                        var nextPage = this.state.page + (res.res.replys.length >= 19 ? 1 : 0);
                        var tempList = this.state.replyList.slice()
                        var pageLength = res.res.replys.length;
                        if(cpCount > 0) {
                            res.res.replys.splice(0, this.localReplyCount);
                            //console.log(res.res.replys);
                            tempList = tempList.concat(res.res.replys);
                        }
                        else {
                            this.setState({
                                loadEnd: true,
                                footerMessage: `加载完成,点击再次加载 ${tempList.length-1}/${res.res.replyCount}`
                            });
                        }
                        this.setState({
                            replyList: tempList,
                            page: nextPage,
                            footerLoading: 0
                        }, ()=>{console.log('replay count:' + this.state.replyList.length.toString());});
                        if(pageLength >= 19) {
                            this.localReplyCount = 0;
                        }
                        else {
                            this.localReplyCount = pageLength;
                        }
                    }
                }
                else {
                    TopModalApis.showMessage(this.refs['msgBox'], '错误', `请求数据失败:${res.errmsg}`,'确认');
                    this.setState({
                        footerLoading: 0,
                    });
                }
            }).catch((res)=>{
                TopModalApis.showMessage(this.refs['msgBox'], '错误', `请求数据失败:${res}`,'确认');
                this.setState({
                    footerLoading: 0,
                });
                console.log(res);
            });
        });
    }

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true, page: 1 }, async () => {
            let res = await getReplyList(this.threadDetail.id, this.state.page);
            if (res.status == 'ok') {
                this.props.navigation.setParams({
                    threadDetail: res.res
                });
                this.localReplyCount = res.res.replys.length >= 19? 0: res.res.replys.length;
                if(res.res.replys.length > 0 && res.res.replys[0].id==9999999 && this.localReplyCount > 0) {
                    this.localReplyCount --;
                }
                this.loadingImages = [];
                let tempList = Array();
                tempList.push({
                    id: res.res.id,
                    img: res.res.img,
                    ext: res.res.ext,
                    now: res.res.now,
                    userid: res.res.userid,
                    name: res.res.name,
                    email: res.res.email,
                    title: res.res.title,
                    content: res.res.content,
                    sage: res.res.sage,
                    admin: res.res.admin,
                });
                tempList = tempList.concat(res.res.replys);
                this.setState({
                    replyList: tempList,
                    page: tempList.length >= 19?2:1,
                    headerLoading: false,
                    loadEnd: false
                });
            }
            else {
                TopModalApis.showMessage(this.refs['msgBox'], '错误', `请求数据失败:${res.errmsg}`,'确认');
                this.setState({
                    headerLoading: false,
                    loadEnd: true
                });
            }
        });
    }
}

export { DetailsScreen }