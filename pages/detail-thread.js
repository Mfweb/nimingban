import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, Clipboard, TextInput } from 'react-native'
import { getReplyList, getDetail } from '../modules/api/ano/thread'
import { addFeed, isSubscribed, delFeed } from '../modules/api/ano/feed'
import { getImage } from '../modules/api/image'
import { ListProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import  { Toast } from '../component/toast'
import { DetailListItem } from '../component/list-detail-item'
import { ActionSheet } from '../component/action-sheet'
import { configNetwork, configDynamic, UISetting } from '../modules/config'
import { Header } from 'react-navigation'
import { FixedButton } from '../component/fixed-button'
import { FloatingScrollButton } from '../component/floating-scroll-button'

const styles = StyleSheet.create({
    mainList: {
        flex: 1
    },
    ItemSeparator: {
        height: 1
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
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitleText: {
        fontSize: 18
    }
});


class DetailsScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerLoading: true,
            footerLoading: 1,
            replyList: Array(),
            page: 1,
            loadEnd: false,
            footerMessage: '',
            isFeed: false
        };
    }
    poID = '';
    isUnMount = false;
    localReplyCount = 0;
    threadDetail = null;
    quoteIds = '';
    static navigationOptions = ({navigation}) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            headerTitle: (
                <View style={styles.headerTitle}>
                    <Text style={[styles.headerTitleText, {color: UISetting.colors.fontColor}]}>
                        {configNetwork.baseUrl[configDynamic.islandMode].base}
                    </Text>
                    <Text style={[styles.headerTitleText, {color: UISetting.colors.fontColor}]}>
                        No.{navigation.getParam('threadDetail', null).id}
                    </Text>
                </View>),
            headerRight: (
                <View style={styles.headerRightView}>
                    <View style={[
                        styles.headerRightPage, {
                            backgroundColor: UISetting.colors.globalColor,
                            borderColor: UISetting.colors.fontColor
                            }]}>
                        <Text style={[styles.headerRightPageText, {color: UISetting.colors.fontColor}]}>{navigation.getParam('page', '1')}</Text>
                    </View>
                    <TouchableOpacity onPress={params.menuFunctions} style={{ marginRight: 8, marginTop: 2 }} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={UISetting.colors.fontColor} />
                    </TouchableOpacity>
                </View>
            )
        };
    };

    componentDidMount() {
        this.quoteIds = '';
        this.threadDetail = this.props.navigation.getParam('threadDetail', null);
        this.poID = this.threadDetail.userid;
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
            menuFunctions: this._menuFunctions
        });
        this.isUnMount = false;
        this.localReplyCount = 0;
        this.setState({
            replyList: [this.threadDetail]
        }, ()=>{
            this._pullDownRefresh(1, true);
        });
        isSubscribed(this.threadDetail.id).then((res)=>{
            this.setState({
                isFeed: res
            });
        });
    }
    componentWillUnmount() {
        this.isUnMount = true;
    }

    /**
     * 右上角回复
     */
    _replyThread = () => {
        this.props.navigation.push('NewPostScreen', {
            threadDetail: this.state.replyList[0],
            mode: 1,
            replyId: this.threadDetail.id,
            content: this.quoteIds
        });
    }

    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( item.img && (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
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
                if(this.isUnMount) {
                    return;
                }
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ threadList: tempList });
            });
        }
        return (
            <DetailListItem
            itemDetail={item}
            navigation={this.props.navigation}
            Toast={this.toast}
            po={this.poID}
            longPressItem={this._actionItem}/>
        )
    }
    /**
     * 右上角菜单
     */
    _menuFunctions = ()=>{
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, `>>No.${this.threadDetail.id}`,
        [
            '举报',
            '跳转',
            this.state.isFeed?'取消收藏':'收藏',
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        this.props.navigation.push('NewPostScreen', {
                            mode: 3,
                            fname: '值班室',
                            fid: 18,
                            repId: this.threadDetail.id,
                            content: `${this.quoteIds}>>No.${this.threadDetail.id}\r\n理由：`
                        });
                        break;
                    case 1:
                        this._gotoPage();
                        break;
                    case 2:
                        if(this.state.isFeed) {
                            delFeed(this.threadDetail.id).then((res) => {
                                if(res.status === 'ok') {
                                    this.toast.show('取消成功(ノﾟ∀ﾟ)ノ');
                                    this.setState({
                                        isFeed: false
                                    });
                                }
                                else {
                                    this.toast.show('取消失败( ﾟ∀。)');
                                }
                            });
                        }
                        else {
                            addFeed(this.threadDetail.id).then((res) => {
                                if(res.status === 'ok') {
                                    this.toast.show('订阅成功(ノﾟ∀ﾟ)ノ');
                                    this.setState({
                                        isFeed: true
                                    });
                                }
                                else {
                                    this.toast.show('订阅失败( ﾟ∀。)');
                                }
                            });
                        }
                        break;
                }
            });
        });
    }

    /**
     * 跳转到某一页
     */
    _gotoPage = () => {
        this.inputPage = this.state.page.toString();
        let replyCount = this.state.replyList[0].replyCount ? this.state.replyList[0].replyCount: 0;
        this.TopModal.showMessage(`输入页码 1~${Math.ceil(replyCount / 19)}`,
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center', color: UISetting.colors.lightFontColor}}
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
     * 长按回复操作
     */
    _actionItem = (target, id, closeMark) => {
        let { pageX, pageY } = target.nativeEvent;
        this.ActionSheet.showActionSheet(pageX, pageY, `操作>>No.${id}`,
        ['回复', '添加到引用缓存', '复制串号', '复制内容', '举报', '屏蔽饼干(未实现)', '屏蔽串号(未实现)'], (index)=>{
            this.ActionSheet.closeActionSheet();
            closeMark();
            switch (index) {
                case 0:
                    this.props.navigation.push('NewPostScreen', {
                        threadDetail: this.state.replyList[0],
                        mode: 1,
                        replyId: this.threadDetail.id,
                        content: `${this.quoteIds}>>No.${id}\r\n`
                    });
                    break;
                case 1:
                    this.quoteIds += `>>No.${id}\r\n`;
                    this.toast.show('添加完成');
                    break;
                case 2:
                    Clipboard.setString(id.toString());
                    this.toast.show('复制完成');
                    break;
                case 3:
                    Clipboard.setString(this.threadDetail.content);
                    this.toast.show('复制完成');
                    break;
                case 4:
                    this.props.navigation.push('NewPostScreen', {
                        mode: 3,
                        fname: '值班室',
                        fid: 18,
                        repId: id,
                        content: `${this.quoteIds}>>No.${id}\r\n理由：`
                    });
                    break;
            }
        }, ()=>{}, ()=> {
            this.ActionSheet.closeActionSheet();
            closeMark();
        });
    }
    _itemSeparator = () =>(
        <View style={[styles.ItemSeparator, {backgroundColor: UISetting.colors.lightColor}]}></View>
    )

    _footerComponent = () => {
        if(this.state.footerLoading == 0) {
            return (
                <TouchableOpacity onPress={()=>{ this.setState({loadEnd: false}, this._pullUpLoading); }}>
                    <Text style={[styles.footerMessage, {color: UISetting.colors.lightFontColor}]}>{this.state.footerMessage}</Text>
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
                            tempList = tempList.concat(res.res.replys);
                        }
                        this.setState({
                            replyList: tempList,
                            page: nextPage,
                            footerLoading: 0,
                            loadEnd: cpCount > 0 ? false : true,
                            footerMessage: cpCount > 0 ? `上拉继续加载 ${tempList.length-1}/${res.res.replyCount}` : `加载完成,点击再次加载 ${tempList.length-1}/${res.res.replyCount}`
                        });
                        this.props.navigation.setParams({
                            page: nextPage > 1 ? (nextPage - 1) : 1
                        });
                        if(pageLength >= 19) {
                            this.localReplyCount = 0;
                        }
                        else {
                            this.localReplyCount = pageLength;
                        }
                    }
                }
                else {
                    this.TopModal.showMessage('错误', `请求数据失败:${res.errmsg}`,'确认');
                    this.setState({
                        footerLoading: 0,
                    });
                }
            }).catch((res)=>{
                if(this.isUnMount) {
                    return;
                }
                this.TopModal.showMessage('错误', `请求数据失败:${res}`,'确认');
                this.setState({
                    footerLoading: 0,
                });
                console.log(res);
            });
        });
    }

    _pullDownRefresh = async (startPage = 1, force = false) => {
        if ( !force && (this.state.footerLoading != 0 || this.state.headerLoading) ) {
            return;
        }
        this.setState({ headerLoading: true, page: startPage }, async () => {
            let isReply = false;
            let res = await getReplyList(this.threadDetail.id, this.state.page);
            if(res.status !== 'ok' && res.errmsg === '该主题不存在') {
                res = await getDetail(this.threadDetail.id);
                isReply = true;
            }
            if(this.isUnMount) {
                return;
            }
            if (res.status === 'ok') {
                if(startPage === 1) {
                    this.props.navigation.setParams({
                        threadDetail: res.res
                    });
                    this.threadDetail = res.res;
                    this.poID = this.threadDetail.userid;
                }
                if(!isReply) {
                    this.localReplyCount = res.res.replys.length >= 19? 0: res.res.replys.length;
                    if(res.res.replys.length > 0 && res.res.replys[0].id==9999999 && this.localReplyCount > 0) {
                        this.localReplyCount --;
                    }
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
                    replyCount: res.res.replyCount
                });
                if(!isReply) {
                    tempList = tempList.concat(res.res.replys);
                }

                if(isReply) {
                    this.setState({
                        replyList: tempList,
                        page: startPage,
                        headerLoading: false,
                        footerLoading: 0,
                        loadEnd: true,
                        footerMessage: '此id为回应串，不能继续加载'
                    });
                }
                else {
                    this.setState({
                        replyList: tempList,
                        page: res.res.replys.length >= 19 ? (startPage + 1) : startPage,
                        headerLoading: false,
                        footerLoading: 0,
                        loadEnd: res.res.replys.length >= 19 ? false : true,
                        footerMessage: res.res.replys.length >= 19 ?
                        `上拉继续加载 ${res.res.replys.length}/${res.res.replyCount}`
                        :
                        `加载完成,点击再次加载 ${res.res.replys.length}/${res.res.replyCount}`
                    });
                    this.props.navigation.setParams({
                        page: startPage
                    });
                }
            }
            else {
                this.TopModal.showMessage('错误', `请求数据失败:${res.errmsg}`,'确认');
                this.setState({
                    headerLoading: false,
                    loadEnd: true,
                    footerLoading: 0
                });
            }
        });
    }

    render() {
        return (
            <SafeAreaView style={{flex:1, backgroundColor: UISetting.colors.defaultBackgroundColor}}>
                <FloatingScrollButton
                    ref={(ref)=>{this.ScrollButton = ref}}
                    onUpPress={()=>{this.replyFList.scrollToOffset(0)}}
                    onDownPress={()=>{this.replyFList.scrollToEnd()}}/>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
                <FlatList
                    ref = {(ref)=>{this.replyFList=ref}}
                    data={this.state.replyList}
                    extraData={this.state}
                    style={[styles.mainList, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}
                    onRefresh={this._pullDownRefresh}
                    refreshing={this.state.headerLoading}
                    keyExtractor={(item, index) => {return item.id.toString() + '-' + index.toString()}}
                    renderItem={this._renderItem}
                    onScroll={()=>{
                        if(UISetting.showFastScrollButton) {
                            this.ScrollButton.show(1500);
                        }
                    }}
                    ListFooterComponent={this._footerComponent}
                    ItemSeparatorComponent={this._itemSeparator}
                    onEndReachedThreshold={0.1}
                    onEndReached={this._pullUpLoading}
                    pageSize={20}
                    removeClippedSubviews={true}
                />
                <FixedButton visible={true} icon={'note'} onPress={this._replyThread}/>
            </SafeAreaView>
        );
    }
}

export { DetailsScreen }