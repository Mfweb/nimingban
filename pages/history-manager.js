import React from 'react'
import { Text, View, FlatList, Animated, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import { getUserCookieList, addUserCookieList, removeUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { UIButton } from '../component/uibutton'
import { NavigationActions } from 'react-navigation'
import { realAnonymousGetCookie } from '../modules/apis'
import { history } from '../modules/history'
import { getImage } from '../modules/apis'
import { MainListItem } from '../component/list-main-item'
import { Toast } from '../component/toast'
import { ListProcessView } from '../component/list-process-view'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    headerView: {
        borderColor: '#F5F5F5',
        borderWidth: 1,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    headerText: {
        fontSize: 18,
        color: '#F5F5F5'
    },
    headerButton: {
        padding: 2,
    },
    headerCenterButton: {
        borderLeftColor: '#F5F5F5',
        borderRightColor: '#F5F5F5',
        borderLeftWidth: 1,
        borderRightWidth: 1
    },
    headerSelected: {
        backgroundColor: '#F5F5F5',
        color: globalColor
    },
    headerMark: {
        width: '33.33%',
        position: 'absolute',
        left: 0,
        backgroundColor: '#F5F5F5',
        height: '100%'
    },
    historyList: {
        flex: 1,
        backgroundColor: '#DCDCDC'
    },
    footerMessage: {
        color: '#696969',
        fontSize: 18,
        textAlign: 'center',
        padding: 8
    },
});

class HistoryHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerMove: new Animated.Value(0),
            mode: 0
        }
    }

    componentWillReceiveProps (newProps) {
        if(newProps.mode != this.state.mode) {
            let target = this.maxWidth * 0.3334 * newProps.mode - 1;
            Animated.timing(
                this.state.headerMove,
                {
                    toValue: target<0?0:target,
                    duration: 150,
                    useNativeDriver: true,
                    stiffness: 80
                }
            ).start(()=>{
                this.setState({
                    mode: newProps.mode
                });
            });
        }
    }
    _onLayout = (res) => {
        this.maxWidth = res.nativeEvent.layout.width;
    }

    render() {
        return (
        <View style={styles.headerView} onLayout={this._onLayout}>
            <Animated.View style={[styles.headerMark, {transform: [{ translateX: this.state.headerMove }]}]}>

            </Animated.View>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(0)}>
                <Text style={[styles.headerText, this.state.mode===0?{color: globalColor}:{}]}>
                    浏览记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, styles.headerCenterButton]} onPress={()=>this.props.changeMode(1)}>
                <Text style={[styles.headerText, this.state.mode===1?{color: globalColor}:{}]}>
                    回复记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(2)}>
                <Text style={[styles.headerText, this.state.mode===2?{color: globalColor}:{}]}>
                    图片记录
                </Text>
            </TouchableOpacity>
        </View>
        );
    }
}

class HistoryManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            historyList: [],
            headerLoading: false,
            footerLoading: 0,
            loadEnd: false,
            footerMessage: '',
            page: 1,
            mode: 0
        };
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '历史',
            headerTitle: (
                <HistoryHeader changeMode={params.changeMode} mode={navigation.getParam('mode', 0)}/>
            ),
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>navigation.openDrawer()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'options'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }
    modeString = ['browse', 'reply', 'image']
    isUnmount = true;
    componentDidMount() {
        this.isUnmount = false;
        this.props.navigation.setParams({
            changeMode: this._changeMode,
        });
        this._pullDownRefresh();
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }
    _changeMode = (mode) => {
        this.props.navigation.setParams({
            mode: mode
        });
        if(mode !== this.state.mode) {
            this.setState({
                mode: mode
            }, this._pullDownRefresh);
        }
    }
    loadingImages = Array();
    _renderItem = ({ item, index }) => {
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            getImage('thumb', imgName).then((res) => {
                if(this.isUnmount)return;
                let imgUrl = require('../imgs/img-error.png');
                if(res.status == 'ok') {
                    imgUrl = {uri: 'file://' + res.path};
                }
                let tempList = this.state.historyList.slice();
                tempList[index].localImage = imgUrl;
                this.setState({ historyList: tempList });
            }).catch(function() {
                if(this.isUnmount) return;
                let tempList = this.state.historyList.slice();
                tempList[index].localImage = require('../imgs/img-error.png');
                this.setState({ historyList: tempList });
            });
        }
        return (
            <MainListItem itemDetail={item} navigation={this.props.navigation} Toast={this.toast} />
        )
    }
    _pullDownRefresh = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading) {
            return;
        }
        this.setState({ headerLoading: true, page: this.state.page }, async () => {
            this.loadingImages = [];
            let items = [];
            let res = await history.getHistory(this.modeString[this.state.mode], 1);
            for(let i = 0; i< res.rows.length; i++) {
                items.push(JSON.parse(res.rows.item(i).cache));
                items[items.length - 1].localImage = null;
            }
            this.setState({
                historyList: items,
                page: 2,
                headerLoading: false,
                loadEnd: false,
            });
        });
    }
    _pullUpLoading = () => {
        if (this.state.footerLoading != 0 || this.state.headerLoading || this.state.loadEnd) {
            return;
        }
        this.setState({ footerLoading: 1 }, async function() {
            this.loadingImages = [];
            let items = [];
            let res = await history.getHistory(this.modeString[this.state.mode], this.state.page);
            if(res.rows.length === 0) {
                this.setState({
                    footerLoading: false,
                    footerMessage: '到底啦',
                    loadEnd: true
                });
                return;
            }
            for(let i = 0; i< res.rows.length; i++) {
                items.push(JSON.parse(res.rows.item(i).cache));
                items[items.length - 1].localImage = null;
            }
            let tempList = this.state.historyList.slice()
            tempList = tempList.concat(items);
            let nextPage = this.state.page + 1;
            this.setState({
                historyList: tempList,
                page: nextPage,
                footerLoading: false,
            });
        });
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
    render() {
        return (
            <View style={{flex: 1}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
                <FlatList
                    data={this.state.historyList}
                    extraData={this.state}
                    style={styles.historyList}
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
                />
            </View>
        );
    }
}

export { HistoryManager }