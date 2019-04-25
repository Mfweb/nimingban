import React from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, SectionList, Dimensions, TouchableOpacity, Animated, Linking } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { getForumList, getForumNameByID } from '../modules/api/ano/forum'
import { getHTMLDom } from '../modules/html-decoder'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { Header } from 'react-navigation';
import { configBase, configDynamic, UISetting } from '../modules/config'

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    wlp: {
        height: (Dimensions.get('window').width * 0.7),
        width: (Dimensions.get('window').width * 0.7)
    },
    groupView: {
        paddingLeft: 5,
        marginBottom: 5,
        paddingTop: 8,
        paddingBottom: 8,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5
    },
    groupText: {
        fontSize: 20,
    },
    itemView: {
        marginLeft: 10,
        paddingTop: 5,
        paddingBottom: 5
    },
    itemText: {
        fontSize: 20
    },
    bottomTools: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5
    },
    bottomToolsItem: {

    },
    titleView: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleIsland: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 5
    },
    titleImage: {
        width: 30,
        height: 30,
        marginRight: 10
    },
    titleText: {
        fontSize: 24
    },
    islandSelectModal: {
        position: 'absolute',
        zIndex: 9999,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,

        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 5,
        paddingRight: 5
    },
    closeMask: {
        backgroundColor: '#00000050',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        flex: 1,
        zIndex: 9998
    }
});


/**
 * props:
 * show
 * onSelected
 * onClosed
 */
class IsLandSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            islandList: [],
            nowOpacity: new Animated.Value(0),
            nowScale: new Animated.Value(0.1),
            show: false
        }
    }
    componentDidMount() {
        let tempIsland = [];
        for (let key in configBase.islandList) {
            tempIsland.push(
                <TouchableOpacity
                    style={styles.titleIsland}
                    onPress={() => this.props.onSelected(key)}
                    key={key}>
                    <Image source={configBase.islandList[key].logo} style={styles.titleImage} resizeMode={'contain'}></Image>
                    <Text style={[styles.titleText, { color: UISetting.colors.fontColor }]}>
                        {configBase.islandList[key].displayName}匿名版
                    </Text>
                </TouchableOpacity>
            );
        }
        this.setState({
            islandList: tempIsland
        });
    }
    componentWillReceiveProps(newProps) {
        if (newProps.show != this.state.show) {
            if (newProps.show === true) {
                this.setState({
                    show: true
                }, () => {
                    this.startAnime('in');
                });
            }
            else if (newProps.show === false) {
                this.startAnime('out', () => {
                    this.setState({
                        show: false,
                    });
                });
            }
        }
    }
    startAnime = function (mode, finish = () => { }) {
        if (this.isUnMount) {
            return;
        }
        this.state.nowOpacity.setValue(mode === 'in' ? 0 : 1);
        this.state.nowScale.setValue(mode === 'in' ? 0.1 : 1.0);
        Animated.parallel([
            Animated.timing(
                this.state.nowOpacity,
                {
                    toValue: mode === 'in' ? 1 : 0,
                    duration: 200,
                    useNativeDriver: true,
                    stiffness: 50
                }
            ),
            Animated.timing(
                this.state.nowScale,
                {
                    toValue: mode === 'in' ? 1.0 : 0.1,
                    duration: 200,
                    useNativeDriver: true,
                    friction: 2
                }
            )
        ]).start(finish);
    }
    render() {
        return (
            <Animated.View style={[this.state.show ? styles.closeMask : styles.displayNone, {
                opacity: this.state.nowOpacity,
            }]}>
                <TouchableOpacity activeOpacity={1} style={{ flex: 1 }} onPress={this.props.onClosed}>
                    <Animated.View style={
                        [this.state.show ? styles.islandSelectModal : styles.displayNone,
                        {
                            backgroundColor: UISetting.colors.globalColor,
                            shadowColor: UISetting.colors.lightFontColor,
                            top: this.props.top,
                            left: this.props.left,
                            transform: [
                                {
                                    scale: this.state.nowScale
                                }
                            ]
                        }]}>
                        {this.state.islandList}
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>
        )
    }
}

class LeftDrawerNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            forumList: [],
            headerLoading: false,
            showAllIsland: false,
            islandModalX: 0,
            islandModalY: 0
        };
    }

    componentDidMount() {
        this.getForumData(false);
        Linking.addEventListener('url', this.handleOpenURL);
        if (!configDynamic.initUrlLoaded) {
            Linking.getInitialURL().then((url) => this.handleOpenURL({ url: url }));
            configDynamic.initUrlLoaded = true;
        }
    }
    componentWillUnmount() {
        Linking.removeEventListener('url', this.handleOpenURL);
    }
    handleOpenURL = (event) => {
        if (!event.url || !/^((tnmb)|(adnmb))+:\/\/(f|t){1}\/\d+$/.test(event.url)) {
            return;
        }
        const islandFullNameList = {
            tnmb: 'bt',
            adnmb: 'lw'
        };
        let urlParams = event.url.split('://');
        let viewPrograms = urlParams[1].split('/');
        let islandMode = urlParams[0];
        let viewMode = viewPrograms[0];
        let viewID = viewPrograms[1];
        if (islandFullNameList[islandMode] !== configDynamic.islandMode) {
            configDynamic.islandMode = islandFullNameList[islandMode];
            this._pullDownRefresh(false);
        }
        //this.props.navigation.popToTop();
        if (viewMode === 'f') {
            getForumNameByID(viewID).then((res) => {
                this._gotoFroum(viewID, res);
                this.props.navigation.closeDrawer();
            });
        }
        else if (viewMode === 't') {
            this._gotoFroum(-1, '时间线');
            this.props.navigation._childrenNavigation.Home.navigate('Details', {
                threadDetail: {
                    id: viewID,
                    userid: 'null',
                    content: 'null',
                    now: '2099-12-12 12:12:12'
                }
            }, 0);
            this.props.navigation.closeDrawer();
        }
    }
    /**
     * 复位路由并跳转到板块
     */
    _gotoFroum = (id, name) => {
        this.props.navigation._childrenNavigation.Home.reset([
            NavigationActions.navigate({
                routeName: 'Home',
                params: {
                    forumID: id,
                    name: name
                }
            })
        ], 0);
    }
    /**
     * 复位路由并跳转到用户系统
     */
    _gotoMember = () => {
        this.props.navigation._childrenNavigation.UserMember.reset([
            NavigationActions.navigate({
                routeName: configDynamic.islandMode == 'lw' ? 'UserMemberLogin' : 'UserCookieManager'
            })
        ], 0);
    }
    _goSetting = () => {
        this.props.navigation._childrenNavigation.UserMember.reset([
            NavigationActions.navigate({
                routeName: 'UserSetting'
            })
        ], 0);
    }
    _gotoHistory = () => {
        this.props.navigation._childrenNavigation.Home.reset([
            NavigationActions.navigate({
                routeName: 'HistoryManager'
            })
        ], 0);
    }
    _gotoFeed = () => {
        this.props.navigation._childrenNavigation.Home.reset([
            NavigationActions.navigate({
                routeName: 'FeedScreen',
            })
        ], 0);
    }
    /**
     * 板块分组
     */
    _renderSectionHeader = ({ section }) => {
        return (
            <View style={[styles.groupView, {
                backgroundColor: UISetting.colors.defaultBackgroundColor,
                shadowColor: UISetting.colors.lightFontColor
            }]}>
                <Text style={[styles.groupText, {
                    color: UISetting.colors.globalColor
                }]}>
                    {section.groupName}
                </Text>
            </View>
        );
    }
    /**
     * 切换板块
     */
    _onPressItem = (item) => {
        this._gotoFroum(item.id, item.name);
        this.props.navigation.closeDrawer();
    }

    /**
     * 板块item
     */
    _renderItem = ({ item }) => {
        return (
            <TouchableOpacity onPress={() => this._onPressItem(item)}>
                <View style={styles.itemView}>
                    <Text style={[styles.itemText, {color: UISetting.colors.threadFontColor}]}>
                        {item.displayName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * 下拉刷新板块列表
     */
    _pullDownRefresh = (force, finish = () => { }) => {
        this.setState({
            headerLoading: true
        }, async () => {
            await this.getForumData(force, () => {
                this.setState({
                    headerLoading: false
                }, finish);
            });
        });
    }
    getForumData = async (force, finish = () => { }) => {
        let res = await getForumList(force);
        if (res.status == 'ok') {
            let tempList = Array();
            for (let gIndex = 0; gIndex < res.res.length; gIndex++) {
                let tempItem = Array();
                for (let iIndex = 0; iIndex < res.res[gIndex].forums.length; iIndex++) {
                    let itm = res.res[gIndex].forums[iIndex];
                    tempItem.push({
                        displayName: itm.showName ? getHTMLDom(itm.showName) : getHTMLDom(itm.name),
                        name: itm.name,
                        id: itm.id
                    });
                }
                tempList.push({
                    groupName: res.res[gIndex].name,
                    data: tempItem
                });
            }
            this.setState({
                forumList: tempList,
            }, finish);
        }
        else {
            finish();
            alert('获取板块列表失败,' + res.errmsg);
        }
    }
    headerSize = null;
    /**
     * 点击了某个岛，开始切换
     */
    _onSelectIsland = () => {
        this.setState({
            islandModalX: headerSize.x,
            islandModalY: headerSize.y + headerSize.height,
            showAllIsland: !this.state.showAllIsland
        });
    }

    _onChangeIsland = (name) => {
        // 里岛API不同，暂时先不支持
        if (name == 'ld') {
            this.setState({
                showAllIsland: false
            });
            return;
        }
        if (name != configDynamic.islandMode) {
            configDynamic.islandMode = name;
        }

        this.setState({
            showAllIsland: false
        }, () => {
            this._pullDownRefresh(false, () => this._gotoFroum(-1, '时间线'));
        });
    }

    _headerDisplayLayout = (res) => {
        headerSize = res.nativeEvent.layout;
    }
    render() {
        return (
            <View style={{ top: 0, flex: 1, flexDirection: 'column', justifyContent: 'flex-start', backgroundColor: UISetting.colors.globalColor }}>
                <View style={{ backgroundColor: UISetting.colors.globalColor, top: 0, minHeight: Header.HEIGHT }}>
                    <SafeAreaView style={[styles.titleView, { minHeight: Header.HEIGHT }]}>
                        <TouchableOpacity
                            onLayout={this._headerDisplayLayout}
                            style={styles.titleIsland}
                            onPress={this._onSelectIsland}>
                            <Image source={configBase.islandList[configDynamic.islandMode].logo} style={styles.titleImage} resizeMode={'contain'}></Image>
                            <Text style={[styles.titleText, { color: UISetting.colors.fontColor }]}>
                                {configBase.islandList[configDynamic.islandMode].displayName}匿名版
                            </Text>
                            <Icon name={'arrow-down'} size={12} color={UISetting.colors.fontColor} />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
                <IsLandSelect
                    left={this.state.islandModalX}
                    top={this.state.islandModalY}
                    show={this.state.showAllIsland}
                    onSelected={this._onChangeIsland}
                    onClosed={() => { this.setState({ showAllIsland: false }) }} />
                <SectionList
                    style={{ backgroundColor: UISetting.colors.defaultBackgroundColor }}
                    onRefresh={() => this._pullDownRefresh(true)}
                    refreshing={this.state.headerLoading}
                    ListHeaderComponent={<Image style={styles.wlp} resizeMode='contain' resizeMethod='scale' source={require('../imgs/menu-top.jpg')} />}
                    renderSectionHeader={this._renderSectionHeader}
                    renderItem={this._renderItem}
                    sections={this.state.forumList}
                    keyExtractor={(item, index) => { return index.toString() }}
                />
                <SafeAreaView>
                    <View style={[styles.bottomTools, { backgroundColor: UISetting.colors.globalColor }]}>
                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity onPress={this._goSetting}>
                                <Icon name={'settings'} size={32} color={UISetting.colors.fontColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity onPress={this._gotoFeed}>
                                <Icon name={'star'} size={32} color={UISetting.colors.fontColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity onPress={this._gotoHistory}>
                                <Icon name={'book-open'} size={32} color={UISetting.colors.fontColor} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity onPress={this._gotoMember}>
                                <Icon name={'user'} size={32} color={UISetting.colors.fontColor} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }
}


export { LeftDrawerNavigator }