import React from 'react'
import { Text, View, Image, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { checkSession, getVerifyCode, login } from '../modules/user-member-api'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    vcode: {
        height: 52,
        width:280,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginView: {
        height: Dimensions.get('window').height,
        backgroundColor: '#F5F5F5'
    },
    loginTitleImg: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width / 600 * 272
    },
    userInputView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 50,
        width: Dimensions.get('window').width,
        marginTop: 2,
        backgroundColor: '#FFF',
        paddingLeft: 10
    },
    splitLine: {
        marginLeft: 5,
        marginRight: 5,
        width: 1,
        height: 30,
        backgroundColor: globalColor
    },
    userInputText: {
        width: Dimensions.get('window').width - 50,
        height: 20,
        fontSize: 20,
    },
    toolView: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        paddingLeft: Dimensions.get('window').width * 0.05,
        paddingRight: Dimensions.get('window').width * 0.05,
    },
    toolButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: Dimensions.get('window').width / 2.5,
        borderRadius: 8
    },
    regButton: {
        backgroundColor: '#FFF',
    },
    regButtonText: {
        color: globalColor,
        fontSize: 24
    },
    loginButton: {
        backgroundColor: globalColor,
    },
    loginButtonText: {
        color: '#FFF',
        fontSize: 24
    }
});

/**
 * 粉色或白色按钮
 */
class UIButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if(this.props.showLoading) {
            return (
                <View style={ [styles.toolButton, {opacity: 0.3}].concat(this.props.style) } >
                    <ImageProcessView height={25} width={25} />
                    <Text style={this.props.textStyle}>
                        {this.props.text}
                    </Text>
                </View>
            )
        }
        else {
            return (
                <TouchableOpacity 
                    style={ [styles.toolButton, {opacity: 1}].concat(this.props.style) } 
                    activeOpacity={0.5}
                    onPress={this.props.onPress}>
                    <Text style={this.props.textStyle}>
                        {this.props.text}
                    </Text>
                </TouchableOpacity>
            )
        }
    }
}

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
                <View style={styles.userInputView}>
                    <Icon name={'user'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TextInput 
                    style={styles.userInputText}
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
                
                <View style={styles.userInputView}>
                    <Icon name={'lock'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TextInput 
                    ref={(input) => { this.secondTextInput = input; }}
                    style={styles.userInputText}
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

                <View style={styles.toolView}>
                    <UIButton text={'注册'}
                        style={styles.regButton}
                        textStyle={styles.regButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onRegisterButtonPress}/>
                    <UIButton text={'登录'}
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onLoginButtonPress}/>
                </View>
            </View>
        );
    }
}

class UserMemberLogin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalComp: null,
            showModal: false,
            checkingSession: true,
            sessionState: false,
            errmsgModal: false,
            errmsg: ''
        }
    }
    inputUserName = ''
    inputPassWord = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-登录',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={navigation.openDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                onPress={()=>{ navigation.push('UserMemberForgotPw') }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:'#FFF'}}>忘记密码</Text>
                </TouchableOpacity>
            )
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            this.setState({
                errmsgModal: true,
                errmsg: `检查状态失败：${sessionInfo.errmsg}，可能导致无法正常登录。`,
                checkingSession: false
            });
        }
        else {
            console.log('loginCheck:', sessionInfo.session);
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
            this.setState({
                showModal: false,
            },()=>{
                this.setState({
                    errmsgModal: true,
                    errmsg: '验证码长度错误',
                });      
            });
            return;
        }
        this.setState({
            showModal: false,
            checkingSession: true
        });
        let loginRes = await login(this.inputUserName, this.inputPassWord, this.inputVcode);
        if(loginRes.status != 'ok') {
            this.setState({
                errmsgModal: true,
                errmsg: loginRes.errmsg,
                checkingSession: false
            });
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
            this.setState({
                errmsgModal: true,
                errmsg: '账号格式错误',
            });
            return;
        }
        if( this.inputPassWord.length < 5 ) {
            this.setState({
                errmsgModal: true,
                errmsg: '密码格式错误',
            });
            return; 
        }
        this.setState({
            showModal: true
        }, ()=>{
            this._getVCode();
        });
    }

    /**
     * 获取验证码
     */
    _getVCode = async () => {
        this.setState({
            modalComp: (
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity 
                    style={styles.vcode}
                    onPress={this._getVCode}>
                        <ImageProcessView 
                        height={25} 
                        width={25} />
                    </TouchableOpacity>
                </View>    
            )
        }, async () => {
            let vcode = await getVerifyCode();
            this.setState({
                modalComp: (
                    <View style={{width: 280, height: 100}}>
                        <TouchableOpacity style={styles.vcode}
                        onPress={this._getVCode}>
                            <Image style={{
                                width: 280, height: 50,top: 0
                            }} 
                            source={ vcode.status == 'ok'?{ uri: `file://${vcode.path}`}:require('../imgs/vcode-error.png') } 
                            resizeMode='contain' />
                        </TouchableOpacity>
                        <TextInput 
                        style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                        autoFocus={true}
                        textAlignVertical='center'
                        maxLength={5}
                        returnKeyType={'done'}
                        onSubmitEditing={this._onLogin}
                        onChangeText={(text) => {this.inputVcode = text;}}/>
                    </View>    
                )
            });
        });
    }
    render() {
        return (
            <View style={styles.loginView}>
               <TopModal
                    show={this.state.errmsgModal}
                    width={280}
                    title={'错误'}
                    rightButtonText={'确认'}
                    item={<Text style={{width: 260, fontSize: 20, margin: 10}}>{this.state.errmsg}</Text>}
                    onClosePress={()=>{
                        this.setState({
                            errmsgModal: false
                        });
                    }}
                    onRightButtonPress={()=>{
                        this.setState({
                            errmsgModal: false
                        });
                    }} />

                <TopModal
                    show={this.state.showModal}
                    width={280}
                    top={-100}
                    title={'输入验证码'}
                    leftButtonText={'取消'}
                    rightButtonText={'确认'}
                    item={this.state.modalComp}
                    onClosePress={()=>{
                        this.setState({
                            showModal: false
                        });
                        Keyboard.dismiss();
                    }}
                    onLeftButtonPress={()=>{
                        this.setState({
                            showModal: false
                        });
                        Keyboard.dismiss();
                    }}
                    onRightButtonPress={this._onLogin} />
                <Image 
                style={styles.loginTitleImg} 
                resizeMode={'contain'} 
                source={require('../imgs/member-title.png')} />
                <UILogin
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