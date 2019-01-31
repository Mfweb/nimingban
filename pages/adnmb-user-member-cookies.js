import React from 'react'
import { Text, View, Image, StyleSheet, Modal, TextInput, Dimensions, TouchableOpacity, Keyboard,RefreshControl } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import { NavigationActions } from 'react-navigation'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { checkSession, getVerifyCode, logout, getUserCookies } from '../modules/user-member-api'
import { FlatList } from 'react-native-gesture-handler';
import { UIButton } from '../component/uibutton'

const globalColor = '#fa7296';

const styles = StyleSheet.create({
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
    }
});

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
                rightButtonCallBack: null
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
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={navigation.openDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                onPress={async ()=>navigation.state.params.logout()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:'#FFF'}}>退出登录</Text>
                </TouchableOpacity>
            )
        }
    }
    
    showMessageModal = async (title, content, successButtonText, successButtonCallBack = null, cancelButtonText = null, cancelButtonCallBack = null) => {
        let closeModal = () => {
            this.setState({
                messageModal: {
                    show: false
                }
            });
        }
        
        this.setState({
            messageModal: {
                show: true,
                title: title,
                content: (<Text style={{width: 260, fontSize: 20, margin: 10}}>{content}</Text>),
                leftButtonText: cancelButtonText,
                rightButtonText: successButtonText,
                leftButtonCallBack: cancelButtonCallBack == null?closeModal:cancelButtonCallBack,
                rightButtonCallBack: successButtonCallBack == null?closeModal:successButtonCallBack
            }
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
        this.props.navigation.setParams({ logout: this._logout })
    }

    _logout = async () => {
        this.showMessageModal('提示', '确认退出？', '确认', async () => {
            await logout();
            this.setState({
                messageModal: {
                    show:false
                }
            }, () => {
                this.props.navigation.reset([
                    NavigationActions.navigate({
                        routeName: 'UserMemberLogin'
                    })
                ], 0);
            });
        }, '取消');
    }

    _deleteCookie = async (id) => {
        console.log(id);
        this.showMessageModal('提示', id.toString(), 'ok');
    }

    _renderItem = ({item}) =>{
        console.log(item);
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
                    onClosePress={()=>{
                        this.setState({
                            messageModal: {
                                show: false
                            }
                        });
                    }}
                    onRightButtonPress={this.state.messageModal.rightButtonCallBack} 
                    onLeftButtonPress={this.state.messageModal.leftButtonCallBack}/>
                <FlatList
                    data={this.state.userCookies}
                    extraData={this.state}
                    style={styles.cookieList}
                    onRefresh={this._pullDownRefreshing}
                    refreshing={this.state.cookieListLoading}
                    keyExtractor={(item, index) => {return item.id.toString()}}
                    renderItem={this._renderItem}
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
                this.showMessageModal('错误', userCookies.errmsg, '确认');
                this.setState({
                    cookieListLoading: false,
                });
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