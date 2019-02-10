import React from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard, Clipboard, Linking } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, startVerified, logout, checkVerifiedSMS } from '../../modules/user-member-api'
import { UIButton } from '../../component/uibutton'
import { getHTMLDom } from '../../modules/html-decoder'
import { globalColor, styles } from './user-member-styles'

const countryCodeList = [
    '中国 - +86', '美国 - +1', '加拿大 - +1', '香港 - +852', '澳门 - +853', '台湾 - +886', '马来西亚 - +60', '印度尼西亚 - +62',
    '新加坡 - +65', '泰国 - +66', '日本 - +81', '韩国 - +82', '越南 - +84', '哈萨克斯坦 - +7', '塔吉克斯坦 - +7', '土耳其 - +90', '印度 - +91',
    '巴基斯坦 - +92', '阿富汗 - +93', '斯里兰卡 - +94', '缅甸 - +95', '伊朗 - +98', '文莱 - +673', '朝鲜 - +850', '柬埔寨 - +855', '老挝 - +865',
    '孟加拉国 - +880', '马尔代夫 - +960', '叙利亚 - +963', '伊拉克 - +964', '巴勒斯坦 - +970', '阿联酋 - +971', '以色列 - +972', '巴林 - +973',
    '不丹 - +975', '蒙古 - +976', '尼珀尔 - +977', '英国 - +44', '德国 - +49', '意大利 - +39', '法国 - +33', '俄罗斯 - +7', '希腊 - +30', '荷兰 - +31',
    '比利时 - +32', '西班牙 - +34', '匈牙利 - +36', '罗马尼亚 - +40', '瑞士 - +41', '奥地利 - +43', '丹麦 - +45', '瑞典 - +46', '挪威 - +47',
    '波兰 - +48', '圣马力诺 - +223', '匈牙利 - +336', '南斯拉夫 - +338', '直布罗陀 - +350', '葡萄牙 - +351', '卢森堡 - +352', '爱尔兰 - +353',
    '冰岛 - +354', '马耳他 - +356', '塞浦路斯 - +357', '芬兰 - +358', '保加利亚 - +359', '立陶宛 - +370', '乌克兰 - +380', '南斯拉夫 - +381',
    '捷克 - +420', '秘鲁 - +51', '墨西哥 - +52', '古巴 - +53', '阿根廷 - +54', '巴西 - +55', '智利 - +56', '哥伦比亚 - +57', '委内瑞拉 - +58',
    '澳大利亚 - +61', '新西兰 - +64', '关岛 - +671', '斐济 - +679', '圣诞岛 - +619164', '夏威夷 - +1808', '阿拉斯加 - +1907', '格陵兰岛 - +299',
    '牙买加 - +1876', '南极洲 - +64672'
]

/**
 * 等待验证完成
 */
class UIWaitSuccess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '请使用你的手机在指定时间内将验证码发送到验证手机号，一个手机号只能实名一个账号，中国大陆岛民可以去掉+86。\r\n海外用户无法发送请联系运营商。\r\n如果实名失败请联系595609241@qq.com',
        }
        //props:
        //checkingSession
        //authMessage
        //onPressSend
    }

    render() {
        let {authMessage} = this.props;
        return(
            <View style={[styles.authView].concat(this.props.style)}>
                <View style={styles.authMessageView}>
                    <Text style={styles.authMessageText}>
                        {this.state.message}
                    </Text>
                    <TouchableOpacity onPress={() => {Clipboard.setString(authMessage.authMobile); alert('复制完成');}}>
                        <Text style={styles.authMessageRowTitle}>
                            验证手机号：<Text style={styles.authMessageMobile}>{authMessage.authMobile}</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {Clipboard.setString(authMessage.authCode); alert('复制完成');}}>
                        <Text style={styles.authMessageRowTitle}>
                            验证码：<Text style={styles.authMessageCode}>{authMessage.authCode}</Text>
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.authMessageRowTitle}>
                        你的手机号：<Text style={styles.authMessageYourMobile}>{authMessage.yourMobile}</Text>
                    </Text>
                    <Text style={styles.authMessageRowTitle}>
                        过期时间：<Text style={styles.authMessageExpireDate}>{authMessage.expireDate}</Text>
                    </Text>
                </View>
                <View style={styles.authToolsView}>
                    <UIButton text={'我已发送'}
                        style={styles.authToolsActBtn}
                        textStyle={styles.authToolsActBtnText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onPressSend}/>
                    <UIButton text={'打开短信'}
                        style={styles.authToolsActBtn}
                        textStyle={styles.authToolsActBtnText}
                        showLoading={this.props.checkingSession}
                        onPress={()=>{Linking.openURL(`sms:${authMessage.authMobile}&body=${authMessage.authCode}`);}}/>
                </View>
                <Button
                    style={{marginTop: 10}}
                    onPress={this.props.onCancel}
                    title={'返回重填'}/>
            </View>
        );
    }
}

