import React from 'react'
import { Text, View, Image, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, login } from '../../modules/api/ano/user-member'
import { UIButton } from '../../component/uibutton'
import { styles } from './user-member-styles'
import { UISetting } from '../../modules/config'

/**
 * 登录相关
 */
class UILogin extends React.Component {
    constructor(props) {
        super(props);
        //props:
        //checkingSession
        //onUserNameInput
        //onPasswordInput
        //onRegisterButtonPress
        //onLoginButtonPress
    }

    render() {
        return (
            <View style={this.props.style}>
                <View style={[styles.userInputView,{backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                    <Icon name={'user'} size={24} color={UISetting.colors.globalColor} />
                    <View style={[styles.splitLine,{backgroundColor: UISetting.colors.globalColor}]}></View>
                    <TextInput
                    style={[styles.userInputText,{color: UISetting.colors.lightFontColor}]}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'email-address'}
                    placeholder={'email'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    autoComplete={'username'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    onSubmitEditing={() => {this.secondTextInput.focus(); }}
                    onChangeText={this.props.onUserNameInput} />
                </View>

                <View style={[styles.userInputView,{backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                    <Icon name={'lock'} size={24} color={UISetting.colors.globalColor} />
                    <View style={[styles.splitLine,{backgroundColor: UISetting.colors.globalColor}]}></View>
                    <TextInput
                    ref={(input) => { this.secondTextInput = input; }}
                    style={[styles.userInputText,{color: UISetting.colors.lightFontColor}]}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    placeholder={'密码'}
                    returnKeyType={'done'}
                    autoComplete={'password'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={true}
                    secureTextEntry={true}
                    onChangeText={this.props.onPasswordInput} />
                </View>

                <View style={styles.toolView2Btn}>
                    <UIButton
                        text={'注册'}
                        backgroundColor={UISetting.colors.fontColor}
                        textColor={UISetting.colors.globalColor}
                        fontSize={22}
                        width="45%"
                        show={true}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onRegisterButtonPress}/>
                    <UIButton
                        text={'登录'}
                        backgroundColor={UISetting.colors.globalColor}
                        textColor={UISetting.colors.fontColor}
                        fontSize={22}
                        width="45%"
                        show={true}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onLoginButtonPress}/>
                </View>
                <TouchableOpacity
                    style={styles.backtoUsermemberView}
                    onPress={()=>{
                        this.props.navigation.reset([
                            NavigationActions.navigate({
                                routeName: 'UserCookieManager'
                            })
                        ], 0);
                    }}>
                    <Text style={[styles.backtoUsermemberText, {color: UISetting.colors.linkColor}]}>本地饼干管理器</Text>
                </TouchableOpacity>
            </View>
        );
    }
}

class UserMemberLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkingSession: true,
            sessionState: false,
        }
    }
    inputUserName = ''
    inputPassWord = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: 'A岛-登录',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>{Keyboard.dismiss();navigation.openDrawer();}} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }}
                onPress={()=>{ navigation.push('UserMemberForgotPw') }} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:UISetting.colors.fontColor}}>忘记密码</Text>
                </TouchableOpacity>
            )
        }
    }

    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            this.setState({
                checkingSession: false
            });
            this.TopModal.showMessage('错误', `检查状态失败：${sessionInfo.errmsg}，可能导致无法正常登录。`,'确认');
        }
        else {
            this.setState({
                sessionState: sessionInfo.session,
                checkingSession: false
            }, () => {
                if(sessionInfo.session === true) {
                    this.props.navigation.reset([
                        NavigationActions.navigate({
                            routeName: 'UserMemberCookies'
                        })
                    ], 0);
                    //UserMemberCookies
                }
            });
            //await logout();
        }
    }

    /**
     * 登录
     */
    _onLogin = async () => {
        Keyboard.dismiss();
        if(this.inputVcode.length != 5) {
            this.TopModal.showMessage('错误', `验证码长度错误`,'确认');
            return;
        }
        this.setState({
            checkingSession: true
        });
        let loginRes = await login(this.inputUserName, this.inputPassWord, this.inputVcode);
        if(loginRes.status != 'ok') {
            this.setState({
                checkingSession: false
            });
            this.TopModal.showMessage('错误', loginRes.errmsg,'确认');
        }
        else {
            this.setState({
                checkingSession: false
            }, () => {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberCookies'
                    })
                ], 0);
            });
        }
    }
    /**
     * 开始登录（打开验证码输入窗口
     */
    _onLoginStart = async () => {
        Keyboard.dismiss();
        if( (this.inputUserName.length < 5) || (this.inputUserName.indexOf('@') <= 0) ) {
            this.TopModal.showMessage('错误', `账号格式错误`,'确认');
            return;
        }
        if( this.inputPassWord.length < 5 ) {
            this.TopModal.showMessage('错误', `密码格式错误`,'确认');
            return;
        }
        this._getVCode(()=>{
            Keyboard.dismiss();
            this.TopModal.closeModal(async ()=>{
                await this._onLogin();
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

    render() {
        return (
            <View style={[styles.loginView,{backgroundColor: UISetting.colors.defaultBackgroundColor}]}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <Image
                style={styles.loginTitleImg}
                resizeMode={'contain'}
                source={require('../../imgs/member-title.png')} />
                <UILogin
                    navigation= {this.props.navigation}
                    checkingSession={this.state.checkingSession}
                    onUserNameInput={(text)=>{this.inputUserName = text;}}
                    onPasswordInput={(text)=>{this.inputPassWord = text;}}
                    onRegisterButtonPress={()=>{ this.props.navigation.push('UserMemberReg') }}
                    onLoginButtonPress={this._onLoginStart}
                />
            </View>
        )
    }
}

export { UserMemberLogin };