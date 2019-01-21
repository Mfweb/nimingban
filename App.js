import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList } from './modules/network'
import { getHTMLDom } from './modules/html-decoder'
import { ListProcessView } from './component/list-process-view'
import { HomeScreen } from './pages/main-page'
import { DetailsScreen } from './pages/detail-thread'
import { ImageViewer } from './pages/image-viewer'

const globalColor = '#f45a8d';

const styles = StyleSheet.create({
    icon: {
        width: 24,
        height: 24,
    },
});



class MyNotificationsScreen extends React.Component {
    static navigationOptions = {
        drawerLabel: '这里还没完成',
        drawerIcon: ({ tintColor }) => (
            <Image
                source={require('./imgs/menu.png')}
                style={[styles.icon, { tintColor: tintColor }]}
            />
        ),
    };

    render() {
        return (
            <Button
                onPress={() => this.props.navigation.goBack()}
                title="Go back home"
            />
        );
    }
}



const MainStackNavigator = createStackNavigator({
    //主页
    Home: {
        screen: HomeScreen,
    },
    //串内容
    Details: {
        screen: DetailsScreen,
        headerBackTitle: '返回'
    },
    //图片预览
    ImageViewer: {
        screen: ImageViewer,
        headerBackTitle: '返回'
    }
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

const AppNavigator = createDrawerNavigator({
    Home: {
        screen: MainStackNavigator,
    },
    Notifications: {
        screen: MyNotificationsScreen,
    },
}, {
        drawerPosition: 'left',
    });

export default createAppContainer(AppNavigator);
