import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { getReplyList, getImage, clearImageCache } from '../modules/network'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView,ImageProcessView } from '../component/list-process-view'
const globalColor = '#f45a8d';

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
    },
    mainListItemImage: {
        height: Dimensions.get('window').width / 2.5,
        width: Dimensions.get('window').width / 2.5,
        left: 0,
    },
    ItemSeparator: {
        height: 1,
        backgroundColor: '#FFB6C1'
    }
});


class MainListImage extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let { itemDetail } = this.props;
        let imageSource = itemDetail.localImage?{uri:itemDetail.localImage}:require('../imgs/loading.png');
        if(itemDetail.localImage) {
            return (
                <Image style={itemDetail.img?styles.mainListItemImage:styles.displayNone}
                source={ imageSource } 
                resizeMode='contain'
                />
            );
        }
        else {
            return (<ImageProcessView />);
        }
    }
}

class MainListItem extends React.Component {
    constructor(props) {
        super(props);
    }
    _onPress = () => {

    }
    _onPressImage = () => {
        this.props.navigation.push('ImageViewer', {
            imgName: this.props.itemDetail.img + this.props.itemDetail.ext
        })
    }

    componentDidMount() {
    }
    componentWillUnmount() {
    }
    render() {
        //console.log(this.props.itemDetail);
        let { itemDetail } = this.props;

        //let imgMode = itemDetail.localImage?'contain':'center';
        let imageSource = itemDetail.localImage?{uri:itemDetail.localImage}:require('../imgs/loading.png');
        
        let userID = getHTMLDom(itemDetail.userid);
        let threadContent = getHTMLDom(itemDetail.content);
        let replayCountText = itemDetail.remainReplys ? (itemDetail.remainReplys.toString() + "(" + itemDetail.replyCount + ")") : itemDetail.replyCount;
        return (
            <TouchableOpacity onPress={this._onPress}>
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
                                {itemDetail.now}
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
                        {threadContent}
                    </Text>
                    <TouchableOpacity style={itemDetail.img?styles.mainListItemImageTouch:styles.displayNone} onPress={this._onPressImage}>
                        <MainListImage itemDetail={itemDetail} />
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
            page: 1
        };
    }

    isUnMount = false;
    localReplyCount = 0;
    threadDetail = null;

    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam('threadDetail', null).title
        };
    };

    componentDidMount() {
        this.threadDetail = this.props.navigation.getParam('threadDetail', null);
        this._pullDownRefresh();
        this.props.navigation.setParams({ openLDrawer: this.props.navigation.openDrawer });
        this.isUnMount = false;
        this.localReplyCount = 0;
        this.setState({
            replyList: [this.threadDetail]
        });
    }
    componentWillUnmount() {
        this.isUnMount = true;
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
                if(res.status == 'ok') {
                    let tempList = this.state.replyList.slice();
                    tempList[index].localImage = 'file://' + res.path;
                    this.setState({ replyList: tempList });
                }
            }).catch(function() {
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
            return (<View style={{height: 8}}></View>);
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
            <FlatList
                data={this.state.replyList}
                extraData={this.state}
                style={styles.mainList}
                onRefresh={this._pullDownRefresh}
                refreshing={this.state.headerLoading}
                keyExtractor={(item, index) => {return item.id.toString() + '-' + index.toString()}}
                renderItem={this._renderItem}
                onScroll={this._onScroll}
                ListFooterComponent={this._footerComponent}
                ItemSeparatorComponent={this._itemSeparator}
                onEndReachedThreshold={0.1}
                onEndReached={this._pullUpLoading}
                onViewableItemsChanged={this._onViewableItemsChanged}
            />
        );
    }
    isScroll = false;
    _onScroll = (re) => {
        this.isScroll = true;
        //console.log(re);
        //console.log('is scroll');
    }
    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading || !this.isScroll ) {
            return;
        }
        console.log('getting:' + this.state.page);
        this.isScroll = false;
        this.setState({ footerLoading: 1 }, async function() {
            getReplyList(this.threadDetail.id, this.state.page).then((res) => {
                if(this.isUnMount) {
                    return;
                }
                if (res.status == 'ok') {
                    if( ((res.res.replys.length == 1) && (res.res.replys[0].id == 9999999))
                        || (res.res.replys.length == 0) ) {
                        this.setState({
                            footerLoading: 0
                        });
                    }
                    else {
                        if( res.res.replys[0].id == 9999999 ) {
                            res.res.replys.splice(0, 1);
                        }
                        let cpCount = (this.localReplyCount > 0) ? (res.res.replys.length - this.localReplyCount) : res.res.replys.length;
                        if(cpCount > 0) {
                            var nextPage = this.state.page + 1;
                            var tempList = this.state.replyList.slice()
                            res.res.replys.splice(0, this.localReplyCount);
                            //console.log(res.res.replys);
                            tempList = tempList.concat(res.res.replys);
                        }
                        this.setState({
                            replyList: tempList,
                            page: nextPage,
                            footerLoading: 0
                        }, ()=>{console.log('replay count:' + this.state.replyList.length.toString());});
                        if(res.res.replys.length >= 19) {
                            this.localReplyCount = 0;
                        }
                        else {
                            this.localReplyCount = (res.res.replys[0].id == 9999999) ? (res.res.replys.length - 1) : (res.res.replys.length + 1);
                        }
                    }
                }
                else {
                    this.setState({ footerLoading: 0 });
                    alert('请求数据失败:' + res.errmsg);
                }
            }).catch((res)=>{
                this.setState({ footerLoading: 0 });
                console.log(res);
                alert('请求数据失败');
            });
        });
    }

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true, page: 1 }, function() {
            getReplyList(this.threadDetail.id, this.state.page).then((res) => {
                if (res.status == 'ok') {
                    this.localReplyCount = 0;
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
                        page: 2,
                        headerLoading: false
                    });
                }
                else {
                    this.setState({
                        replyList: [this.threadDetail, { id: '', img: '', ext: '', now: '', userid: '', name: '',email: '', title: '',
                                content: '请求数据失败:' + res.errmsg + ',下拉刷新。', sage: '0', admin: '0',
                        }]
                    });
                }
                this.setState({ headerLoading: false });
            }).catch(function(){
                this.setState({
                    headerLoading: false,
                    replyList: [this.threadDetail, { id: '', img: '', ext: '', now: '', userid: '', name: '',email: '', title: '',
                            content: '请求数据失败,下拉刷新。', sage: '0', admin: '0',
                    }]
                });
            });
        });
    }
}

export { DetailsScreen }