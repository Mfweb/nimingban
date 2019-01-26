import { AsyncStorage } from 'react-native'
import RNFS from 'react-native-fs';
import {apiFunctions } from './apis'

const memberApiURLs = {
    verifyCode: "/Member/User/Index/verify.html", //请求验证码
    LoginURL: "/Member/User/Index/login.html",//登录
    SignupURL: "/Member/User/Index/sendRegister.html",//注册
    ForgotURL: "/Member/User/Index/sendForgotPassword.html",//忘记密码
    CheckSessionURL: "/Member/User/Index/index.html",//检查是Session是否有效
    CookiesListURL: "/Member/User/Cookie/index.html",//饼干列表
    CookieDeleteURL: "/Member/User/Cookie/delete/id/",//删除饼干
    CookieGetQRURL: "/Member/User/Cookie/export/id/",//获取饼干二维码
    CookieGetDetailURL: "/Member/User/Cookie/switchTo/id/",//获取饼干内容
    CookieGetNewURL: "/Member/User/Cookie/apply.html",//获取新饼干
    CertifiedStatusURL: "/Member/User/Authentication/mobile.html",//认证状态
    MobileCertURL: "/Member/User/Authentication/mobileReverseAuthCode",//手机认证
    MobileCheckURL: "/Member/User/Authentication/isBindMobile",//手机认证校验
    ChangePasswordURL: "/Member/User/Index/changePassword.html",//修改密码
    GetAuthPhoneURL: "/adao/member/getphone.php",//获取三酱验证手机号
}

