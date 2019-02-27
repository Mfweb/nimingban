import React from 'react'
import { View, Image, TextInput, Keyboard } from 'react-native'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, changePassword, logout } from '../../modules/user-member-api'
import { UIButton } from '../../component/uibutton'
import { globalColor, styles } from './user-member-styles'
/**
 * 修改密码
 */
class UIChangePassword extends React.Component {
    constructor(props) {
        super(props);
        //props:
        //checkingSession
        //onOldPasswordInput
        //onNewPasswordInput1
        //onNewPasswordInput2
        //onChangeButtonPress
    }

    render() {
        return (
            <View style={this.props.style}>
                <View style={styles.userInputView}>
                    <Icon name={'lock'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TextInput 
                    style={styles.userInputText}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'email-address'}
                    placeholder={'旧密码'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    autoComplete={'username'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    secureTextEntry={true}
                    onSubmitEditing={() => {this.newPasswordInput1.focus(); }}
                    onChangeText={this.props.onOldPasswordInput} />
                </View>
                <View style={styles.userInputView}>
                    <Icon name={'lock'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TextInput 
                    ref={(input) => { this.newPasswordInput1 = input; }}
                    style={styles.userInputText}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'email-address'}
                    placeholder={'新密码'}
                    returnKeyType={'next'}
                    blurOnSubmit={false}
                    autoComplete={'username'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    secureTextEntry={true}
                    onSubmitEditing={() => {this.newPasswordInput2.focus(); }}
                    onChangeText={this.props.onNewPasswordInput1} />
                </View>
                <View style={styles.userInputView}>
                    <Icon name={'lock'} size={24} color={globalColor} />
                    <View style={styles.splitLine}></View>
                    <TextInput 
                    ref={(input) => { this.newPasswordInput2 = input; }}
                    style={styles.userInputText}
                    autoCapitalize={'none'}
                    clearButtonMode={'always'}
                    keyboardType={'email-address'}
                    placeholder={'再输一次'}
                    returnKeyType={'done'}
                    blurOnSubmit={false}
                    autoComplete={'username'}
                    editable={!this.props.checkingSession}
                    enablesReturnKeyAutomatically={false}
                    secureTextEntry={true}
                    onSubmitEditing={this.props.onChangeButtonPress}
                    onChangeText={this.props.onNewPasswordInput2} />
                </View>
                <View style={styles.toolView1Btn}>
                    <UIButton text={'修改密码'}
                        style={styles.pinkButton}
                        textStyle={styles.pinkButtonText}
                        showLoading={this.props.checkingSession}
                        onPress={this.props.onChangeButtonPress}/>
                </View>
            </View>
        );
    }
}

class UserMemberChangePassword extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalComp: null,
            showModal: false,
            checkingSession: true,
            sessionState: false,
        }
    }
    inputOldPassword = ''
    inputNewPassword1 = ''
    inputNewPassword2 = ''
    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-修改密码'
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok') {
            this.TopModal.showMessage(`请求数据失败:${res}`,'确认');
            this.setState({
                checkingSession: false
            });
        }
        else {
            this.setState({
                sessionState: sessionInfo.session,
                checkingSession: false
            });
        }
    }

    /**
     * 开始改密码
     */
    _onChangeStart = async () => {
        Keyboard.dismiss();
        if( this.inputOldPassword.length < 5) {
            this.TopModal.showMessage('错误', `旧密码长度太短`,'确认');
            return;
        }
        if(this.inputNewPassword1 !== this.inputNewPassword2) {
            this.TopModal.showMessage('错误', `新密码输入不相同`,'确认');
            return;
        }
        if(this.inputNewPassword1.length < 5) {
            this.TopModal.showMessage('错误', `新密码长度太短`,'确认');
            return; 
        }
        this.setState({checkSession: true}, async ()=>{
            let info = await changePassword(this.inputOldPassword,this.inputNewPassword1,this.inputNewPassword2);
            if(info.status == 'ok') {
                await logout();
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberLogin'
                    })
                ], 0);
            }
            else {
                this.TopModal.showMessage('错误', info.errmsg,'确认');
                this.setState({
                    checkSession: false
                });
            }
        });
    }

   
    render() {
        return (
            <View style={styles.memberView}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <Image 
                style={styles.memberTitleImg} 
                resizeMode={'contain'} 
                source={require('../../imgs/member-title.png')} />
                <UIChangePassword
                    checkingSession={this.state.checkingSession}
                    onOldPasswordInput={(text) => {this.inputOldPassword = text}}
                    onNewPasswordInput1={(text) => {this.inputNewPassword1 = text}}
                    onNewPasswordInput2={(text) => {this.inputNewPassword2 = text}}
                    onChangeButtonPress={this._onChangeStart}
                />
            </View>
        )
    }
}

export { UserMemberChangePassword };