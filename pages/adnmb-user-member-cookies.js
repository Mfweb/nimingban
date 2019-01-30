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
            messageModalShow: false,
            messageModalTitle: '提示',
            messageModalContent: '',
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
                onPress={async ()=>{ 
                    await logout();
                    navigation.reset([
                        NavigationActions.navigate({
                            routeName: 'UserMemberLogin'
                        })
                    ], 0);
                 }} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Text style={{fontSize: 18, color:'#FFF'}}>退出登录</Text>
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
                    show={this.state.messageModalShow}
                    width={280}
                    title={ this.state.messageModalTitle }
                    rightButtonText={'确认'}
                    item={<Text style={{width: 260, fontSize: 20, margin: 10}}>{this.state.messageModalContent}</Text>}
                    onClosePress={()=>{
                        this.setState({
                            messageModalShow: false
                        });
                    }}
                    onRightButtonPress={()=>{
                        this.setState({
                            messageModalShow: false
                        });
                    }} />
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
                this.setState({
                    cookieListLoading: false,
                    messageModalShow: true,
                    messageModalTitle: '错误',
                    messageModalContent: userCookies.errmsg
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