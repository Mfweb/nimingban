import React from 'react'
import { Text, View, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { ActionSheet } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import { getUserCookieList, addUserCookieList, removeUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { UIButton } from '../component/uibutton'
import { NavigationActions } from 'react-navigation'
import { realAnonymousGetCookie } from '../modules/apis'
import ImagePicker from 'react-native-image-crop-picker';
import JPEG from 'jpeg-js';
import JSQR from 'jsqr';

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    cookieMessage: {
        padding: 4,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cookieMessageText: {
        fontSize: 20,
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
                    <Icon name={'options'} size={24} color={'#FFF'} />
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
        let menuList = ['扫描二维码', '相册选择二维码', '手动输入']
        if(configDynamic.islandMode != 'lw') {
            menuList.push('立即获取');
        }
        this.ActionSheet.showActionSheet( Dimensions.get('window').width, Header.HEIGHT, '详细菜单',
            menuList,
            (index) => {
                this.ActionSheet.closeActionSheet(()=>{
                    switch(index) {
                        case 0:
                            this._scanQRCode();
                            break;
                        case 1:
                            this._scanQRFromImage();
                            break;
                        case 2:
                            this._manualInput();
                            break;
                        case 3:
                            if(configDynamic.islandMode == 'lw') {
                                this.TopModal.showMessage('错误', '该功能不支持芦苇岛', '确认');
                                return;
                            }
                            else {
                                this._autoGet();
                            }
                        break;
                    }
                });
            });
    }
    _autoGet = async () => {
        let res = await realAnonymousGetCookie();
        if(res.status == 'ok') {
            this.TopModal.showMessage('提示', '获取完成', '确认');
            this._pullDownRefreshing();
        }
        else {
            this.TopModal.showMessage('提示', res.errmsg, '确认');
        }
    }
    /**
     * 手动输入添加饼干
     */
    _manualInput = () => {
        this.__inputCookieString = '';
        this.TopModal.showMessage('输入饼干内容', 
        (<View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput 
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                onSubmitEditing={()=>{
                    this.TopModal.closeModal(async ()=>{
                        this._addCookieToList(this.__inputCookieString);
                    });
                }}
                onChangeText={(text) => {
                    this.__inputCookieString = text;
                }}/>
        </View>),
        '确认',
        ()=>{
            this.TopModal.closeModal(async ()=>{
                this._addCookieToList(this.__inputCookieString);
            });
        }, '取消');
    }
    _scanQRFromImage = async () => {
        try{
            var pickerImage = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: false,
                multiple: false,
                writeTempFile: false,
                includeBase64: true,
                compressImageQuality: 0.8,
                forceJpg: true
            });
            if(!pickerImage) {
                return;
            }
        }catch(ex) {
            console.warn(ex);
        }
        // 解码base64
        let binaryString =  window.atob(pickerImage.data);
        let len = binaryString.length;
        // 转为Uint8Array
        let bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++)        {
            bytes[i] = binaryString.charCodeAt(i);
        }
        // 解码jpeg
        let jpegData = JPEG.decode(bytes.buffer, true);
        // 二维码解析
        let qrStr = JSQR(jpegData.data, jpegData.width, jpegData.height);
        if(qrStr === null || !qrStr.data) {
            this.TopModal.showMessage('错误', '图片中似乎不包含二维码', '确认');
            return;
        }
        try{
            let qrObj = JSON.parse(qrStr.data);
            if(typeof qrObj !== 'object' || !qrObj.hasOwnProperty('cookie')) {
                this.TopModal.showMessage('错误', '二维码中没有饼干', '确认');
                return;
            }
            this._addCookieToList(qrObj['cookie']);
        }catch{
            this.TopModal.showMessage('错误', '二维码中没有饼干', '确认');
        }
    }
    /**
     * 扫码添加饼干
     */
    _scanQRCode = () => {
        this.cameraScan = true;
        this.TopModal.showMessage('扫码',
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
                            this.TopModal.closeModal(()=>{
                                this.TopModal.setContent(null);
                                try{
                                    let cookieJSON = JSON.parse(data);
                                    if(cookieJSON && cookieJSON.hasOwnProperty('cookie')) {
                                        this._addCookieToList(cookieJSON['cookie']);
                                    }
                                    else {
                                        console.log(cookieJSON);
                                        this.TopModal.showMessage('错误', '该二维码中不包含饼干信息', '确认');
                                    }
                                }catch(err){
                                    this.TopModal.showMessage('错误', '该二维码中不包含饼干信息', '确认');
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
                    this.TopModal.showMessage('提示', '添加成功', '确认');
                    this._pullDownRefreshing();
                }
                else{
                    this.TopModal.showMessage('错误', '饼干已存在', '确认');
                }
            });
        }
    }
    /**
     * 检查饼干是否存在
     */
    _checkCookie = (cookieValue) => {
        if(!cookieValue || cookieValue.length < 20) {
            this.TopModal.showMessage('错误', '必须输入饼干内容', '确认');
            return false;
        }
        for(let i = 0; i < this.state.userCookies.length; i++) {
            if(this.state.userCookies[i].value == cookieValue) {
                this.TopModal.showMessage('错误', '饼干已存在', '确认');
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
        this.TopModal.showMessage('输入备注(可以为空)', 
        <View style={{height: 30, marginTop:20, marginBottom: 20}}>
            <TextInput 
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                onSubmitEditing={()=>{
                    this.TopModal.closeModal(async ()=>{
                        finish(this.__inputMarkString);
                    });
                }}
                onChangeText={(text) => {
                    this.__inputMarkString = text;
                }}/>
        </View>
        , '确认',()=>{
            this.TopModal.closeModal(async ()=>{
                finish(this.__inputMarkString);
            });
        }, '取消');
    }
    _headerComponent = () => {
        return (
            <View style={this.state.userCookies.length==0?styles.cookieMessage:styles.displayNone}>
                <Text style={styles.cookieMessageText}>
                你还没有饼干，点击右上角添加饼干
                </Text>
            </View>
        );
    }
    _footerComponent = () => {
        return (
            <View style={styles.cookieUsage}>
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
                    <UIButton
                    text={'取消'}
                    style={(!using)?styles.displayNone:{backgroundColor: globalColor, width: 45, height: 30}}
                    textStyle={{color:'#FFF', fontSize: 19}}
                    showLoading={false}
                    onPress={this._disableCookie}
                    />
                </View>
            </View>
        );
    }
    /**
     * 取消使用当前饼干
     */
    _disableCookie = async () => {
        await setUserCookie(null);
        this._pullDownRefreshing();
    }
    /**
     * 删除指定饼干
     */
    _deleteCookie = (value) => {
        this.TopModal.showMessage('信息', '确认删除？', '确认', async ()=>{
            this.TopModal.closeModal();
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
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
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