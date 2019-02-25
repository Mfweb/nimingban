import React from 'react'
import { Text, View, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import { getUserCookieList, addUserCookieList, removeUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { UIButton } from '../component/uibutton'
import { NavigationActions } from 'react-navigation'
import { realAnonymousGetCookie } from '../modules/apis'
import { history } from '../modules/history'
const styles = StyleSheet.create({

});

class HistoryManager extends React.Component {
    constructor(props) {
        super(props);
    }
    static navigationOptions = ({ navigation }) => {
        return {
            title: '历史',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>navigation.openDrawer()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'options'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }
    componentDidMount() {
        history.init();
    }
    componentWillUnmount() {

    }

    render() {
        return (
            <View style={{flex: 1}}>

            </View>
        );
    }
}

export { HistoryManager }