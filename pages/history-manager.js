import React from 'react'
import { Text, View, FlatList, Animated, Dimensions, TouchableOpacity, Keyboard, RefreshControl, Platform, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import { Header } from 'react-navigation';
import { configDynamic } from '../modules/config';
import { RNCamera } from 'react-native-camera'
import SoundPlayer from 'react-native-sound'
import { getUserCookieList, addUserCookieList, removeUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { UIButton } from '../component/uibutton'
import { NavigationActions } from 'react-navigation'
import { realAnonymousGetCookie } from '../modules/apis'
import { history } from '../modules/history'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    headerView: {
        borderColor: '#F5F5F5',
        borderWidth: 1,
        borderRadius: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden'
    },
    headerText: {
        fontSize: 18,
        color: '#F5F5F5'
    },
    headerButton: {
        padding: 2,
    },
    headerCenterButton: {
        borderLeftColor: '#F5F5F5',
        borderRightColor: '#F5F5F5',
        borderLeftWidth: 1,
        borderRightWidth: 1
    },
    headerSelected: {
        backgroundColor: '#F5F5F5',
        color: globalColor
    },
    headerMark: {
        width: '33.33%',
        position: 'absolute',
        left: 0,
        backgroundColor: '#F5F5F5',
        height: '100%'
    }
});

class HistoryHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            headerMove: new Animated.Value(0),
            mode: 0
        }
    }

    componentWillReceiveProps (newProps) {
        if(newProps.mode != this.state.mode) {
            let target = this.maxWidth * 0.3334 * newProps.mode - 1;
            Animated.timing(
                this.state.headerMove,
                {
                    toValue: target<0?0:target,
                    duration: 150,
                    useNativeDriver: true,
                    stiffness: 80
                }
            ).start(()=>{
                this.setState({
                    mode: newProps.mode
                });
            });
        }
    }
    _onLayout = (res) => {
        this.maxWidth = res.nativeEvent.layout.width;
    }

    render() {
        return (
        <View style={styles.headerView} onLayout={this._onLayout}>
            <Animated.View style={[styles.headerMark, {transform: [{ translateX: this.state.headerMove }]}]}>

            </Animated.View>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(0)}>
                <Text style={[styles.headerText, this.state.mode===0?{color: globalColor}:{}]}>
                    浏览记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerButton, styles.headerCenterButton]} onPress={()=>this.props.changeMode(1)}>
                <Text style={[styles.headerText, this.state.mode===1?{color: globalColor}:{}]}>
                    回复记录
                </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={()=>this.props.changeMode(2)}>
                <Text style={[styles.headerText, this.state.mode===2?{color: globalColor}:{}]}>
                    图片记录
                </Text>
            </TouchableOpacity>
        </View>
        );
    }
}

class HistoryManager extends React.Component {
    constructor(props) {
        super(props);
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '历史',
            headerTitle: (
                <HistoryHeader changeMode={params.changeMode} mode={navigation.getParam('mode', 0)}/>
            ),
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={()=>navigation.openDrawer()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            ),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} 
                    onPress={async ()=>navigation.state.params.showRightMenu()} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'options'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }
    componentDidMount() {
        this.props.navigation.setParams({
            changeMode: this._changeMode,
        });
    }
    componentWillUnmount() {

    }
    _changeMode = (mode) => {
        this.props.navigation.setParams({
            mode: mode
        });
    }
    render() {
        return (
            <View style={{flex: 1}}>

            </View>
        );
    }
}

export { HistoryManager }