//修改密码
import { StyleSheet, Dimensions } from 'react-native'

const ScreenWidth = Dimensions.get('window').width;
const ScreehHeight = Dimensions.get('window').height;

const globalColor = '#fa7296';
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
        backgroundColor: '#F5F5F5'
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
        backgroundColor: '#FFF',
        paddingLeft: 10
    },
    splitLine: {
        marginLeft: 5,
        marginRight: 5,
        width: 1,
        height: 30,
        backgroundColor: globalColor
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
        backgroundColor: globalColor,
    },
    pinkButtonText: {
        color: '#FFF',
        fontSize: 24
    },
    whiteButton: {
        backgroundColor: '#FFF',
    },
    whiteButtonText: {
        color: globalColor,
        fontSize: 24
    },
    //饼干管理
    cookieList: {
        backgroundColor: '#DCDCDC',
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
        backgroundColor: '#FFF',
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cookieIDText: {
        color: globalColor,
        fontSize: 22,
        textAlign:'center',
    },
    cookieText: {
        color: globalColor,
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
        color: '#696969'
    },
    cookieUsage: {
        paddingLeft: 8,
        marginTop: 5
    },
    cookieUsageText: {
        color: '#696969',
        fontSize: 16
    },
    //登录
    loginView: {
        height: ScreehHeight,
        backgroundColor: '#F5F5F5'
    },
    loginTitleImg: {
        width: ScreenWidth,
        height: ScreenWidth / 600 * 272
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
        color: '#696969',
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
        color: '#696969',
        marginBottom: 4
    },
    authMessageRowTitle: {
        fontSize: 24,
        color: '#696969'
    },
    authMessageMobile: {
        fontSize: 24,
        color: globalColor
    },
    authMessageCode: {
        fontSize: 24,
        color: globalColor
    },
    authMessageYourMobile: {
        fontSize: 24,
        color: globalColor
    },
    authMessageExpireDate: {
        fontSize: 24,
        color: globalColor
    },

    authToolsView: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    authToolsActBtn: {
        backgroundColor: globalColor,
    },
    authToolsActBtnText: {
        color: '#FFF',
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
        color: globalColor,
        textDecorationLine: 'underline'
    }
});

export {globalColor, styles}