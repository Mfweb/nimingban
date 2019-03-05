import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl } from 'react-native'
import { getReplyList, getImage } from '../modules/apis'
import { ListProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import  { Toast } from '../component/toast'
import { DetailListItem } from '../component/list-detail-item'

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
    },
    footerMessage: {
        color: '#696969',
        fontSize: 18,
        textAlign: 'center',
        padding: 8
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
        this.poID = this.threadDetail.userid;
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
            threadDetail: this.state.replyList[0],
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
                if(this.isUnMount) {
                    return;
                }
                let tempList = this.state.threadList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ threadList: tempList });
            });
        }
        return (
        <DetailListItem itemDetail={item} navigation={this.props.navigation} Toast={this.toast} po={this.poID} />)
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

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true, page: 1 }, async () => {
            let res = await getReplyList(this.threadDetail.id, this.state.page);
            if(this.isUnMount) {
                return;
            }
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
            <View style={{flex:1}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
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
            </View>
        );
    }
}

export { DetailsScreen }