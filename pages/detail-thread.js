import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList } from '../modules/network'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView } from '../component/list-process-view'
import { HomeScreen } from '../pages/main-page'

class DetailsScreen extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: navigation.getParam('title', '无标题')
        };
    };

    render() {
        let tid = this.props.navigation.getParam('tid', '-1');
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>{tid}</Text>
            </View>
        );
    }
}

export { DetailsScreen }