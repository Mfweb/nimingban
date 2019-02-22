import React from 'react'
import { Text, View, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import ImagePicker from 'react-native-image-picker';
import { getUserCookieList, addUserCookieList, removeUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { UIButton } from '../component/uibutton'
import { NavigationActions } from 'react-navigation'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    cookieMessage: {
        padding: 4,
        backgroundColor: '#FFE4B5',
        flex: 1,
    },
    cookieMessageText: {
        fontSize: 22,
        color: '#696969'
    },
    cookieUsage: {
        paddingLeft: 8,
        marginTop: 5
    },
    cookieUsageText: {
        color: '#696969',
        fontSize: 16
    },
    cookieList: {
        backgroundColor: '#DCDCDC',
    },
    cookieColumn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    cookieItem: {
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        height: 70,
        backgroundColor: '#FFF',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cookieIDText: {
        color: globalColor,
        fontSize: 22,
        textAlign:'center',
    },
    cookieText: {
        color: '#696969',
        fontSize: 12,
        textAlign:'center', 
        lineHeight: 12
    },
    backtoUsermemberView: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 5
    },
    backtoUsermemberText: {
        fontSize: 20,
        color: '#1E90FF',
        textDecorationLine: 'underline'
    }
});

class UserCookieManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userCookies: [],
            cookieListLoading: false,
            headerInfo: null,
            usingCookie: null
        }
    }
    static navigationOptions = ({ navigation }) => {
        return {
            title: '饼干管理',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>navigation.openDrawer()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'options-vertical'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }
    componentDidMount() {
        SoundPlayer.setCategory('Playback');
        this.codeSound = new SoundPlayer('scan-code.wav', SoundPlayer.MAIN_BUNDLE, (err)=>{
            if(err) {
                console.log('load sound error:', err);
            }
        });
        this.props.navigation.setParams({ showRightMenu: this._showRightMenu })
        this._pullDownRefreshing();
    }
    componentWillUnmount() {
        this.codeSound.release();
    }
    /**
     * 显示右侧菜单
     */
    _showRightMenu = () => {
        let menuList = ['扫描二维码', '相册选择二维码(未实现)', '手动输入']
        if(configDynamic.islandMode != 'lw') {
            menuList.push('立即获取');
        }
        ActionSheetApis.showActionSheet(this.refs['actMenu'],
            Dimensions.get('window').width,
            Header.HEIGHT,
            '详细菜单',
            menuList,
            (index) => {
                ActionSheetApis.closeActionSheet(this.refs['actMenu'], ()=>{
                    switch(index) {
                        case 0:
                            this._scanQRCode();
                            break;
                        case 1:
                            break;
                        case 2:
                            this._manualInput();
                            break;
                        case 3:
                            if(configDynamic.islandMode == 'lw') {
                                TopModalApis.showMessage(this.refs['msgBox'], '错误', '该功能不支持芦苇岛', '确认');
                                return;
                            }
                        break;
                    }
                });
            });
    }
    /**
     * 手动输入添加饼干
     */
    _manualInput = () => {
        this.__inputCookieString = '';
        TopModalApis.showMessage(this.refs['msgBox'], '输入饼干内容', 
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput 
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                onSubmitEditing={()=>{
                    TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                        this._addCookieToList(this.__inputCookieString);
                    });
                }}
                onChangeText={(text) => {
                    this.__inputCookieString = text;
                }}/>
        </View>),
        '确认',
        ()=>{
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                this._addCookieToList(this.__inputCookieString);
            });
        }, '取消');
    }
    /**
     * 扫码添加饼干
     */
    _scanQRCode = () => {
        this.cameraScan = true;
        TopModalApis.showMessage(this.refs['msgBox'],
            '扫码',
            (
                <RNCamera
                    style={{
                        height: Dimensions.get('window').height - Header.HEIGHT - 140
                    }}
                    ref={ref => {
                        this.camera = ref;
                    }}
                    autoFocus={RNCamera.Constants.AutoFocus.on}
                    barCodeTypes={Platform.OS=='ios'?[RNCamera.Constants.BarCodeType.qr]:[]}
                    googleVisionBarcodeType={Platform.OS=='android'?RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE:null}
                    captureAudio={false}
                    type={RNCamera.Constants.Type.back}
                    onBarCodeRead={({data, type})=>{
                        if(this.cameraScan) {
                            this.cameraScan = false;
                            this.codeSound.play();
                            TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                                TopModalApis.setContent(this.refs['msgBox'], null);
                                try{
                                    let cookieJSON = JSON.parse(data);
                                    if(cookieJSON && cookieJSON.hasOwnProperty('cookie')) {
                                        this._addCookieToList(cookieJSON['cookie']);
                                    }
                                    else {
                                        console.log(cookieJSON);
                                        TopModalApis.showMessage(this.refs['msgBox'], '错误', '该二维码中不包含饼干信息', '确认');
                                    }
                                }catch(err){
                                    TopModalApis.showMessage(this.refs['msgBox'], '错误', '该二维码中不包含饼干信息', '确认');
                                }
                            });
                        }
                    }}/>
            ), 
            '关闭'
        );
    }
    /**
     * 增加一块饼干
     */
    _addCookieToList = (cookieValue) => {
        if(this._checkCookie(cookieValue)) {
            this._getUserMark(async (markStr)=>{
                if(await addUserCookieList(markStr, cookieValue)) {
                    TopModalApis.showMessage(this.refs['msgBox'], '提示', '添加成功', '确认');
                    this._pullDownRefreshing();
                }
                else{
                    TopModalApis.showMessage(this.refs['msgBox'], '错误', '饼干已存在', '确认');
                }
            });
        }
    }
    /**
     * 检查饼干是否存在
     */
    _checkCookie = (cookieValue) => {
        if(!cookieValue || cookieValue.length < 20) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', '必须输入饼干内容', '确认');
            return false;
        }
        for(let i = 0; i < this.state.userCookies.length; i++) {
            if(this.state.userCookies[i].value == cookieValue) {
                TopModalApis.showMessage(this.refs['msgBox'], '错误', '饼干已存在', '确认');
                return false;
            }
        }
        return true;
    }
    /**
     * 获取用户备注
     */
    _getUserMark = (finish = ()=>{}) => {
        this.__inputMarkString = '';
        TopModalApis.showMessage(this.refs['msgBox'], '输入备注(可以为空)', 
        <View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput 
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                onSubmitEditing={()=>{
                    TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                        finish(this.__inputMarkString);
                    });
                }}
                onChangeText={(text) => {
                    this.__inputMarkString = text;
                }}/>
        </View>
        , '确认',()=>{
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                finish(this.__inputMarkString);
            });
        }, '取消');
    }
    _headerComponent = () => {
        return (
            <View style={this.state.headerInfo?styles.cookieMessage:styles.displayNone}>
                <Text style={styles.cookieMessageText}>
                {this.state.headerInfo}
                </Text>
            </View>
        );
    }
    _footerComponent = () => {
        return (
            <View style={styles.cookieUsage}>
                <Text style={styles.cookieUsageText}>
                    点击右上角菜单添加饼干
                </Text>
                <TouchableOpacity 
                    style={configDynamic.islandMode=='lw'?styles.backtoUsermemberView:styles.displayNone}
                    onPress={()=>{
                        this.props.navigation.reset([
                            NavigationActions.navigate({ 
                                routeName: 'UserMemberLogin'
                            })
                        ], 0);
                    }}>
                    <Text style={styles.backtoUsermemberText}>返回用户系统</Text>
                </TouchableOpacity>
            </View>
        );
    }
    _pullDownRefreshing = () => {
        this.setState({
            cookieListLoading: true,
            usingCookie: configDynamic.userCookie[configDynamic.islandMode]
        }, async () => {
            this.setState({
                userCookies: await getUserCookieList(),
                cookieListLoading: false
            });
        });
    }

    _renderItem = ({ item, index }) => {
        let using = configDynamic.userCookie[configDynamic.islandMode] == `userhash=${item.value}`;
        return (
            <View style={[styles.cookieItem, using?{backgroundColor: '#FFC0CB'}:{}]}>
                <View style={styles.cookieColumn}>
                    <Text style={styles.cookieIDText}>
                        {item.mark}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <Text style={styles.cookieText}>
                        {item.value}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <UIButton
                    text={'删除'}
                    style={{backgroundColor: '#DCDCDC', width: 45, height: 30}}
                    textStyle={{color:globalColor, fontSize: 19}}
                    showLoading={false}
                    onPress={()=>this._deleteCookie(item.value)}
                    />
                    <UIButton
                    text={'应用'}
                    style={using?styles.displayNone:{backgroundColor: globalColor, width: 45, height: 30}}
                    textStyle={{color:'#FFF', fontSize: 19}}
                    showLoading={false}
                    onPress={()=>this._enableCookie(item.value)}
                    />
                </View>
            </View>
        );
    }
    /**
     * 删除指定饼干
     */
    _deleteCookie = (value) => {
        TopModalApis.showMessage(this.refs['msgBox'], '信息', '确认删除？', '确认', async ()=>{
            TopModalApis.closeModal(this.refs['msgBox']);
            await removeUserCookieList(value);
            this._pullDownRefreshing();
        }, '取消');
    }
    /**
     * 应用指定饼干
     */
    _enableCookie = async (value) => {
        await setUserCookie(value);
        this._pullDownRefreshing();
    }
    render() {
        return (
            <View style={{flex: 1}}>
                <TopModal ref={'msgBox'} />
                <ActionSheet ref={'actMenu'} />
                <FlatList
                    data={this.state.userCookies}
                    extraData={this.state}
                    style={styles.cookieList}
                    onRefresh={this._pullDownRefreshing}
                    refreshing={this.state.cookieListLoading}
                    keyExtractor={(item, index) => {return index.toString()}}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._headerComponent}
                    ListFooterComponent={this._footerComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.cookieListLoading}
                            onRefresh={this._pullDownRefreshing}
                            title="正在加载..."/>
                    }
                />
            </View>
        );
    }
}

export { UserCookieManager }