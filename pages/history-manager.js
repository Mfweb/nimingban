import React from 'react'
import { Text, View, FlatList, Animated, Dimensions, TouchableOpacity, StyleSheet, Image } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { history } from '../modules/history'
import { getImage } from '../modules/api/image'
import { MainListItem } from '../component/list-main-item'
import { Toast } from '../component/toast'
import { ListProcessView } from '../component/list-process-view'
import { UISetting } from '../modules/config'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation'

const styles = StyleSheet.create({
    headerView: {
        borderWidth: 1,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    headerText: {
        fontSize: 18
    },
    headerButton: {
        padding: 2,
    },
    headerCenterButton: {
        borderLeftWidth: 1,
        borderRightWidth: 1
    },
    headerMark: {
        width: '33.33%',
        position: 'absolute',
        left: 0,
        height: '100%'
    },
    historyList: {
        flex: 1
    },
    footerMessage: {
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
        <View style={[styles.headerView, {borderColor: UISetting.colors.fontColor}]} onLayout={this._onLayout}>
            <Animated.View style={[styles.headerMark, {backgroundColor: UISetting.colors.fontColor, transform: [{ translateX: this.state.headerMove }]}]}>

            </Animated.View>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(0)}>
                <Text style={[styles.headerText,{color: UISetting.colors.fontColor}, this.state.mode===0?{color: UISetting.colors.globalColor}:{}]}>
                    浏览记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[
                styles.headerButton, 
                styles.headerCenterButton, { 
                    borderLeftColor: UISetting.colors.fontColor,
                    borderRightColor: UISetting.colors.fontColor
                    }
                ]}
                onPress={()=>this.props.changeMode(1)}>
                <Text style={[styles.headerText,{color: UISetting.colors.fontColor}, this.state.mode===1?{color: UISetting.colors.globalColor}:{}]}>
                    回复记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(2)}>
                <Text style={[styles.headerText,{color: UISetting.colors.fontColor}, this.state.mode===2?{color: UISetting.colors.globalColor}:{}]}>
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
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: '历史',
            headerTitle: (
                <HistoryHeader changeMode={params.changeMode} mode={navigation.getParam('mode', 0)}/>
            ),
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>navigation.openDrawer()} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.menuFunctions()} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'options'} size={24} color={UISetting.colors.fontColor} />
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
            menuFunctions: this._menuFunctions
        });
        this._pullDownRefresh();
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }
    _changeMode = (newMode) => {
        this.props.navigation.setParams({
            mode: newMode
        });
        if(newMode !== this.state.mode) {
            this.setState({
                mode: newMode,
                page: 1,
                historyList: []
            }, this._pullDownRefresh);
        }
    }
    /**
     * 右上角菜单
     */
    _menuFunctions = () =>{
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT,
        '清空记录',
        [
            '清空浏览历史',
            '清空回复历史',
            '清空图片历史'
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        history.clearHistory('browse').then(()=>{
                            this._pullDownRefresh();
                            this.toast.show('清空完成');
                        });
                        break;
                    case 1:
                        history.clearHistory('reply').then(()=>{
                            this._pullDownRefresh();
                            this.toast.show('清空完成');
                        });
                        break;
                    case 2:
                        history.clearHistory('image').then(()=>{
                            this._pullDownRefresh();
                            this.toast.show('清空完成');
                        });
                        break;
                }
            });
        });
    }
    loadingImages = Array();
    _renderItem = (data) => {
        let { item, index } = data;
        if(this.state.mode === 2) {
            return (
                <TouchableOpacity
                    onPress={()=>{
                        this.props.navigation.push('ImageViewer', {
                            imageUrl: `file://${item.url}`
                        });
                    }}
                    style={{width: '33%', height: 150, margin: '.1%'}}>
                    <Image
                        style={{width: '100%', height: 150}}
                        resizeMode='cover'
                        source={{uri: `file://${item.url}`}}
                    />
                </TouchableOpacity>
            );
        }
        if( (item.img != '') && (!item.localImage) && (this.loadingImages.indexOf(index) < 0) ) {
            this.loadingImages.push(index);
            let imgName = item.img + item.ext;
            getImage('thumb', imgName).then((res) => {
                if(this.isUnmount)return;
                let imgUrl = require('../imgs/img-error.png');
                if(res.status == 'ok') {
                    imgUrl = {uri: `file://${res.path}`};
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
            //await history.getHistory('image' ,1);
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
            return (<Text style={[styles.footerMessage, {color: UISetting.colors.lightFontColor}]}>{this.state.footerMessage}</Text>);
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
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <FlatList
                    numColumns={this.state.mode === 2 ? 3 : 1}
                    data={this.state.historyList}
                    extraData={this.state}
                    style={[styles.historyList, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}
                    onRefresh={this._pullDownRefresh}
                    refreshing={this.state.headerLoading}
                    keyExtractor={(item, index) => { return `${item.id}-${index}` }}
                    key={this.state.mode === 2 ? 3 : 1}
                    renderItem={this._renderItem}
                    ListFooterComponent={this._footerComponent}
                    onEndReachedThreshold={0.1}
                    onEndReached={this._pullUpLoading}
                    pageSize={20}
                    removeClippedSubviews={true}
                />
            </View>
        );
    }
}

export { HistoryManager }