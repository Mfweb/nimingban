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
import { UserCookieManager } from './pages/user-cookie-manager'
import { NewPostScreen } from './pages/new-post'
import { HistoryManager } from './pages/history-manager'
import { SettingScreen } from './pages/setting'
import { UISetting } from './modules/config'
import { FeedScreen } from './pages/feed'

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
    WebView: { screen: PinkWebView },
    // 历史
    HistoryManager: { screen: HistoryManager },
    // 订阅
    FeedScreen: { screen: FeedScreen }
}, {
    initialRouteName: 'Home',
    //顶栏配置
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: UISetting.colors.globalColor
        },
        headerTintColor: UISetting.colors.fontColor
    }
});

// 用户系统
const UserMemberStackNavigator = createStackNavigator({
    //本地饼干管理器
    UserCookieManager: { screen: UserCookieManager },
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
    //设置
    UserSetting: { screen: SettingScreen },
    //Web
    WebView: { screen: PinkWebView }
}, {
    initialRouteName: 'UserMemberLogin',
    //顶栏配置
    defaultNavigationOptions: {
        headerStyle: {
            backgroundColor: UISetting.colors.globalColor
        },
        headerTintColor: UISetting.colors.fontColor
    }
});

const AppNavigator = createDrawerNavigator({
    Home: {
        screen: MainStackNavigator,
        navigationOptions: ({ navigation }) => ({
            drawerLockMode: navigation.state.index > 0 ? 'locked-closed' : 'unlocked',
        })
    },
    UserMember: {
        screen: UserMemberStackNavigator,
        navigationOptions: ({ navigation }) => ({
            drawerLockMode: navigation.state.index > 0 ? 'locked-closed' : 'unlocked',
        })
    },
}, {
    drawerPosition: 'left',
    contentComponent: LeftDrawerNavigator,
    drawerWidth: Dimensions.get('window').width * 0.7
});

export default createAppContainer(AppNavigator);
