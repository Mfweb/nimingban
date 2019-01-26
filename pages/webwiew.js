import React, { Component } from 'react'
import { Text, Button, View, TouchableOpacity, StyleSheet, Linking, WebView } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList, getImageCDN } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView } from '../component/list-process-view'
import { HomeScreen } from '../pages/main-page'
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