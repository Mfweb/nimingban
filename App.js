import React from 'react'
import { Dimensions } from 'react-native'
import { createAppContainer, createStackNavigator, createDrawerNavigator } from 'react-navigation'
import { HomeScreen } from './pages/main-page'
import { DetailsScreen } from './pages/detail-thread'
import { ImageViewer } from './pages/image-viewer'
import { LeftDrawerNavigator } from './component/left-menu-drawer'
import { PinkWebView} from './pages/webwiew'
import { UserMemberLogin } from './pages/lw-user-member/login'
import { UserMemberRegister } from './pages/lw-user-member/reg'
import { UserMemberForgotPassword } from './pages/lw-user-member/forgotpw'
import { UserMemberCookies } from './pages/lw-user-member/cookies'
import { RealNameAuth } from './pages/lw-user-member/real-name'
import { UserMemberChangePassword } from './pages/lw-user-member/change-password'
import { NewPostScreen } from './pages/new-post'
const globalColor = '#fa7296';

// 串浏览页面
const MainStackNavigator = createStackNavigator({
    //主页
    Home: { screen: HomeScreen },
    //串内容
    Details: { screen: DetailsScreen },
    //回串&发新串
    NewPostScreen: {screen: NewPostScreen},
    //图片预览
    ImageViewer: { screen: ImageViewer },
    //Web
    WebView: { screen: PinkWebView }
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
    // 用户系统登录
    UserMemberLogin: { screen: UserMemberLogin },
    //注册
    UserMemberReg: { screen: UserMemberRegister },
    //忘记密码
    UserMemberForgotPw: { screen: UserMemberForgotPassword },
    //饼干管理
    UserMemberCookies: { screen: UserMemberCookies },
    //实名认证
    UserMemberAugh: { screen: RealNameAuth },
    //修改密码
    UserMemberChangePassword: {screen: UserMemberChangePassword},
    //Web
    WebView: { screen: PinkWebView }
}, {
    initialRouteName: 'UserMemberLogin',
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
