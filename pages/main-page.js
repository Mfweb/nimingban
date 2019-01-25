import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { getThreadList, getImage, clearImageCache } from '../modules/network'
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
    mainListReplayCountIcon: {
        width: 24,
        height: 24,
        marginRight: 3
    },
    mainListReplayCountText: {
        color: '#696969',
        fontSize: 18
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
    leftMenuIcon: {
        width: 32,
        height: 32
    },
    icon: {
        width: 24,
        height: 24,
    },
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
        this.props.navigation.push('Details', {
            threadDetail: this.props.itemDetail
        })
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
        //let replayCountText = itemDetail.remainReplys ? (itemDetail.remainReplys.toString() + "(" + itemDetail.replyCount + ")") : itemDetail.replyCount;
        let replayCountText = itemDetail.replyCount;
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


                    <View style={styles.mainListItemBottom}>
                        <Image style={styles.mainListReplayCountIcon} source={require('../imgs/replay-count.png')}></Image>
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
            page: 1
        };
        /*this.viewabilityConfig = {
            minimumViewTime: 100,
            viewAreaCoveragePercentThreshold: 10,
            waitForInteraction: true,
        }*/
    }
    fid = 4;
    fname = '综合板1';


    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: 'A岛(' + navigation.getParam('name', '综合板1') + ')',
            headerLeft: (
                <TouchableHighlight style={{ marginLeft: 5 }} onPress={params.openLDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Image
                        style={styles.leftMenuIcon}
                        source={require('../imgs/menu.png')}
                    />
                </TouchableHighlight>
            )
        }
    }

    componentDidMount() {
        this.fid = this.props.navigation.getParam('forumID', '4');
        this.fname = this.props.navigation.getParam('name', '综合板1');

        //clearImageCache();
        this._pullDownRefresh();
        this.props.navigation.setParams({ openLDrawer: this.props.navigation.openDrawer })
    }

    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            //console.log(imgName);
            getImage('thumb', imgName).then((res) => {
                if(res.status == 'ok') {
                    let tempList = this.state.threadList.slice();
                    tempList[index].localImage = 'file://' + res.path;
                    this.setState({ threadList: tempList });
                }
            }).catch(function() {
            });
        }
        return (
        <MainListItem itemDetail={item} navigation={this.props.navigation} />)
    }

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
    /*_onViewableItemsChanged = ({changed}) => {
        console.log(changed);
    }*/
    render() {
        return (
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
                /*viewabilityConfig={this.viewabilityConfig}*/
            />
        );
    }

    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
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
                        footerLoading: 0
                    });
                }
                else {
                    this.setState({ footerLoading: 0 });
                    alert('请求数据失败:' + res.errmsg);
                }
            }).catch(()=>{
                this.setState({ footerLoading: 0 });
                alert('请求数据失败');
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
                        headerLoading: false
                    });
                }
                else {
                    alert('请求数据失败:' + res.errmsg);
                }
                this.setState({ headerLoading: false });
            }).catch((error)=>{
                console.log(error)
                this.setState({ headerLoading: false });
                alert('请求数据失败');
            });
        });
    }
}

export { HomeScreen };