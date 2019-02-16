import React from 'react'
import { Text, View, Image, StyleSheet, Picker, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../../component/top-modal'
import { checkSession, getVerifyCode, logout, getUserCookies, deleteUserCookie, getNewUserCookie, getVerifiedInfo, getEnableUserCookie } from '../../modules/user-member-api'
import { FlatList } from 'react-native-gesture-handler';
import { UIButton } from '../../component/uibutton'
import { ActionSheet } from '../../component/action-sheet'
import { globalColor, styles } from './user-member-styles'
import { Header } from 'react-navigation';

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
            title: 'A岛-饼干槽',
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>{Keyboard.dismiss();navigation.openDrawer();}} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'options-vertical'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }

    /**
     * 关闭ActionSheet
     */
    closeActionSheet = (callback = ()=>{}) => {
        let tempObj = {
            show: false,
            top: this.state.actionSheet.top,
            left: this.state.actionSheet.left,
            title: this.state.actionSheet.title,
            items: this.state.actionSheet.items,
            closedCallback: ()=>callback(),
            onItemPress: null
        }
        this.setState({
            actionSheet: tempObj
        });
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
        this.setState({
            actionSheet: {
                show: true,
                top: Header.HEIGHT,
                left: Dimensions.get('window').width,
                title: '详细菜单',
                items: [
                    '获取新饼干',
                    '实名认证信息',
                    '修改密码',
                    '退出登录'
                ],
                onItemPress:(index) => {
                    this.closeActionSheet(()=>{
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
                            this._logout();
                            break;
                        }
                    });
                }
            }
        });
    }

    /**
     * 获取名认证信息
     */
    _getVerifiedInfo = () => {
        TopModalApis.showMessage(this.refs['msgBox'], '实名信息', 
        (
            <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
                <ImageProcessView 
                height={25} 
                width={25} />
            </View>
        ), '确认', ()=>TopModalApis.closeModal(this.refs['msgBox']), null, null, async ()=>{
            let info = await getVerifiedInfo();
            if(info.status == 'error') {
                TopModalApis.setContent(this.refs['msgBox'], '获取错误');
            }
            else {
                TopModalApis.setContent(this.refs['msgBox'], 
                (
                    <View style={{height: 100, justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{fontSize: 22, color:'#696969'}}>
                            {info.info.statusString}
                        </Text>
                        <Text style={{fontSize: 22, color:'#696969'}}>
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
        TopModalApis.showMessage(this.refs['msgBox'], '提示', '确认退出？', '确认', async () => {
            await logout();
            TopModalApis.closeModal(this.refs['msgBox'], () => {
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
    _enableCookie = async (id) => {
        let sta = await getEnableUserCookie(id);
        if(sta.status == 'ok') {
            TopModalApis.showMessage(this.refs['msgBox'], '提示', '应用成功','确认');
        }
        else {
            TopModalApis.showMessage(this.refs['msgBox'], '提示', sta.errmsg,'确认');
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
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                if(this.inputVcode.length != 5) {
                    TopModalApis.showMessage(this.refs['msgBox'], '错误', '验证码输入错误','确认');
                }
                else {
                    let deleteRes = await deleteUserCookie(id, this.inputVcode);
                    if(deleteRes.status != 'ok') {
                        TopModalApis.showMessage(this.refs['msgBox'], '错误', deleteRes.errmsg,'确认');
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
            TopModalApis.closeModal(this.refs['msgBox'], async ()=>{
                if(this.inputVcode.length != 5) {
                    TopModalApis.showMessage(this.refs['msgBox'], '错误', '验证码输入错误','确认');
                }
                else {
                    let newRes = await getNewUserCookie(this.inputVcode);
                    if(newRes.status != 'ok') {
                        TopModalApis.showMessage(this.refs['msgBox'], '错误', newRes.errmsg,'确认');
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
        TopModalApis.showMessage(this.refs['msgBox'], '输入验证码',
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
        ), '确认', ()=>checkCallback(), '取消', ()=>{Keyboard.dismiss();TopModalApis.closeModal(this.refs['msgBox']);},
        async () => {
            let vcode = await getVerifyCode();
            TopModalApis.setContent(this.refs['msgBox'], (
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
                    style={{flex:1, fontSize: 24, width: 280, textAlign:'center'}}
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
                <Text style={styles.cookieMessageText}>
                {this.state.userInfo.userWarn}
                </Text>
            </View>
        );
    }
    _footerComponent = () => {
        return (
            <View style={styles.cookieUsage}>
                <Text style={styles.cookieUsageText}>
                    饼干槽: {this.state.userInfo.cookieMax}
                </Text>
            </View>
        );
    }
    _renderItem = ({item}) =>{
        return (
            <View style={styles.cookieItem}>
                <View style={styles.cookieColumn}>
                    <Text style={styles.cookieIDText}>
                        {item.id}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <Text style={styles.cookieText}>
                        {item.value}
                    </Text>
                </View>

                <View style={styles.cookieColumn}>
                    <UIButton
                    text={'删除'}
                    style={{backgroundColor: '#DCDCDC', width: 45, height: 30}}
                    textStyle={{color:globalColor, fontSize: 19}}
                    showLoading={false}
                    onPress={()=>this._deleteCookie(item.id)}
                    />
                    <UIButton
                    text={'应用'}
                    style={{backgroundColor: globalColor, width: 45, height: 30}}
                    textStyle={{color:'#FFF', fontSize: 19}}
                    showLoading={false}
                    onPress={()=>this._enableCookie(item.id)}
                    />
                </View>
            </View>
        );
    }
    render() {
        return (
            <View style={{flex: 1}}>
               <TopModal ref={'msgBox'} />
                <ActionSheet 
                    show={this.state.actionSheet.show}
                    top={this.state.actionSheet.top}
                    left={this.state.actionSheet.left}
                    title={this.state.actionSheet.title}
                    items={this.state.actionSheet.items}
                    onItemPress={this.state.actionSheet.onItemPress}
                    closedCallback={this.state.actionSheet.closedCallback}
                    onClosePress={()=>this.closeActionSheet()}/>
                <FlatList
                    data={this.state.userCookies}
                    extraData={this.state}
                    style={styles.cookieList}
                    onRefresh={this._pullDownRefreshing}
                    refreshing={this.state.cookieListLoading}
                    keyExtractor={(item, index) => {return item.id.toString()}}
                    renderItem={this._renderItem}
                    ListHeaderComponent={this._headerComponent}
                    ListFooterComponent={this._footerComponent}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.cookieListLoading}
                            onRefresh={this._pullDownRefreshing}
                            title="正在加载..."/>
                    }
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
                    TopModalApis.showMessage(this.refs['msgBox'], '错误', userCookies.errmsg,'确认');
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