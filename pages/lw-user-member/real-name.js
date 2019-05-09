import React from 'react'
import { Text, Button, View, Image, FlatList, TextInput, TouchableOpacity, Keyboard, Clipboard, Linking } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, startVerified, logout, checkVerifiedSMS } from '../../modules/api/ano/user-member'
import { UIButton } from '../../component/uibutton'
import { styles } from './user-member-styles'
import { UISetting } from '../../modules/config'

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
                    <Text style={[styles.authMessageText,{color: UISetting.colors.lightFontColor}]}>
                        {this.state.message}
                    </Text>
                    <TouchableOpacity onPress={() => {Clipboard.setString(authMessage.authMobile); alert('复制完成');}}>
                        <Text style={[styles.authMessageRowTitle, {color: UISetting.colors.lightFontColor}]}>
                            验证手机号：<Text style={[styles.authMessageMobile,{color: UISetting.colors.globalColor}]}>{authMessage.authMobile}</Text>
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => {Clipboard.setString(authMessage.authCode); alert('复制完成');}}>
                        <Text style={[styles.authMessageRowTitle, {color: UISetting.colors.lightFontColor}]}>
                            验证码：<Text style={[styles.authMessageCode,{color: UISetting.colors.globalColor}]}>{authMessage.authCode}</Text>
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.authMessageRowTitle, {color: UISetting.colors.lightFontColor}]}>
                        你的手机号：<Text style={[styles.authMessageYourMobile,{color: UISetting.colors.globalColor}]}>{authMessage.yourMobile}</Text>
                    </Text>
                    <Text style={[styles.authMessageRowTitle, {color: UISetting.colors.lightFontColor}]}>
                        过期时间：<Text style={[styles.authMessageExpireDate,{color: UISetting.colors.globalColor}]}>{authMessage.expireDate}</Text>
                    </Text>
                </View>
                <View style={styles.authToolsView}>
                    <UIButton text={'我已发送'}
                        backgroundColor={UISetting.colors.globalColor}
                        textColor={UISetting.colors.fontColor}
                        fontSize={22}
                        width="45%"
                        show={true}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onPressSend}/>
                    <UIButton text={'打开短信'}
                        backgroundColor={UISetting.colors.globalColor}
                        textColor={UISetting.colors.fontColor}
                        fontSize={22}
                        width="45%"
                        show={true}
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
                <View style={[styles.userInputView,{backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                    <Icon name={'phone'} size={24} color={UISetting.colors.globalColor} />
                    <View style={[styles.splitLine,{backgroundColor: UISetting.colors.globalColor}]}></View>
                    <TouchableOpacity style={styles.countryCode} onPress={this.props.onCountryCodePress}>
                        <Text style={[styles.countryCodeText, {color: UISetting.colors.lightFontColor}]}>
                            {this.props.countryCode}
                        </Text>
                    </TouchableOpacity>
                    <TextInput
                    style={[styles.realNameUserInputText,{color: UISetting.colors.lightFontColor}]}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'phone-pad'}
                    placeholder={'手机号'}
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    autoComplete={'tel'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    onSubmitEditing={this.props.onStartPress}
                    onChangeText={this.props.onPhoneInput} />
                </View>

                <View style={styles.toolView1Btn}>
                    <UIButton text={'开始认证'}
                        backgroundColor={UISetting.colors.globalColor}
                        textColor={UISetting.colors.threadBackgroundColor}
                        fontSize={22}
                        width="45%"
                        show={true}
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
            checkingSession: true,
            countryCode: 0,
            waitingSuccess: false,
            authMessage: '',
        }
    }
    inputPhone = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: 'A岛-实名认证',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>{Keyboard.dismiss();navigation.openDrawer();}} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }}
                    onPress={async ()=>navigation.state.params.logout()} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:UISetting.colors.fontColor}}>退出登录</Text>
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
            this.TopModal.showMessage('提示', `确认退出登录?`,'确认',this._logout,'取消');
        } })
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
            this.TopModal.showMessage('错误', info.errmsg,'确认');
        }
        else {
            if(info.msg == 'false') {
                this.TopModal.showMessage('信息', '还未收到短信或手机号已经绑定过其他账号。','确认');
            }
            else if(info.msg == 'true') {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberCookies'
                    })
                ], 0);
            }
            else {
                this.TopModal.showMessage('错误', info.msg,'确认');
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
            this.TopModal.showMessage('信息', '手机号格式错误','确认');
            return;
        }
        this.inputVcode = '';
        this._getVCode(() => {
            Keyboard.dismiss();
            this.TopModal.closeModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.TopModal.showMessage('信息', '验证码输入错误','确认');
                }
                else {
                    let rnInfo = await startVerified(this.inputPhone, this.state.countryCode + 1, this.inputVcode);
                    if(rnInfo.status != 'ok') {
                        this.TopModal.showMessage('信息', rnInfo.errmsg,'确认');
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
        this.TopModal.showMessage('输入验证码',
        (
            <View style={{width: 280, height: 100}}>
                <TouchableOpacity
                style={styles.vcode}
                onPress={()=>this._getVCode(checkCallback)}>
                    <ImageProcessView
                    height={25}
                    width={25} />
                </TouchableOpacity>
            </View>
        ), '确认', ()=>checkCallback(), '取消', ()=>{Keyboard.dismiss();this.TopModal.closeModal();},
        async () => {
            let vcode = await getVerifyCode();
            this.TopModal.setContent((
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity style={styles.vcode}
                    onPress={()=>this._getVCode(checkCallback)}>
                        <Image style={{
                            width: 280, height: 50,top: 0
                        }}
                        source={ vcode.status == 'ok'?{ uri: `file://${vcode.path}`}:require('../../imgs/vcode-error.png') }
                        resizeMode='contain' />
                    </TouchableOpacity>
                    <TextInput
                    style={{flex:1, fontSize: 24, width: 280, textAlign:'center',color: UISetting.colors.lightFontColor}}
                    autoFocus={true}
                    textAlignVertical='center'
                    maxLength={5}
                    returnKeyType={'done'}
                    onSubmitEditing={()=>checkCallback()}
                    onChangeText={(text) => {this.inputVcode = text;}}/>
                </View>
                )
            );
        });
    }
    /**
     * 修改国家代码
     */
    _onCountryCodePress = () => {
        Keyboard.dismiss();
        this.TopModal.showMessage('选择国家',
        (
            <FlatList
                style={{height: 300, backgroundColor: UISetting.colors.defaultBackgroundColor}}
                data={countryCodeList}
                extraData={this.state}
                keyExtractor={(item, index) => {return index.toString()}}
                renderItem={({item,index})=>{
                    return (
                        <TouchableOpacity
                            style={{margin: 5,borderRadius:2, backgroundColor: this.state.countryCode==index?UISetting.colors.lightFontColor:UISetting.colors.defaultBackgroundColor}}
                            onPress={()=>{this.setState({countryCode: index}, this.TopModal.closeModal());}}>
                            <Text style={{fontSize: 24, textAlign:'center'}}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        ), '确认');
    }

    render() {
        return (
            <View style={[styles.loginView,{backgroundColor: UISetting.colors.defaultBackgroundColor}]}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
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