import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, TextInput, Dimensions, TouchableOpacity } from 'react-native'
import { getThreadList, getImage } from '../modules/network'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView, ImageProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
const globalColor = '#fa7296';
const styles = StyleSheet.create({
    loginView: {
        height: Dimensions.get('window').height,
        backgroundColor: '#F5F5F5'
    },
    loginTitleImg: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').width / 546 * 338
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

class UserMember extends React.Component {
    constructor(props) {
        super(props);
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: '登录',
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

    render() {
        return (
            <View style={styles.loginView}>
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
                    <TouchableOpacity style={ [styles.toolButton, styles.regButton] }>
                        <Text style={styles.regButtonText}>
                            注册
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={ [styles.toolButton, styles.loginButton] }>
                        <Text style={styles.loginButtonText}>
                            登录
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

export { UserMember };