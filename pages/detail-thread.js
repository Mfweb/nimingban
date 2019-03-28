import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl, SafeAreaView, Clipboard, TextInput } from 'react-native'
import { getReplyList, getImage, getDetail } from '../modules/apis'
import { ListProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import  { Toast } from '../component/toast'
import { DetailListItem } from '../component/list-detail-item'
import { history } from '../modules/history'
import { ActionSheet } from '../component/action-sheet'
import { configNetwork, configDynamic } from '../modules/config'
import { Header } from 'react-navigation'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    mainList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
    },
    ItemSeparator: {
        height: 1,
        backgroundColor: '#FFB6C1'
    },
    headerRightView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    footerMessage: {
        color: '#696969',
        fontSize: 18,
        textAlign: 'center',
        padding: 8
    },
    headerRightPage: {
        backgroundColor: globalColor,
        borderColor: '#FFF',
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
        color: '#FFF',
        fontSize: 20,
    },
    headerTitle: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
    },
    headerTitleText: {
        color: '#FFF',
        fontSize: 20
    }
});


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
    poID = '';
    isUnMount = false;
    localReplyCount = 0;
    threadDetail = null;
    quoteIds = '';
    static navigationOptions = ({navigation}) => {
        const { params = {} } = navigation.state;
        return {
            headerTitle: navigation.getParam('threadDetail', null).title,
            headerTitle: (
                <View style={styles.headerTitle}>
                    <Text style={styles.headerTitleText}>
                        {configNetwork.baseUrl[configDynamic.islandMode].base}
                    </Text>
                    <Text style={styles.headerTitleText}>
                        No.{navigation.getParam('threadDetail', null).id}
                    </Text>
                </View>),
            headerRight: (
                <View style={styles.headerRightView}>
                    <View style={styles.headerRightPage}>
                        <Text style={styles.headerRightPageText}>{navigation.getParam('page', '1')}</Text>
                    </View>
                    <TouchableOpacity onPress={params.replyThread} style={{ marginRight: 8, marginTop: 2 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'note'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={params.menuFunctions} style={{ marginRight: 8, marginTop: 2, marginLeft: 5 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            )
        };
    };
    componentWillMount() {
        
    }
    componentDidMount() {
        this.quoteIds = '';
        this.threadDetail = this.props.navigation.getParam('threadDetail', null);
        this.poID = this.threadDetail.userid;
        this.props.navigation.setParams({ 
            openLDrawer: this.props.navigation.openDrawer,
            replyThread: this._replyThread,
            menuFunctions: this._menuFunctions
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
            '收藏',
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
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
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
                        history.addNewHistory('cache', {replyTo: res.res.id ,datas: res.res.replys});
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
                            page: nextPage - 1
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

    _pullDownRefresh = async (startPage = 1) => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
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
                this.props.navigation.setParams({
                    threadDetail: res.res
                });
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
                    history.addNewHistory('cache', {replyTo: 0, datas: [tempList[0]]});
                    history.addNewHistory('cache', {replyTo: res.res.id, datas: res.res.replys});
                }

                if(isReply) {
                    this.setState({
                        replyList: tempList,
                        page: startPage,
                        headerLoading: false,
                        loadEnd: true,
                        footerMessage: '此id为回应串，不能继续加载'
                    });
                }
                else {
                    this.setState({
                        replyList: tempList,
                        page: res.res.replys.length >= 19 ? (startPage + 1) : startPage,
                        headerLoading: false,
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
                    loadEnd: true
                });
            }
        });
    }
    
    render() {
        return (
            <SafeAreaView style={{flex:1, backgroundColor: '#DCDCDC'}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
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
                    pageSize={20}
                    removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.headerLoading}
                            onRefresh={this._pullDownRefresh}
                            title="正在加载..."/>
                    }
                />
            </SafeAreaView>
        );
    }
}

export { DetailsScreen }