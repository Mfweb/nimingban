import React from 'react'
import { Text, View, Image, StyleSheet, Picker, TextInput, Dimensions, TouchableOpacity, Keyboard, RefreshControl } from 'react-native'
import { ImageProcessView } from '../../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../../component/top-modal'
import { checkSession, getVerifyCode, logout, getUserCookies, deleteUserCookie, getNewUserCookie, getVerifiedInfo } from '../../modules/user-member-api'
import { FlatList } from 'react-native-gesture-handler';
import { UIButton } from '../../component/uibutton'
import { ActionSheet } from '../../component/action-sheet'
import { globalColor, styles } from './user-member-styles'

class UserMemberCookies extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messageModal: {
                show: false,
                title: '提示',
                content: <Text></Text>,
                leftButtonText: '',
                rightButtonText: '',
                leftButtonCallBack: null,
                rightButtonCallBack: null,
                closedCallback: null
            },
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
     * 显示一个信息窗口
     */
    showMessageModal = async (title, content, successButtonText, successButtonCallBack = null, cancelButtonText = null, cancelButtonCallBack = null) => {
        let closeModal = ()=>{this.closeMessageModal()};
        
        this.setState({
            messageModal: {
                show: true,
                title: title,
                content: (<Text style={{width: 260, fontSize: 20, margin: 10}}>{content}</Text>),
                leftButtonText: cancelButtonText,
                rightButtonText: successButtonText,
                leftButtonCallBack: cancelButtonCallBack == null?closeModal:cancelButtonCallBack,
                rightButtonCallBack: successButtonCallBack == null?closeModal:successButtonCallBack,
                closedCallback: ()=>{}
            }
        });
    }
    /**
     * 关闭信息窗口
     */
    closeMessageModal = (callback = ()=>{}) => {
        //这样关闭可以防止闪烁
        let tempObj = {
            show: false,
            title: this.state.messageModal.title,
            content: this.state.messageModal.content,
            leftButtonText: this.state.messageModal.leftButtonText,
            rightButtonText: this.state.messageModal.rightButtonText,
            leftButtonCallBack: null,
            rightButtonCallBack: null,
            closedCallback: ()=>callback()
        }
        Keyboard.dismiss();
        this.setState({
            messageModal: tempObj
        });
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
                top: 0,
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
        this.setState({
            messageModal: {
                show: true,
                title: '正在获取',
                content: (
                <View style={{width: 280, height: 100, justifyContent: 'center', alignItems: 'center'}}>
                    <ImageProcessView 
                    height={25} 
                    width={25} />
                </View>
                ),
                rightButtonText: '确认',
                rightButtonCallBack: ()=>this.closeMessageModal(),
                closedCallback: null
            }
        }, async ()=>{
            let info = await getVerifiedInfo();
            if(info.status == 'error') {
                this.showMessageModal('获取错误', info.errmsg, '确认');
            }
            else {
                this.setState({
                    messageModal: {
                        show: true,
                        title: '实名信息',
                        content: (
                        <View style={{width: 280, height: 100, justifyContent: 'center', alignItems: 'center'}}>
                            <Text style={{fontSize: 22, color:'#696969'}}>
                                {info.info.statusString}
                            </Text>
                            <Text style={{fontSize: 22, color:'#696969'}}>
                                {info.info.phoneNumber}
                            </Text>
                        </View>
                        ),
                        rightButtonText: '确认',
                        rightButtonCallBack: ()=>this.closeMessageModal(),
                        closedCallback: null
                    }
                });
            }
        });
        
        
    }
    /**
     * 退出登录
     */
    _logout = () => {
        this.showMessageModal('提示', '确认退出？', '确认', async () => {
            await logout();
            this.closeMessageModal(() => {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberLogin'
                    })
                ], 0);
            });
        }, '取消');
    }
    inputVcode = '';
    /**
     * 删除饼干
     */
    _deleteCookie = (id) => {
        this.inputVcode = '';
        this._getVCode(() => {
            this.closeMessageModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.showMessageModal('错误', '验证码输入错误', '确认');
                }
                else {
                    let deleteRes = await deleteUserCookie(id, this.inputVcode);
                    if(deleteRes.status != 'ok') {
                        this.showMessageModal('错误', deleteRes.errmsg, '确认');
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
            this.closeMessageModal(async ()=>{
                if(this.inputVcode.length != 5) {
                    this.showMessageModal('错误', '验证码输入错误', '确认');
                }
                else {
                    let deleteRes = await getNewUserCookie(this.inputVcode);
                    if(deleteRes.status != 'ok') {
                        this.showMessageModal('错误', deleteRes.errmsg, '确认');
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
        this.setState({
            messageModal: {
                show: true,
                title: '输入验证码',
                content: (
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity 
                    style={styles.vcode}
                    onPress={()=>this._getVCode(checkCallback)}>
                        <ImageProcessView 
                        height={25} 
                        width={25} />
                    </TouchableOpacity>
                </View>
                ),
                leftButtonText: '取消',
                rightButtonText: '确认',
                leftButtonCallBack: ()=>this.closeMessageModal(),
                rightButtonCallBack: ()=>checkCallback(),
                closedCallback: null
            }
        }, async () => {
            let vcode = await getVerifyCode();
            let tempObj = {
                show: true,
                title: '输入验证码',
                content: (
                <View style={{width: 280, height: 100}}>
                    <TouchableOpacity style={styles.vcode}
                    onPress={()=>this._getVCode(this.state.messageModal.rightButtonCallBack)}>
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
                ),
                leftButtonText: '取消',
                rightButtonText: '确认',
                leftButtonCallBack: this.state.messageModal.leftButtonCallBack,
                rightButtonCallBack: this.state.messageModal.rightButtonCallBack,
                closedCallback: null
            };
            this.setState({
                messageModal: tempObj
            });
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
            <TouchableOpacity>
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
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    render() {
        return (
            <View style={{flex: 1}}>
               <TopModal
                    show={this.state.messageModal.show}
                    width={280}
                    title={ this.state.messageModal.title }
                    rightButtonText={this.state.messageModal.rightButtonText}
                    leftButtonText={this.state.messageModal.leftButtonText}
                    item={this.state.messageModal.content}
                    onClosePress={()=>this.closeMessageModal()}
                    onRightButtonPress={this.state.messageModal.rightButtonCallBack} 
                    onLeftButtonPress={this.state.messageModal.leftButtonCallBack}
                    closedCallback={this.state.messageModal.closedCallback}/>
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
                    this.showMessageModal('错误', userCookies.errmsg, '确认');
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