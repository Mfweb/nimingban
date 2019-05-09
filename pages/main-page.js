import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native'
import { getFeedList  } from '../modules/api/ano/feed'
import { getThreadList, getForumIDByName, getForumList } from '../modules/api/ano/forum'
import { getImage } from '../modules/api/image'
import { ListProcessView } from '../component/list-process-view'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic, configNetwork, UISetting, loadUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { history } from '../modules/history'
import { MainListItem } from '../component/list-main-item'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation'
import { getHTMLDom } from '../modules/html-decoder'
import { FixedButton } from '../component/fixed-button'
import { FloatingScrollButton } from '../component/floating-scroll-button'
import { pinkCheckUpdate, pinkDoHotUpdate } from '../modules/hotupdate'


const styles = StyleSheet.create({
    mainList: {
        flex: 1
    },
    headerRightView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    footerMessage: {
        fontSize: 18,
        textAlign: 'center',
        padding: 8
    },
    headerRightPage: {
        borderWidth: 2,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 11,
        marginRight: 13,
        marginTop: 2
    },
    headerRightPageText: {
        fontSize: 20,
        lineHeight: 20,
        marginTop: 2
    }
});




class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerLoading: true,
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
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            headerBackTitle: navigation.getParam('name', '时间线'),
            title:  `${configBase.islandList[configDynamic.islandMode].displayName}(${navigation.getParam('name', '时间线')})`,
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <View style={styles.headerRightView}>
                    <View style={[styles.headerRightPage, {
                            backgroundColor: UISetting.colors.globalColor,
                            borderColor: UISetting.colors.fontColor
                        }]}>
                        <Text style={[styles.headerRightPageText, {color: UISetting.colors.fontColor}]}>{navigation.getParam('page', '1')}</Text>
                    </View>
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={params.menuFunctions} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={UISetting.colors.fontColor} />
                    </TouchableOpacity>
                </View>
            )
        }
    }
    componentWillMount () {
        loadUISetting();
    }
    componentDidMount() {
        this.isUnmount = false;
        this._initHistoryDataBase();
        this.fid = this.props.navigation.getParam('forumID', '-1');
        this.fname = this.props.navigation.getParam('name', '时间线');

        //clearImageCache();
        this._pullDownRefresh(1, true);
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
            menuFunctions: this._menuFunctions
        });
        pinkCheckUpdate();
        getFeedList().then((res)=>{
            console.log(res);
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
            '跳转串号',
            '搜索(未实现)',
            '跳转页码'
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        this._showRule();
                        break;
                    case 1:
                        this._gotoID();
                        break;
                    case 2:
                        break;
                    case 3:
                        this._gotoPage();
                        break;
                }
            });
        });
    }
    /**
     * 跳转到串号
     */
    _gotoID = () => {
        this.inputID = 1;
        this.TopModal.showMessage('输入串号',
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center',color: UISetting.colors.lightFontColor}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                keyboardType={'numeric'}
                onSubmitEditing={()=>this.TopModal.closeModal(()=>{
                    this.props.navigation.navigate('Details', {
                        threadDetail: {
                            id: this.inputID,
                            userid: 'null',
                            content: 'null',
                            now: '2099-12-12 12:12:12'
                        }
                    });
                })}
                onChangeText={(text)=>{this.inputID = text.replace(/[^\d]+/, '');}}/>
        </View>),'确认',
        ()=>this.TopModal.closeModal(()=>{
            this.props.navigation.navigate('Details', {
                threadDetail: {
                    id: this.inputID,
                    userid: 'null',
                    content: 'null',
                    now: '2099-12-12 12:12:12'
                }
            });
        }), '取消');
    }
    /**
     * 跳转到某一页
     */
    _gotoPage = () => {
        this.inputPage = this.state.page.toString();
        this.TopModal.showMessage('输入页码',
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center',color: UISetting.colors.lightFontColor}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                keyboardType={'numeric'}
                onSubmitEditing={()=>this.TopModal.closeModal(()=>this._pullDownRefresh(this.inputPage))}
                onChangeText={(text)=>{this.inputPage = text.replace(/[^\d]+/, '');}}/>
        </View>),'确认',
        ()=>this.TopModal.closeModal(()=>this._pullDownRefresh(this.inputPage)), '取消');
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
                    this.TopModal.showMessage('版规-' + this.fname, (<ScrollView style={{padding: 5}}><Text style={{fontSize: 18}}>{rule}</Text></ScrollView>), '确认');
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
                    URL: configNetwork.baseUrl[configDynamic.islandMode].base + url.href
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
            return (<Text style={[styles.footerMessage, {color: UISetting.colors.lightFontColor}]}>{this.state.footerMessage}</Text>);
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

    _pullDownRefresh = (startPage = 1, force = false) => {
        if ( !force && (this.state.footerLoading != 0 || this.state.headerLoading) ) {
            return;
        }
        this.setState({ headerLoading: true, page: startPage }, () => {
            getThreadList(this.fid, this.state.page).then((res) => {
                if(this.isUnmount)return;
                if (res.status == 'ok') {
                    this.loadingImages = [];
                    this.setState({
                        threadList: res.res,
                        page: startPage + 1,
                        headerLoading: false,
                        loadEnd: false,
                    });
                    this.props.navigation.setParams({
                        page: startPage
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
                <FloatingScrollButton
                    ref={(ref)=>{this.ScrollButton = ref}}
                    onUpPress={()=>{this.postList.scrollToOffset(0)}}
                    onDownPress={()=>{this.postList.scrollToEnd()}}/>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
                <FlatList
                    ref = {(ref)=>{this.postList=ref}}
                    data={this.state.threadList}
                    extraData={this.state}
                    style={[styles.mainList, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}
                    onRefresh={this._pullDownRefresh}
                    refreshing={this.state.headerLoading}
                    keyExtractor={(item, index) => {return item.id.toString() + '-' + index.toString()}}
                    renderItem={this._renderItem}
                    ListFooterComponent={this._footerComponent}
                    onEndReachedThreshold={0.1}
                    onEndReached={this._pullUpLoading}
                    pageSize={20}
                    removeClippedSubviews={true}
                    onScroll={()=>{
                        if(UISetting.showFastScrollButton) {
                            this.ScrollButton.show(1500);
                        }
                    }}
                    /*viewabilityConfig={this.viewabilityConfig}*/
                />
                <FixedButton visible={this.props.navigation.getParam('forumID', -1) != -1} icon={'note'} onPress={this._newThread}/>
            </SafeAreaView>
        );
    }
}

export { HomeScreen };