import React from 'react'
import { Text, View, Image, FlatList, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import {
    checkSession,
    getVerifyCode,
    logout,
    getUserCookies,
    deleteUserCookie,
    getNewUserCookie,
    getVerifiedInfo,
    getEnableUserCookie
} from '../../modules/api/ano/user-member'
import { UIButton } from '../../component/uibutton'
import { ActionSheet } from '../../component/action-sheet'
import { styles } from './user-member-styles'
import { Header } from 'react-navigation';
import { UISetting } from '../../modules/config'

class UserMemberCookies extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            actionSheet: {
                show: false,
                top: 0,
                left: 0,
                title: '',
                items: [],
                closedCallback: null,
                onItemPress: null
            },
            userCookies: [],
            cookieListLoading: true,
            userInfo: {
                cookieMax: '',
                userIcon: '',
                userWarn: '',
                verified: false,
            }
        };
    }

    static navigationOptions = ({ navigation }) => {
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: 'A岛-饼干槽',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>{Keyboard.dismiss();navigation.openDrawer();}} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }}
                onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'options'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount = async () => {
        let sessionInfo = await checkSession();
        if(sessionInfo.status != 'ok' || sessionInfo.session !== true) {
            this.props.navigation.reset([
                NavigationActions.navigate({
                    routeName: 'UserMemberLogin'
                })
            ], 0);
        }
        else {
            await this._pullDownRefreshing();
        }
        this.props.navigation.setParams({ showRightMenu: this._showRightMenu })
    }

    /**
     * 打开实名认证页面
     */
    _showRealName = () => {
        this.props.navigation.reset([
            NavigationActions.navigate({
                routeName: 'UserMemberAugh'
            })
        ], 0);
    }
    /**
     * 显示右侧菜单
     */
    _showRightMenu = () => {
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, '详细菜单',
            [
                '获取新饼干',
                '实名认证信息',
                '修改密码',
                '本地饼干管理器',
                '退出登录'
            ],
            (index) => {
                this.ActionSheet.closeActionSheet(()=>{
                    switch(index) {
                        case 0:
                        this._getNewCookie();
                        break;
                        case 1:
                        this._getVerifiedInfo();
                        break;
                        case 2:
                        this.props.navigation.push('UserMemberChangePassword')
                        break;
                        case 3:
                        this.props.navigation.reset([
                            NavigationActions.navigate({
                                routeName: 'UserCookieManager'
                            })
                        ], 0);
                        break;
                        case 4:
                        this._logout();
                        break;
                    }
                });
            });
    }

    /**
     * 获取名认证信息
     */
    _getVerifiedInfo = () => {
        this.TopModal.showMessage('实名信息',
        (
            <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
                <ImageProcessView
                height={25}
                width={25} />
            </View>
        ), '确认', ()=>this.TopModal.closeModal(), null, null, async ()=>{
            let info = await getVerifiedInfo();
            if(info.status == 'error') {
                this.TopModal.setContent('获取错误');
            }
            else {
                this.TopModal.setContent((
                    <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 22, color:UISetting.colors.lightFontColor}}>
                            {info.info.statusString}
                        </Text>
                        <Text style={{fontSize: 22, color:UISetting.colors.lightFontColor}}>
                            {info.info.phoneNumber}
                        </Text>
                    </View>
                ));
            }
        });
    }
    /**
     * 退出登录
     */
    _logout = () => {
        this.TopModal.showMessage('提示', '确认退出？', '确认', async () => {
            await logout();
            this.TopModal.closeModal(() => {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberLogin'
                    })
                ], 0);
            });
        }, '取消');
    }

    /**
     * 获取并应用一个饼干
     */
    _enableCookie = async (item) => {
        let sta = await getEnableUserCookie(item.id, item.value);
        if(sta.status == 'ok') {
            this.TopModal.showMessage('提示', '应用成功','确认');
        }
        else {
            this.TopModal.showMessage('提示', sta.errmsg,'确认');
        }
    }
    inputVcode = '';
    /**
     * 删除饼干
     */
    _deleteCookie = (id) => {
        this.inputVcode = '';
        this._getVCode(() => {
            Keyboard.dismiss();
            this.TopModal.closeModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.TopModal.showMessage('错误', '验证码输入错误','确认');
                }
                else {
                    let deleteRes = await deleteUserCookie(id, this.inputVcode);
                    if(deleteRes.status != 'ok') {
                        this.TopModal.showMessage('错误', deleteRes.errmsg,'确认');
                    }
                    else {
                        this._pullDownRefreshing();
                    }
                }
            });
        });
    }
    /**
     * 获取新饼干
     */
    _getNewCookie = () => {
        this.inputVcode = '';
        this._getVCode(() => {
            Keyboard.dismiss();
            this.TopModal.closeModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.TopModal.showMessage('错误', '验证码输入错误','确认');
                }
                else {
                    let newRes = await getNewUserCookie(this.inputVcode);
                    if(newRes.status != 'ok') {
                        this.TopModal.showMessage('错误', newRes.errmsg,'确认');
                    }
                    else {
                        this._pullDownRefreshing();
                    }
                }
            });
        });
    }
    /**
     * 获取验证码
     */
    _getVCode = (checkCallback) => {
        this.TopModal.showMessage('输入验证码',
        (
            <View style={{width: 280, height: 100}}>
                <TouchableOpacity
                style={styles.vcode}
                onPress={()=>this._getVCode(checkCallback)}>
                    <ImageProcessView
                    height={25}
                    width={25} />
                </TouchableOpacity>
            </View>
        ), '确认', ()=>checkCallback(), '取消', ()=>{Keyboard.dismiss();this.TopModal.closeModal();},
        async () => {
            let vcode = await getVerifyCode();
            this.TopModal.setContent((
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity style={styles.vcode}
                    onPress={()=>this._getVCode(checkCallback)}>
                        <Image style={{
                            width: 280, height: 50,top: 0
                        }}
                        source={ vcode.status == 'ok'?{ uri: `file://${vcode.path}`}:require('../../imgs/vcode-error.png') }
                        resizeMode='contain' />
                    </TouchableOpacity>
                    <TextInput
                    style={{flex:1, fontSize: 24, width: 280, textAlign:'center', color: UISetting.colors.lightFontColor}}
                    autoFocus={true}
                    textAlignVertical='center'
                    maxLength={5}
                    returnKeyType={'done'}
                    onSubmitEditing={()=>checkCallback()}
                    onChangeText={(text) => {this.inputVcode = text;}}/>
                </View>
                )
            );
        });
    }

    _headerComponent = () => {
        return (
            <View style={this.state.userInfo.userWarn?styles.cookieMessage:styles.displayNone}>
                <Text style={[styles.cookieMessageText,{color: UISetting.colors.lightFontColor}]}>
                {this.state.userInfo.userWarn}
                </Text>
            </View>
        );
    }
    _footerComponent = () => {
        return (
            <View style={styles.cookieUsage}>
                <Text style={[styles.cookieUsageText,{color: UISetting.colors.lightFontColor}]}>
                    饼干槽: {this.state.userInfo.cookieMax}
                </Text>
            </View>
        );
    }
    _renderItem = ({item}) =>{
        return (
            <View style={[styles.cookieItem,{backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                <View style={styles.cookieColumn}>
                    <Text style={[styles.cookieIDText,{color: UISetting.colors.globalColor}]}>
                        {item.id}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <Text style={[styles.cookieText, {color: UISetting.colors.lightFontColor}]}>
                        {item.value}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <UIButton
                    text={'删除'}
                    backgroundColor={UISetting.colors.defaultBackgroundColor}
                    textColor={UISetting.colors.globalColor}
                    fontSize={18}
                    width="45%"
                    show={true}
                    showLoading={false}
                    onPress={()=>this._deleteCookie(item.id)}
                    />
                    <UIButton
                    text={'应用'}
                    backgroundColor={UISetting.colors.globalColor}
                    textColor={UISetting.colors.threadBackgroundColor}
                    fontSize={18}
                    width="45%"
                    show={true}
                    showLoading={false}
                    onPress={()=>this._enableCookie(item)}
                    />
                </View>
            </View>
        );
    }
    render() {
        return (
            <View style={{flex: 1}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <FlatList
                    data={this.state.userCookies}
                    extraData={this.state}
                    style={{backgroundColor: UISetting.colors.defaultBackgroundColor}}
                    onRefresh={this._pullDownRefreshing}
                    refreshing={this.state.cookieListLoading}
                    keyExtractor={(item, index) => {return item.id.toString()}}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._headerComponent}
                    ListFooterComponent={this._footerComponent}
                />
            </View>
        );
    }
    _pullDownRefreshing = async () => {
        this.setState({
            cookieListLoading: true
        }, async () => {
            let userCookies = await getUserCookies();
            if(userCookies.status != 'ok') {
                this.setState({
                    cookieListLoading: false,
                });
                if(userCookies.errmsg == '本页面需要实名后才可访问_(:з」∠)_') {
                    this._showRealName();
                }
                else {
                    this.TopModal.showMessage('错误', userCookies.errmsg,'确认');
                }
            }
            else {
                this.setState({
                    cookieListLoading: false,
                    userCookies: userCookies.res.cookies,
                    userInfo: {
                        cookieMax: userCookies.res.info.capacity,
                        userIcon: userCookies.res.info.userIco,
                        userWarn: userCookies.res.info.warning,
                        verified: true
                    }
                });
            }
        });
    }
}


export { UserMemberCookies }