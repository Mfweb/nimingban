import React from 'react'
import { Text, View, Image, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import { getThreadList, getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView, ImageProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { checkSession, getVerifyCode } from '../modules/user-member-api'

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


class UserMember extends React.Component {
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

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'A岛-登录',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={navigation.openDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={navigation.openDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
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
                errmsg: sessionInfo.errmsg,
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
    _onLogin = async () => {
        this.setState({
            showModal: true
        }, ()=>{
            this._getVCode();
        });
        /*let loginSta = await checkSession();
        console.log('login:', loginSta);
        let vcode = await getVerifyCode();
        console.log(vcode);*/
    }

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
                            source={ { uri: `file://${vcode.path}`} } 
                            resizeMode='contain' />
                        </TouchableOpacity>
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
                    item={<Text style={{width: 280, fontSize: 20, margin: 10}}>{this.state.errmsg}</Text>}
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
                    }}
                    onLeftButtonPress={()=>{
                        this.setState({
                            showModal: false
                        });
                    }}
                    onRightButtonPress={()=>{
                        console.log('right press')
                    }} />
                <Image 
                style={styles.loginTitleImg} 
                resizeMode={'contain'} 
                source={require('../imgs/login-title.png')} />

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
                    onSubmitEditing={() => {this.secondTextInput.focus(); }}></TextInput>
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
                    secureTextEntry={true}></TextInput>
                </View>

                <View style={styles.toolView}>
                    <UIButton text={'注册'}
                        style={styles.regButton}
                        textStyle={styles.regButtonText}
                        showLoading={this.state.checkingSession}
                        onPress={this._onLogin}/>
                    <UIButton text={'登录'}
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        showLoading={this.state.checkingSession}
                        onPress={this._onLogin}/>
                </View>
            </View>
        )
    }
}

export { UserMember };