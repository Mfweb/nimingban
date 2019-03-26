import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView } from 'react-native'
import { getThreadList, getImage, getForumList, getForumIDByName } from '../modules/apis'
import { ListProcessView } from '../component/list-process-view'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic } from '../modules/config'
import { Toast } from '../component/toast'
import { history } from '../modules/history'
import { MainListItem } from '../component/list-main-item'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation'
import { getHTMLDom } from '../modules/html-decoder'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    mainList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
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
    headerRightPage: {
        backgroundColor: globalColor,
        borderColor: '#FFE4E1',
        borderWidth: 1,
        minWidth: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
        marginRight: 13, 
        marginTop: 2
    },
    headerRightPageText: {
        color: '#FFF',
        fontSize: 20,
    }
});




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
    isUnmount = true;

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
                    <View style={styles.headerRightPage}>
                        <Text style={styles.headerRightPageText}>{navigation.getParam('page', '1')}</Text>
                    </View>
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
        this.isUnmount = false;
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
    componentWillUnmount() {
        this.isUnmount = true;
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
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, this.fname,
        [
            '版规',
            '搜索',
            '跳转'
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                    this._showRule();
                    break;
                    case 1:
                    break;
                    case 2:
                    break;
                }
            });
        });
    }
    /**
     * 显示版规
     */
    _showRule = async () => {
        let allForums = await getForumList();
        if(allForums.status !== 'ok') {
            this.TopModal.showMessage('错误', allForums.errmsg,'确认');
            return;
        }
        allForums.res.forEach(forumGroup => {
            forumGroup.forums.forEach(forumItem => {
                if(forumItem.id == this.fid) {
                    let rule = getHTMLDom(forumItem.msg.replace('\n', ''), this._onPressUrl);
                    this.TopModal.showMessage('版规-' + this.fname, (<ScrollView><Text style={{fontSize: 18}}>{rule}</Text></ScrollView>), '确认');
                    return;
                }
            });
        });
        /*this.TopModal.showMessage(getHTMLDom());
        console.log(allForums);*/
    }
    _onPressUrl = (url)=>{
        this.TopModal.closeModal();
        // 站内可跳转链接
        if( (url.href.indexOf('adnmb') >= 0) || (url.href.indexOf('nimingban') >= 0) || (url.href.indexOf('h.acfun') >=0 || url.href.indexOf('/') == 0 ) ) {
            // 站内串
            if( url.href.indexOf('/t/') >= 0 ) {
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
            // 站内板块
            else if( (url.href.indexOf('/f/') >= 0) ) {
                let fName = decodeURI(url.href.split('/f/')[1]);
                getForumIDByName(fName).then((res) => {
                    this.props.navigation.setParams({
                        forumID: res,
                        name: fName
                    });
                    this.fid = res;
                    this._pullDownRefresh();
                });
            }
            // 站内链接
            else {
                this.props.navigation.push('WebView', {
                    URL: 'https://adnmb.com' + url.href
                });
            }
        }
        // 站外链接
        else {
            this.props.navigation.push('WebView', {
                URL: url.href
            });
        }
    }
    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            getImage('thumb', imgName).then((res) => {
                if(this.isUnmount) return;
                let imgUrl = require('../imgs/img-error.png');
                if(res.status == 'ok') {
                    imgUrl = {uri: 'file://' + res.path};
                }
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = imgUrl;
                this.setState({ threadList: tempList });
            }).catch(function() {
                if(this.isUnmount)return;
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ threadList: tempList });
            });
        }
        return (
        <MainListItem itemDetail={item} navigation={this.props.navigation} Toast={this.toast} />)
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
                if(this.isUnmount)return;
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
                    this.props.navigation.setParams({
                        page: nextPage - 1
                    });
                }
                else {
                    this.TopModal.showMessage('错误', `请求数据失败:${res.errmsg}`,'确认');
                    this.setState({ 
                        footerLoading: 0 
                    });
                }
            }).catch(()=>{
                if(this.isUnmount)return;
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
                if(this.isUnmount)return;
                if (res.status == 'ok') {
                    this.loadingImages = [];
                    this.setState({
                        threadList: res.res,
                        page: 2,
                        headerLoading: false,
                        loadEnd: false,
                    });
                    this.props.navigation.setParams({
                        page: 1
                    });
                }
                else {
                    this.TopModal.showMessage('错误', `请求数据失败${res.errmsg}`,'确认');
                    this.setState({ headerLoading: false });
                }
            }).catch((error)=>{
                if(this.isUnmount)return;
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
            <SafeAreaView style={{flex:1}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
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
            </SafeAreaView>
        );
    }
}

export { HomeScreen };