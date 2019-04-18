import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Alert } from 'react-native'
import { getThreadList, getImage, getForumList, getFeedList } from '../modules/apis'
import { ListProcessView } from '../component/list-process-view'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic, configNetwork, UISetting, loadUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { history } from '../modules/history'
import { MainListItem } from '../component/list-main-item'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation'
import { getHTMLDom } from '../modules/html-decoder'
import { FixedButton } from '../component/fixed-button'
import { FloatingScrollButton } from '../component/floating-scroll-button'
import { pinkCheckUpdate, pinkDoHotUpdate } from '../modules/hotupdate'


const styles = StyleSheet.create({
    mainList: {
        flex: 1
    },
    headerRightView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
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
     * 右上角菜单
     */
    _menuFunctions = () =>{
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, '订阅ID管理',
        [
            '添加订阅ID',
            '删除当前订阅ID',
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        break;
                    case 1:
                        break;
                }
            });
        });
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
                console.log(res);
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