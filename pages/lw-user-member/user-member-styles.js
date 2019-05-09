//修改密码
import { StyleSheet, Dimensions } from 'react-native'
import { UISetting } from '../../modules/config'

const ScreenWidth = Dimensions.get('window').width;
const ScreehHeight = Dimensions.get('window').height;

var styles = {
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
        height: ScreehHeight
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
        paddingLeft: 10
    },
    splitLine: {
        marginLeft: 5,
        marginRight: 5,
        width: 1,
        height: 30
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
    //饼干管理
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
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cookieIDText: {
        fontSize: 22,
        textAlign:'center',
    },
    cookieText: {
        fontSize: 22,
        textAlign:'center',
    },
    cookieMessage: {
        padding: 4,
        backgroundColor: '#FFE4B5',
        flex: 1,
    },
    cookieMessageText: {
        fontSize: 22
    },
    cookieUsage: {
        paddingLeft: 8,
        marginTop: 5
    },
    cookieUsageText: {
        fontSize: 16
    },
    //登录
    loginView: {
        height: ScreehHeight
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
        marginBottom: 4
    },
    authMessageRowTitle: {
        fontSize: 24
    },
    authMessageMobile: {
        fontSize: 24
    },
    authMessageCode: {
        fontSize: 24
    },
    authMessageYourMobile: {
        fontSize: 24
    },
    authMessageExpireDate: {
        fontSize: 24
    },

    authToolsView: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
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
        textDecorationLine: 'underline'
    }
};

export {styles}