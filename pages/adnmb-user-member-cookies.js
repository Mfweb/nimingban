import React from 'react'
import { Text, View, Image, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { checkSession, getVerifyCode, logout, getUserCookies } from '../modules/user-member-api'

class UserMemberCookies extends React.Component {
    constructor(props) {
        super(props);
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
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                onPress={async ()=>{ 
                    await logout();
                    navigation.reset([
                        NavigationActions.navigate({
                            routeName: 'UserMemberLogin'
                        })
                    ], 0);
                 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:'#FFF'}}>退出登录</Text>
                </TouchableOpacity>
            )
        }
    }
    
    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok' || sessionInfo.session !== true) {
            this.props.navigation.reset([
                NavigationActions.navigate({
                    routeName: 'UserMemberLogin'
                })
            ], 0);
        }
        let userCookies = await getUserCookies();
        console.log(userCookies);
    }
    render() {

        return (
            <Text>
                123123
            </Text>
        );
    }
}


export { UserMemberCookies }