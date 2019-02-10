import React from 'react'
import { Text, View, Image, StyleSheet, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, register } from '../../modules/user-member-api'
import { UIButton } from '../../component/uibutton'
import { globalColor, styles } from './user-member-styles'

/**
 * 登录相关
 */
class UIReg extends React.Component {
    constructor(props) {
        super(props);
        //props:
        //checkingSession
        //onUserNameInput
        //onRegisterButtonPress
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
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    autoComplete={'username'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    onChangeText={this.props.onUserNameInput} />
                </View>

                <View style={styles.toolView1Btn}>
                    <UIButton text={'立即注册'}
                        style={styles.pinkButton}
                        textStyle={styles.pinkButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onRegisterButtonPress}/>
                </View>
            </View>
        );
    }
}

class UserMemberRegister extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalComp: null,
            showModal: false,
            checkingSession: true,
            sessionState: false,
            errmsgModal: false,
            errmsg: '',
            errtitle: '错误'
        }
    }
    inputUserName = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-注册'
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            this.setState({
                errtitle: '错误',
                errmsgModal: true,
                errmsg: `检查状态失败：${sessionInfo.errmsg}。`,
                checkingSession: false
            });
        }
        else {
            console.log('loginCheck:', sessionInfo.session);
            this.setState({
                sessionState: sessionInfo.session,
                checkingSession: false
            });
            //await logout();
        }
    }

    /**
     * 注册
     */
    _onReg = async () => {
        Keyboard.dismiss();
        if(this.inputVcode.length != 5) {
            this.setState({
                showModal: false,
            },()=>{
                this.setState({
                    errtitle: '错误',
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
        let regRes = await register(this.inputUserName, this.inputVcode);
        if(regRes.status != 'ok') {
            this.setState({
                errtitle: '错误',
                errmsgModal: true,
                errmsg: regRes.errmsg
            });
        }
        else {
            this.setState({
                errtitle: '完成',
                errmsgModal: true,
                errmsg: '邮件已发送，请检查邮箱。'
            });
        }
        this.setState({
            checkingSession: false
        });
    }
    /**
     * 开始注册（打开验证码输入窗口
     */
    _onRegStart = async () => {
        Keyboard.dismiss();
        if( (this.inputUserName.length < 5) || (this.inputUserName.indexOf('@') <= 0) ) {
            this.setState({
                errtitle: '错误',
                errmsgModal: true,
                errmsg: '账号格式错误',
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
                            source={ vcode.status == 'ok'?{ uri: `file://${vcode.path}`}:require('../../imgs/vcode-error.png') } 
                            resizeMode='contain' />
                        </TouchableOpacity>
                        <TextInput 
                        style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
                        autoFocus={true}
                        textAlignVertical='center'
                        maxLength={5}
                        returnKeyType={'done'}
                        onSubmitEditing={this._onReg}
                        onChangeText={(text) => {this.inputVcode = text;}}/>
                    </View>    
                )
            });
        });
    }
    render() {
        return (
            <View style={styles.memberView}>
               <TopModal
                    show={this.state.errmsgModal}
                    width={280}
                    title={this.state.errtitle}
                    rightButtonText={'确认'}
                    item={
                        <View style={{width: 260,  margin: 10}}>
                            <Text style={{fontSize: 20}}>{this.state.errmsg}</Text>
                        </View>
                    }
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
                    onRightButtonPress={this._onReg} />
                <Image 
                style={styles.memberTitleImg} 
                resizeMode={'contain'} 
                source={require('../../imgs/member-title.png')} />
                <UIReg
                    checkingSession={this.state.checkingSession}
                    onUserNameInput={(text)=>{this.inputUserName = text;}}
                    onRegisterButtonPress={this._onRegStart}
                />
            </View>
        )
    }
}

export { UserMemberRegister };