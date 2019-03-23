import RNFS from 'react-native-fs';

const configBase = {
    appMark: 'PinkAdao',
    islandList: {
        'lw': {
            displayName: 'A岛',
            logo: require('../imgs/lw.png')
        },
        'bt': {
            displayName: '备胎',
            logo: require('../imgs/bt.png')
        },
        'ld': {
            displayName: '里岛',
            logo: require('../imgs/ld.png')
        },
    }
}

const configNetwork = {
    timeout: 16000,
    apiRequestHeader : {
        'content-type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': `HavfunClient-${configBase.appMark}`
    },
    baseUrl: {
        'lw': {
            base: 'https://adnmb.com',
            useRedirect: true
        },
        'bt': {
            base: 'https://tnmb.org',
            useRedirect: false
        },
        'ld': {
            base: 'https://ldnmb.com',
            useRedirect: false
        }
    },
    apiUrl: {
        timeLine: `/Api/timeline?appid=${configBase.appMark}`,
        getForumList: `/Api/getForumList?appid=${configBase.appMark}`,
        getForumThread: `/Api/showf?appid=${configBase.appMark}`,
        getImageCDN: `/Api/getCdnPath?appid=${configBase.appMark}`,
        getThreadReply: `/Api/thread?appid=${configBase.appMark}`,
        getDetail: `/Api/ref?appid=${configBase.appMark}`,
        getCookie: `/Api/getcookie?appid=${configBase.appMark}`,
        replyThread: `/Home/Forum/doReplyThread.html?appid=${configBase.appMark}`,
        newThread: `/Home/Forum/doPostThread.html?appid=${configBase.appMark}`
    },
    memberUrl: {
        getVerifyCode: "/Member/User/Index/verify.html", //请求验证码

        memberGetTerms: "https://amember.mfweb.top/adao/member/getterms.php",//获取服务条款

        memberLogin: "/Member/User/Index/login.html",//登录
        memberLogout: "/Member/User/Index/logout.html",//退出登录
    
        memberSignup: "/Member/User/Index/sendRegister.html",//注册
        memberForgotPasswd: "/Member/User/Index/sendForgotPassword.html",//忘记密码
        memberChangePassword: "/Member/User/Index/changePassword.html",//修改密码
    
        memberCheckSession: "/Member/User/Index/index.html",//检查是Session是否有效
        memberGetCookiesList: "/Member/User/Cookie/index.html",//饼干列表
        memberDeleteCookie: "/Member/User/Cookie/delete/id/",//删除饼干
        memberGetCookieDetail: "/Member/User/Cookie/switchTo/id/",//获取饼干内容
        memberGetNewCookie: "/Member/User/Cookie/apply.html",//获取新饼干
        
        memberGetCertifiedStatus: "/Member/User/Authentication/mobile.html",//认证状态
        memberStartMobileCert: "/Member/User/Authentication/mobileReverseAuthCode",//手机认证
        memberMobileCheck: "/Member/User/Authentication/isBindMobile",//手机认证校验
        
        getAuthPhone: "https://amember.mfweb.top/adao/member/getphone.php",//获取三酱验证手机号
    }
}

const configLocal = {
    localDirectory: {
        imageCacheThumb: `${RNFS.CachesDirectoryPath}/Cache/Image/Thumb`,
        imageCacheFull: `${RNFS.DocumentDirectoryPath}/Cache/Image/Full`
    },
    localStorageName: {
        'lw': {
            memberCookie: 'MemberCookiesLW',
            forumCache: 'ForumListLW',
            forumNameCache: 'ForumNameListLW',
            userCookie: 'UserCookieLW',
            userCookieList: 'UserCookieListLW'
        },
        'bt': {
            memberCookie: 'MemberCookiesBT',
            forumCache: 'ForumListBT',
            forumNameCache: 'ForumNameListBT',
            userCookie: 'UserCookieBT',
            userCookieList: 'UserCookieListBT'
        },
        'ld': {
            memberCookie: 'MemberCookiesLD',
            forumCache: 'ForumListLD',
            forumNameCache: 'ForumNameListLD',
            userCookie: 'UserCookieLD',
            userCookieList: 'UserCookieListLD'
        }
    }
}

var configDynamic = {
    islandMode: 'lw',
    initUrlLoaded: false,
    apiRedirectURL: {
        'lw': null,
        'bt': null,
        'ld': null
    },
    forumNamecache: {
        'lw': null,
        'bt': null,
        'ld': null
    },
    imageCDNURL: {
        'lw': null,
        'bt': null,
        'ld': null,
    },
    systemCookie: {
        'lw': null,
        'bt': null,
        'ld': null,
    },
    userCookie: {
        'lw': null,
        'bt': null,
        'ld': null,
    }
}

export { configBase, configNetwork, configLocal, configDynamic }