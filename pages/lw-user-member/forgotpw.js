import React from 'react'
import { View, Image, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../../component/top-modal'
import { checkSession, getVerifyCode, forgotPassword } from '../../modules/user-member-api'
import { UIButton } from '../../component/uibutton'
import { globalColor, styles } from './user-member-styles'

/**
 * 忘记密码
 */
class UIForgetPw extends React.Component {
    constructor(props) {
        super(props);
        //props:
        //checkingSession
        //onUserNameInput
        //onFindButtonPress
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
                    <UIButton text={'找回密码'}
                        style={styles.pinkButton}
                        textStyle={styles.pinkButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onFindButtonPress}/>
                </View>
            </View>
        );
    }
}

class UserMemberForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkingSession: true,
            sessionState: false,
        }
    }
    inputUserName = ''
    inputVcode = ''
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-找回密码'
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', `检查状态失败：${sessionInfo.errmsg}。`,'确认');
            this.setState({
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
     * 找回密码
     */
    _onFindPW = async () => {
        Keyboard.dismiss();
        if(this.inputVcode.length != 5) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', `验证码长度错误`,'确认');  
            return;
        }
        this.setState({
            checkingSession: true
        });
        let forgetRes = await forgotPassword(this.inputUserName, this.inputVcode);
        if(forgetRes.status != 'ok') {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', forgetRes.errmsg,'确认');
        }
        else {
            TopModalApis.showMessage(this.refs['msgBox'], '完成', '邮件已发送，请检查邮箱。','确认');
        }
        this.setState({
            checkingSession: false
        });
    }
    /**
     * 开始找回密码（打开验证码输入窗口
     */
    _onFindStart = () => {
        Keyboard.dismiss();
        if( (this.inputUserName.length < 5) || (this.inputUserName.indexOf('@') <= 0) ) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误','账号格式错误','确认');
            return;
        }
        this._getVCode(()=>{
            Keyboard.dismiss();
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                await this._onFindPW();
            });
        });
    }
    /**
     * 获取验证码
     */
    _getVCode = (checkCallback) => {
        TopModalApis.showMessage(this.refs['msgBox'], '输入验证码',
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
        ), '确认', ()=>checkCallback(), '取消', ()=>{Keyboard.dismiss();TopModalApis.closeModal(this.refs['msgBox']);},
        async () => {
            let vcode = await getVerifyCode();
            TopModalApis.setContent(this.refs['msgBox'], (
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
                    style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
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
            <View style={styles.memberView}>
               <TopModal ref={'msgBox'} />
                <Image 
                style={styles.memberTitleImg} 
                resizeMode={'contain'} 
                source={require('../../imgs/member-title.png')} />
                <UIForgetPw
                    checkingSession={this.state.checkingSession}
                    onUserNameInput={(text)=>{this.inputUserName = text;}}
                    onFindButtonPress={this._onFindStart}
                />
            </View>
        )
    }
}

export { UserMemberForgotPassword };