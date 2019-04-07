//修改密码
import { StyleSheet, Dimensions } from 'react-native'
import { UISetting } from '../../modules/config'

const ScreenWidth = Dimensions.get('window').width;
const ScreehHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    vcode: {
        height: 52,
        width:280,
        justifyContent: 'center',
        alignItems: 'center'
    },
    memberView: {
        height: ScreehHeight,
        backgroundColor: UISetting.colors.defaultBackgroundColor
    },
    memberTitleImg: {
        width: ScreenWidth,
        height: ScreenWidth / 600 * 272
    },
    userInputView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        height: 50,
        width: ScreenWidth,
        marginTop: 2,
        backgroundColor: UISetting.colors.threadBackgroundColor,
        paddingLeft: 10
    },
    splitLine: {
        marginLeft: 5,
        marginRight: 5,
        width: 1,
        height: 30,
        backgroundColor: UISetting.colors.globalColor
    },
    userInputText: {
        width: ScreenWidth - 50,
        height: 20,
        fontSize: 20,
    },
    toolView1Btn: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: ScreenWidth,
        paddingLeft: ScreenWidth * 0.05,
        paddingRight: ScreenWidth * 0.05,
    },
    toolView2Btn: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: ScreenWidth,
        paddingLeft: ScreenWidth * 0.05,
        paddingRight: ScreenWidth * 0.05,
    },
    pinkButton: {
        backgroundColor: UISetting.colors.globalColor,
    },
    pinkButtonText: {
        color: UISetting.colors.threadBackgroundColor,
        fontSize: 24
    },
    whiteButton: {
        backgroundColor: UISetting.colors.threadBackgroundColor,
    },
    whiteButtonText: {
        color: UISetting.colors.globalColor,
        fontSize: 24
    },
    //饼干管理
    cookieList: {
        backgroundColor: UISetting.colors.defaultBackgroundColor,
    },
    cookieColumn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    cookieItem: {
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        height: 40,
        backgroundColor: UISetting.colors.threadBackgroundColor,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cookieIDText: {
        color: UISetting.colors.globalColor,
        fontSize: 22,
        textAlign:'center',
    },
    cookieText: {
        color: UISetting.colors.globalColor,
        fontSize: 22,
        textAlign:'center',     
    },
    cookieMessage: {
        padding: 4,
        backgroundColor: '#FFE4B5',
        flex: 1,
    },
    cookieMessageText: {
        fontSize: 22,
        color: UISetting.colors.lightFontColor
    },
    cookieUsage: {
        paddingLeft: 8,
        marginTop: 5
    },
    cookieUsageText: {
        color: UISetting.colors.lightFontColor,
        fontSize: 16
    },
    //登录
    loginView: {
        height: ScreehHeight,
        backgroundColor: UISetting.colors.defaultBackgroundColor
    },
    loginTitleImg: {
        width: ScreenWidth,
        height: ScreenWidth / 600 * 272
    },
    backtoUsermemberView: {
        justifyContent: 'center',
        alignItems: 'center',
        margin: 15
    },
    backtoUsermemberText: {
        fontSize: 20,
        color: UISetting.colors.linkColor,
        textDecorationLine: 'underline'
    },
    //实名认证
    countryCode: {
        width: 60,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryCodeText: {
        fontSize: 20,
        height: 20,
        color: UISetting.colors.lightFontColor,
        textAlign: 'center'
    },
    realNameUserInputText: {
        height: 20,
        fontSize: 20,
        flex: 1,
    },
    authView: {
        padding: 2,
    },
    authMessageView: {
        margin: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    authMessageText: {
        fontSize: 22,
        color: UISetting.colors.lightFontColor,
        marginBottom: 4
    },
    authMessageRowTitle: {
        fontSize: 24,
        color: UISetting.colors.lightFontColor
    },
    authMessageMobile: {
        fontSize: 24,
        color: UISetting.colors.globalColor
    },
    authMessageCode: {
        fontSize: 24,
        color: UISetting.colors.globalColor
    },
    authMessageYourMobile: {
        fontSize: 24,
        color: UISetting.colors.globalColor
    },
    authMessageExpireDate: {
        fontSize: 24,
        color: UISetting.colors.globalColor
    },

    authToolsView: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    authToolsActBtn: {
        backgroundColor: UISetting.colors.globalColor,
    },
    authToolsActBtnText: {
        color: UISetting.colors.fontColor,
        fontSize: 23
    },
    regPolicyView: {
        marginTop: 10,
        width: ScreenWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    regPolicyIcon: {

    },
    regPolicyText: {
        fontSize: 22
    },
    regPolicyTextHightL: {
        fontSize: 22,
        color: UISetting.colors.globalColor,
        textDecorationLine: 'underline'
    }
});

export {styles}