import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, SectionList, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList } from './modules/network'
import { getHTMLDom } from './modules/html-decoder'
import { ListProcessView } from './component/list-process-view'
import { HomeScreen } from './pages/main-page'
import { DetailsScreen } from './pages/detail-thread'
import { ImageViewer } from './pages/image-viewer'
import { LeftDrawerNavigator } from './component/left-menu-drawer'
import { PinkWebView} from './pages/webwiew'
import { UserMember } from './pages/adnmb-user-member-login'

const globalColor = '#fa7296';

// 串浏览页面
const MainStackNavigator = createStackNavigator({
    //主页
    Home: { screen: HomeScreen },
    //串内容
    Details: { screen: DetailsScreen, headerBackTitle: '返回' },
    //图片预览
    ImageViewer: { screen: ImageViewer, headerBackTitle: '返回' },
    //Web
    WebView: { screen: PinkWebView, headerBackTitle: '返回' }
}, {
    initialRouteName: 'Home',
    //顶栏配置
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: globalColor
        },
        headerTintColor: '#ffffff'
    }
});

// 用户系统
const UserMemberStackNavigator = createStackNavigator({
    //主页
    UserMemberHome: { screen: UserMember },
}, {
    initialRouteName: 'UserMemberHome',
    //顶栏配置
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: globalColor
        },
        headerTintColor: '#ffffff'
    }
});

const AppNavigator = createDrawerNavigator({
    Home: {
        screen: MainStackNavigator
    },
    UserMember: {
        screen: UserMemberStackNavigator
    },
}, {
    drawerPosition: 'left',
    contentComponent: LeftDrawerNavigator,
    drawerWidth: Dimensions.get('window').width * 0.7
});

export default createAppContainer(AppNavigator);
