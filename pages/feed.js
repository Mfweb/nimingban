import React from 'react'
import { View, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, TextInput, Text } from 'react-native'
import { getImage } from '../modules/api/image'
import { getFeedID, getFeedList, addFeedID, removeFeedID } from '../modules/api/ano/feed'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configDynamic, configLocal, UISetting, loadUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { MainListItem } from '../component/list-main-item'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation'
import { FloatingScrollButton } from '../component/floating-scroll-button'
import AsyncStorage from '@react-native-community/async-storage';

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
});

class FeedScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerLoading: false,
            threadList: Array(),
        };
    }
    isUnmount = true;

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            headerBackTitle: '订阅',
            title:  `订阅管理`,
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <View style={styles.headerRightView}>
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
        this._pullDownRefresh();
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
            menuFunctions: this._menuFunctions
        });
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }
    /**
     * 获取订阅ID列表
     */
    _getFeedIDList = async () => {
        var temp = await AsyncStorage.getItem(configLocal.localStorageName[configDynamic.islandMode].feedIDList);
        if(temp !== null) {
            temp = JSON.parse(temp);
        }
        return temp;
    }
    /**
     * 右上角菜单
     */
    _menuFunctions = async () =>{
        let feedID = await getFeedID();
        let feedIDList = await this._getFeedIDList();
        if(feedIDList === null) feedIDList = [feedID];
        else {
            if(feedIDList.indexOf(feedID) === -1) feedIDList.push(feedID);
        }
        feedIDList.splice(feedIDList.indexOf(feedID), 1, `${feedID}✔`);
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, '订阅ID管理',
        [
            '添加订阅ID',
            '删除当前订阅ID',
        ].concat(feedIDList),
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        this._addNewFeedID(feedIDList);
                        break;
                    case 1:
                        removeFeedID(feedID).then((res)=>{
                            if(res.status !== 'ok') {
                                this.TopModal.showMessage('提示', res.errmsg, '确认');
                            }
                            else {
                                this.TopModal.showMessage('提示', '删除完成', '确认');
                            }
                        });
                        break;
                    default:
                        configDynamic.feedID[configDynamic.islandMode] = feedIDList[index - 2];
                        AsyncStorage.setItem(configLocal.localStorageName[configDynamic.islandMode].feedID, configDynamic.feedID[configDynamic.islandMode]);
                        this._pullDownRefresh();
                }
            });
        });
    }
    /**
     * 添加订阅ID
     */
    _addNewFeedID = () => {
        this.inputID = '';
        this.TopModal.showMessage('输入订阅ID',
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center', color: UISetting.colors.lightFontColor}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                keyboardType={'default'}
                onSubmitEditing={()=>this.TopModal.closeModal(()=>{
                    addFeedID(this.inputID).then((res)=>{
                        if(res.status !== 'ok') {
                            this.TopModal.showMessage('提示', res.errmsg, '确认');
                        }
                        else {
                            this.TopModal.showMessage('提示', '添加完成', '确认');
                        }
                    });
                })}
                onChangeText={(text)=>{this.inputID = text;}}/>
        </View>),'确认',
        ()=>this.TopModal.closeModal(()=>{
            addFeedID(this.inputID).then((res)=>{
                if(res.status !== 'ok') {
                    this.TopModal.showMessage('提示', res.errmsg, '确认');
                }
                else {
                    this.TopModal.showMessage('提示', '添加完成', '确认');
                }
            });
        }), '取消');
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

    _pullDownRefresh = () => {
        if ( this.state.headerLoading ) {
            return;
        }
        this.setState({ headerLoading: true }, () => {
            getFeedList().then((res) => {
                if(this.isUnmount)return;
                if (res.status == 'ok') {
                    this.loadingImages = [];
                    this.setState({
                        threadList: res.res,
                        headerLoading: false,
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
                    removeClippedSubviews={true}
                    ListFooterComponent={<Text style={[styles.footerMessage, {color: UISetting.colors.lightFontColor}]}>没有啦</Text>}
                    onScroll={()=>{
                        if(UISetting.showFastScrollButton) {
                            this.ScrollButton.show(1500);
                        }
                    }}
                />
            </SafeAreaView>
        );
    }
}

export { FeedScreen };