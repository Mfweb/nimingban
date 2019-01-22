import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList, getImageCDN, getImage } from '../modules/network'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView } from '../component/list-process-view'

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


class MainListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            imageSource: require('../imgs/loading.png'),
            imageMode: 'center'//contain
        }
    }
    _onPress = () => {
        this.props.navigation.push('Details', {
            tid: this.props.itemDetail.id,
            title: this.props.itemDetail.title,
        })
    }
    _oPressImage = () => {
        this.props.navigation.push('ImageViewer', {
            imgName: this.props.itemDetail.img + this.props.itemDetail.ext
        })
    }
    componentDidMount() {
        if(this.props.itemDetail.img) {
            getImage('thumb', this.props.itemDetail.img + this.props.itemDetail.ext).then((res) => {
                if(res.status == 'ok') {
                    this.setState({
                        imageMode: 'contain',
                        imageSource: {uri: 'file://' + res.path}
                    });
                }
            });
        }
    }

    render() {
        //console.log(this.props.itemDetail);
        let { itemDetail } = this.props;
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
                    <TouchableOpacity style={itemDetail.img?styles.mainListItemImageTouch:styles.displayNone} onPress={this._oPressImage}>
                        <Image style={styles.mainListItemImage}
                        source={ this.state.imageSource } 
                        resizeMode = {this.state.imageMode}
                        />
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
            headerLoading: true,
            footerLoading: 0,
            threadList: Array(),
            page: 1
        };
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: 'A岛-黎明版',
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
        if (this.state.threadList.length == 0) {
            page = 1;
            this.setState({
                headerLoading: true
            });
            getForumList(4, page).then((res) => {
                if (res.status == 'ok') {
                    this.setState({
                        threadList: res.res,
                        page: 1,
                        headerLoading: false
                    });
                }
                else {
                    alert('请求数据失败:' + res.errmsg);
                }
                this.setState({ headerLoading: false });
            });
        }
        this.props.navigation.setParams({ openLDrawer: this.props.navigation.openDrawer })
    }

    _renderItem = ({ item }) => (
        <MainListItem itemDetail={item} navigation={this.props.navigation} />
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
                data={this.state.threadList}
                extraData={this.state}
                style={styles.mainList}
                onRefresh={this._pullDownRefresh}
                refreshing={this.state.headerLoading}
                keyExtractor={(item, index) => {return item.toString() + '-' + index.toString()}}
                renderItem={this._renderItem}
                ListFooterComponent={this._footerComponent}
                onEndReachedThreshold={0.1}
                onEndReached={this._pullUpLoading}
            />
        );
    }

    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ footerLoading: 1 }, async function() {
            page++;
            getForumList(4, page).then((res) => {
                if (res.status == 'ok') {
                    var tempList = this.state.threadList.slice()
                    tempList = tempList.concat(res.res);
                    this.setState({
                        threadList: tempList,
                        page: 1,
                        footerLoading: 0
                    });
                }
                else {
                    this.setState({ footerLoading: 0 });
                    alert('请求数据失败:' + res.errmsg);
                }
            });
        });
    }

    _pullDownRefresh = async () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true }, function() {
            page = 1;
            getForumList(4, page).then((res) => {
                if (res.status == 'ok') {
                    this.setState({
                        threadList: res.res,
                        page: 1,
                        headerLoading: false
                    });
                }
                else {
                    alert('请求数据失败:' + res.errmsg);
                }
                this.setState({ headerLoading: false });
            });
        });
    }
}

export { HomeScreen };