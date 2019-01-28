import React, { Component } from 'react'
import { TouchableOpacity, Linking, WebView } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

class PinkWebView extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam('title', 'Web'),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={() => {
                    Linking.openURL(navigation.getParam('URL', 'https://mfweb.top/'));
                }} underlayColor={'#ffafc9'} activeOpacity={0.5}>
                    <Icon name={'compass'} size={24} color={'#FFF'}/>
                </TouchableOpacity>
            )
        };
    };
    
    render() {
        let url = this.props.navigation.getParam('URL', 'https://mfweb.top/');
        return (
            <WebView style={{flex:1}} source={{uri: url}} onNavigationStateChange={
                (res) => {
                    this.props.navigation.setParams( {'title': res.title });
                }
            }/>
        );
    }
}

export { PinkWebView }