/**
 * 实名认证开始界面UI
 */
class UIRealName extends React.Component {
    constructor(props) {
        super(props);
        //props:
        //checkingSession
        //countryCode
        //onPhoneInput
        //onStartPress
        //onCountryCodePress
    }

    render() {
        return (
            <View style={[this.props.style].concat(this.props.style)}>
                <View style={styles.userInputView}>
                    <Icon name={'phone'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TouchableOpacity style={styles.countryCode} onPress={this.props.onCountryCodePress}>
                        <Text style={styles.countryCodeText}>
                            {this.props.countryCode}
                        </Text>
                    </TouchableOpacity>
                    <TextInput 
                    style={styles.realNameUserInputText}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'phone-pad'}
                    placeholder={'手机号'}
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    autoComplete={'tel'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    onSubmitEditing={this.props.onLoginButtonPress}
                    onChangeText={this.props.onPhoneInput} />
                </View>
                
                <View style={styles.toolView1Btn}>
                    <UIButton text={'开始认证'}
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onStartPress}/>
                </View>
            </View>
        );
    }
}

class RealNameAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalComp: null,
            showModal: false,
            checkingSession: true,
            errmsgModal: false,
            errmsg: '',
            countryCode: 0,
            waitingSuccess: false,
            authMessage: '',

            messageModal: {
                show: false,
                title: '提示',
                content: <Text></Text>,
                leftButtonText: '',
                rightButtonText: '',
                leftButtonCallBack: null,
                rightButtonCallBack: null,
                closedCallback: null
            },
        }
    }
    inputPhone = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-实名认证',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>{Keyboard.dismiss();navigation.openDrawer();}} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.logout()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:'#FFF'}}>退出登录</Text>
                </TouchableOpacity>
            )
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok' || sessionInfo.session !== true) { //检查状态失败
            this._logout();
        }
        else {
            this.setState({
                checkingSession: false
            });
        }
        this.props.navigation.setParams({ logout: ()=>{
            this.showMessageModal('确认', '确认退出登录?', '确认', this._logout, '取消');
        } })
    }
    /**
     * 显示一个信息窗口
     */
    showMessageModal = async (title, content, successButtonText, successButtonCallBack = null, cancelButtonText = null, cancelButtonCallBack = null) => {
        let closeModal = ()=>{this.closeMessageModal()};
        this.setState({
            messageModal: {
                show: true,
                title: title,
                content: (<Text style={{width: 260, fontSize: 20, margin: 10}}>{content}</Text>),
                leftButtonText: cancelButtonText,
                rightButtonText: successButtonText,
                leftButtonCallBack: cancelButtonCallBack == null?closeModal:cancelButtonCallBack,
                rightButtonCallBack: successButtonCallBack == null?closeModal:successButtonCallBack,
                closedCallback: ()=>{}
            }
        });
    }
    /**
     * 关闭信息窗口
     */
    closeMessageModal = (callback = ()=>{}) => {
        //这样关闭可以防止闪烁
        let tempObj = {
            show: false,
            title: this.state.messageModal.title,
            content: this.state.messageModal.content,
            leftButtonText: this.state.messageModal.leftButtonText,
            rightButtonText: this.state.messageModal.rightButtonText,
            leftButtonCallBack: null,
            rightButtonCallBack: null,
            closedCallback: ()=>callback()
        }
        Keyboard.dismiss();
        this.setState({
            messageModal: tempObj
        });
    }
    /**
     * 退出登录
     */
    _logout = () => {
        Keyboard.dismiss();
        logout().then(()=>{
            this.props.navigation.reset([
                NavigationActions.navigate({
                    routeName: 'UserMemberLogin'
                })
            ], 0);
        });
    }

    /**
     * 检查实名认真短信是否发送
     */
    _checkRealNameAuth = async () => {
        let info = await checkVerifiedSMS();
        if(info.status != 'ok') {
            this.showMessageModal('错误', info.errmsg, '确认');
        }
        else {
            if(info.msg == 'false') {
                this.showMessageModal('信息', '还未收到短信或手机号已经绑定过其他账号。', '确认');
            }
            else if(info.msg == 'true') {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberCookies'
                    })
                ], 0);
            }
            else {
                this.showMessageModal('错误', info.msg, '确认');
            }
        }
    }
    /**
     * 取消实名认证，重填信息
     */
    _cancelRNA = ()=>{
        this.setState({
            waitingSuccess: false,
        });
    }
    /**
     * 开始实名认证
     */
    _startRealNameAuth = () => {
        Keyboard.dismiss();
        if (!(/^\d{5,}$/.test(this.inputPhone))) {
            this.showMessageModal('错误', '手机号格式错误', '确认');
            return;
        }
        this.inputVcode = '';
        this._getVCode(() => {
            this.closeMessageModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.showMessageModal('错误', '验证码输入错误', '确认');
                }
                else {
                    let rnInfo = await startVerified(this.inputPhone, this.state.countryCode + 1, this.inputVcode);
                    if(rnInfo.status != 'ok') {
                        this.showMessageModal('错误', rnInfo.errmsg, '确认');
                    }
                    else {
                        this.setState({
                            waitingSuccess: true,
                            authMessage: rnInfo.msg
                        });
                    }
                }
            });
        });
    }
    /**
     * 获取验证码
     */
    _getVCode = (checkCallback) => {
        this.setState({
            messageModal: {
                show: true,
                title: '输入验证码',
                content: (
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity 
                    style={styles.vcode}
                    onPress={()=>this._getVCode(checkCallback)}>
                        <ImageProcessView 
                        height={25} 
                        width={25} />
                    </TouchableOpacity>
                </View>
                ),
                leftButtonText: '取消',
                rightButtonText: '确认',
                leftButtonCallBack: ()=>this.closeMessageModal(),
                rightButtonCallBack: ()=>checkCallback(),
                closedCallback: null
            }
        }, async () => {
            let vcode = await getVerifyCode();
            let tempObj = {
                show: true,
                title: '输入验证码',
                content: (
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity style={styles.vcode}
                    onPress={()=>this._getVCode(this.state.messageModal.rightButtonCallBack)}>
                        <Image style={{
                            width: 280, height: 50,top: 0
                        }} 
                        source={ vcode.status == 'ok'?{ uri: `file://${vcode.path}`}:require('../../imgs/vcode-error.png') } 
                        resizeMode='contain' />
                    </TouchableOpacity>
                    <TextInput 
                    style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                    autoFocus={true}
                    textAlignVertical='center'
                    maxLength={5}
                    returnKeyType={'done'}
                    onSubmitEditing={()=>checkCallback()}
                    onChangeText={(text) => {this.inputVcode = text;}}/>
                </View>    
                ),
                leftButtonText: '取消',
                rightButtonText: '确认',
                leftButtonCallBack: this.state.messageModal.leftButtonCallBack,
                rightButtonCallBack: this.state.messageModal.rightButtonCallBack,
                closedCallback: null
            };
            this.setState({
                messageModal: tempObj
            });
        });
    }
    /**
     * 修改国家代码
     */
    _onCountryCodePress = () => {
        Keyboard.dismiss();
        this.setState({
            messageModal: {
                show: true,
                title: '选择国家',
                content: (
                    <FlatList
                        style={{width: 280, height: 300, backgroundColor: '#F5F5F5'}}
                        data={countryCodeList}
                        extraData={this.state}
                        keyExtractor={(item, index) => {return index.toString()}}
                        renderItem={({item,index})=>{
                            return (
                                <TouchableOpacity 
                                    style={{margin: 5,borderRadius:2, backgroundColor: this.state.countryCode==index?'#A9A9A9':'#F5F5F5'}}
                                    onPress={()=>{this.setState({countryCode: index}, this.closeMessageModal());}}>
                                    <Text style={{fontSize: 24, textAlign:'center'}}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                ),
                rightButtonText: '确认',
                rightButtonCallBack: ()=>this.closeMessageModal(),
                closedCallback: null
            }
        });
    }

    render() {
        return (
            <View style={styles.loginView}>
               <TopModal
                    show={this.state.messageModal.show}
                    width={280}
                    title={ this.state.messageModal.title }
                    rightButtonText={this.state.messageModal.rightButtonText}
                    leftButtonText={this.state.messageModal.leftButtonText}
                    item={this.state.messageModal.content}
                    onClosePress={()=>this.closeMessageModal()}
                    onRightButtonPress={this.state.messageModal.rightButtonCallBack} 
                    onLeftButtonPress={this.state.messageModal.leftButtonCallBack}
                    closedCallback={this.state.messageModal.closedCallback}/>
                <Image 
                style={styles.loginTitleImg} 
                resizeMode={'contain'} 
                source={require('../../imgs/member-title.png')} />
                <UIRealName
                    style={this.state.waitingSuccess?{display:'none'}:{}}
                    checkingSession={this.state.checkingSession}
                    onPhoneInput={(text)=>{this.inputPhone = text;}}
                    onStartPress={this._startRealNameAuth}
                    countryCode={countryCodeList[this.state.countryCode].split(' - ')[1]}
                    onCountryCodePress={this._onCountryCodePress}
                />
                <UIWaitSuccess
                    style={this.state.waitingSuccess?{}:{display:'none'}}
                    authMessage={this.state.authMessage}
                    onPressSend={this._checkRealNameAuth}
                    onCancel={this._cancelRNA}/>
            </View>
        )
    }
}

export { RealNameAuth };