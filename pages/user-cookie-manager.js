import React from 'react'
import { Text, View, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { globalColor, styles } from './lw-user-member/user-member-styles'
import { TopModal, TopModalApis } from '../component/top-modal'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import ImagePicker from 'react-native-image-picker';
import { getUserCookieList, addUserCookieList, getUserCookie } from '../modules/cookie-manager'

function base64Decoder(input, length) {
    let keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var output = new Uint8ClampedArray(length);
    var chr1, chr2, chr3 = "";
    var enc1, enc2, enc3, enc4 = "";
    var i = 0;

    // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
    var base64test = /[^A-Za-z0-9\+\/\=]/g;
    if (base64test.exec(input)) {
        window.alert("There were invalid base64 characters in the input text.\n" +
            "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
            "Expect errors in decoding.");
    }
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    var idx = 0;
    do {
        enc1 = keyStr.indexOf(input.charAt(i++));
        enc2 = keyStr.indexOf(input.charAt(i++));
        enc3 = keyStr.indexOf(input.charAt(i++));
        enc4 = keyStr.indexOf(input.charAt(i++));

        chr1 = (enc1 << 2) | (enc2 >> 4);
        chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        chr3 = ((enc3 & 3) << 6) | enc4;

        //output.push(chr1);
        output[idx++] = chr1;
        if (enc3 != 64) {
            output[idx++] = chr2;
            //output = output + String.fromCharCode(chr2);
        }
        if (enc4 != 64) {
            output[idx++] = chr3;
            //output = output + String.fromCharCode(chr3);
        }

        chr1 = chr2 = chr3 = "";
        enc1 = enc2 = enc3 = enc4 = "";

    } while (i < input.length);

    return output;
}
class UserCookieManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userCookies: [],
            cookieListLoading: false,
            headerInfo: null
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
            '关闭', 
            () => TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                TopModalApis.setContent(this.refs['msgBox'], null);
            }), 
            null, 
            ()=>TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                TopModalApis.setContent(this.refs['msgBox'], null);
            }),
            ()=>{}, 
            ()=>TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                TopModalApis.setContent(this.refs['msgBox'], null);
            })
        );
    }
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
    _checkCookie = (cookieValue) => {
        for(let i = 0; i < this.state.userCookies.length; i++) {
            if(this.state.userCookies[i].value == cookieValue) {
                TopModalApis.showMessage(this.refs['msgBox'], '错误', '饼干已存在', '确认');
                return false;
            }
        }
        return true;
    }
    _getUserMark = (finish = ()=>{}) => {
        this.__inputMarkString = '';
        TopModalApis.showMessage(this.refs['msgBox'], '输入备注(可以为空)', 
        <View style={{height: 30}}>
            <TextInput 
                style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                autoFocus={true}
                textAlignVertical='center'
                returnKeyType={'done'}
                onSubmitEditing={()=>{
                    Keyboard.dismiss();
                    finish(this.__inputMarkString);
                }}
                onChangeText={(text) => {
                    this.__inputMarkString = text;
                }}/>
        </View>
        , '确认',()=>{
            Keyboard.dismiss();
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                finish(this.__inputMarkString);
            });
        }, '取消', ()=>{
            Keyboard.dismiss();
            TopModalApis.closeModal(this.refs['msgBox']);
        }, null, ()=>{
            Keyboard.dismiss();
            TopModalApis.closeModal(this.refs['msgBox']);
        });
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
            </View>
        );
    }
    _pullDownRefreshing = async () => {
        this.setState({
            userCookies: await getUserCookieList()
        });
    }
    handleCanvas = (canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'purple';
        ctx.fillRect(0, 0, 100, 100);
    }
    _renderItem = ({ item, index }) => {
        return (
            <Text>
                <Text>{item.mark}</Text>
                <Text>{item.value}</Text>
            </Text>
        );
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