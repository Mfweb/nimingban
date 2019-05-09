import React from 'react'
import { View, Image, TextInput, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, forgotPassword } from '../../modules/api/ano/user-member'
import { UIButton } from '../../component/uibutton'
import { styles } from './user-member-styles'
import { UISetting } from '../../modules/config'

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
                <View style={[styles.userInputView,{backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                    <Icon name={'user'} size={24} color={UISetting.colors.globalColor} />
                    <View style={[styles.splitLine,{backgroundColor: UISetting.colors.globalColor}]}></View>
                    <TextInput
                    style={[styles.userInputText, {color: UISetting.colors.lightFontColor}]}
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
                        backgroundColor={UISetting.colors.globalColor}
                        textColor={UISetting.colors.threadBackgroundColor}
                        fontSize={22}
                        width="60%"
                        show={true}
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
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: 'A岛-找回密码'
        }
    }

    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            this.TopModal.showMessage('错误', `检查状态失败：${sessionInfo.errmsg}。`,'确认');
            this.setState({
                checkingSession: false
            });
        }
        else {
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
            this.TopModal.showMessage('错误', `验证码长度错误`,'确认');
            return;
        }
        this.setState({
            checkingSession: true
        });
        let forgetRes = await forgotPassword(this.inputUserName, this.inputVcode);
        if(forgetRes.status != 'ok') {
            this.TopModal.showMessage('错误', forgetRes.errmsg,'确认');
        }
        else {
            this.TopModal.showMessage('完成', '邮件已发送，请检查邮箱。','确认');
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
            this.TopModal.showMessage('错误','账号格式错误','确认');
            return;
        }
        this._getVCode(()=>{
            Keyboard.dismiss();
            this.TopModal.closeModal(async ()=>{
                await this._onFindPW();
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
            <View style={[styles.memberView, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}>
               <TopModal ref={(ref)=>{this.TopModal=ref;}} />
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