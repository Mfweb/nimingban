import React from 'react'
import { Text, View, StyleSheet, Animated, Dimensions, Keyboard, TouchableOpacity, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { Header } from 'react-navigation';

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    modalMask: {
        backgroundColor: '#00000072',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 998,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalRoot: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
    },
    modalTitle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: 40
    },
    modalTitleText: {
        fontSize: 22,
        marginLeft: 4,
        color: '#696969'
    },
    modalTitleSplitLine: {
        height: 1,
        backgroundColor: '#D3D3D3'
    },
    modalCloseBtn: {
        marginRight: 4
    },
    modalButtonView: {
        height: 48,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 48.3,
    }
});


class TopModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            nowOpacity: new Animated.Value(0),
            nowScale: new Animated.Value(0.1),
            showx: false,

            
            width: Dimensions.get('window').width * 0.9,
            title: '无标题',
            item: null,
            leftButtonText: '取消',
            onLeftButtonPress: ()=>{},
            rightButtonText: '确认',
            onRightButtonPress: ()=>{},
            onClosePress: ()=>{},
        }
    }
    isUnMount = false;
    componentDidMount() {
        this.isUnMount = false;
    }
    keyboardWillShowListener = null;
    keyboardWillHideListener = null;
    componentWillUnmount() {
        this.isUnMount = true;
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }
    componentWillMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this));
    }
    modalSize = null;
    _keyboardWillShow = (e) => {
        if(this.modalSize != null) {
            let keyboardTop = Dimensions.get('window').height - e.startCoordinates.height;
            let modalBottom = this.modalSize.y + this.modalSize.height;
            //let modalZero = this.modalSize.y + this.modalSize.height / 2;
            let marginTop = modalBottom - keyboardTop - 140;
            
            this.setState({
                top: marginTop
            });
        }
        else {
            this.setState({top: -Header.HEIGHT});
        }
    }
    _keyboardWillHide = () => {
        this.setState({top: 0});
    }
    _onLayout = (res) => {
        this.modalSize = res.nativeEvent.layout;
    }
    startAnime = function (mode, finish = ()=>{}) {
        if(this.isUnMount) {
            return;
        }
        this.state.nowOpacity.setValue(mode==='in'?0:1);
        this.state.nowScale.setValue(mode==='in'?0.1:1.0);
        Animated.parallel([
            Animated.timing(
                this.state.nowOpacity,
                {
                    toValue: mode==='in'?1:0,
                    duration: 200,
                    useNativeDriver: true,
                    stiffness: 50
                }
            ),
            Animated.timing(
                this.state.nowScale,
                {
                    toValue: mode==='in'?1.0:0.1,
                    duration: 200,
                    useNativeDriver: true,
                    friction: 2
                }
            )
        ]).start(finish);
    }

    showModal = (success=()=>{}) => {
        this.setState({
            showx: true
        }, ()=>{
            this.startAnime('in', success);
        });
    }
    hideModal = (success=()=>{}) => {
        this.startAnime('out', ()=>{
            Keyboard.dismiss();
            this.setState({
                showx: false,
                item: null
            }, success);
        });
    }
    /**
     * 显示一个对话框
     * @param {string} title 标题
     * @param {string or object} content 内容
     * @param {string} successButtonText 确认按钮
     * @param {function} successButtonCallBack 确认回调
     * @param {string} cancelButtonText 取消按钮
     * @param {function} cancelButtonCallBack 取消回调
     */
    showMessage = ( title, content, successButtonText, successButtonCallBack = null, cancelButtonText = null, cancelButtonCallBack = null, 
        showSuccess=()=>{}, onClosePress=null) => {
        let tempContent = 
            (typeof content == 'string') 
            ?
            (<ScrollView alwaysBounceVertical={false} style={{maxHeight: Dimensions.get('window').height - Header.HEIGHT - 140}}>
                <Text style={{fontSize: 20, margin: 10}}>{content}</Text>
            </ScrollView>)
            :
            content;
        this.setState({
            width: Dimensions.get('window').width * 0.8,
            title: title,
            item: tempContent,
            leftButtonText: cancelButtonText,
            onLeftButtonPress: cancelButtonCallBack == null?()=>this.hideModal():cancelButtonCallBack,
            rightButtonText: successButtonText,
            onRightButtonPress: successButtonCallBack == null?()=>this.hideModal():successButtonCallBack,
            onClosePress: onClosePress==null ? ()=>this.hideModal() : onClosePress,
        }, ()=>{
            this.showModal(showSuccess);
        });
    }

    /**
     * 设置新内容
     * @param {string or object} newContent 内容
     */
    setContent = (newContent) => {
        let tempContent = 
            (typeof newContent == 'string') 
            ?
            (<ScrollView alwaysBounceVertical={false} style={{maxHeight: Dimensions.get('window').height - Header.HEIGHT - 140}}>
                <Text style={{fontSize: 20, margin: 10}}>{newContent}</Text>
            </ScrollView>)
            :
            newContent;
        this.setState({
            item: tempContent,
        });
    }

    /**
     * 关闭窗口
     * @param {function} success 动画完成回调
     */
    closeModal = (success = () =>{}) => {
        this.hideModal(success);
    }

    render() {
        return (
            <Animated.View 
            style = {[
                this.state.showx ? styles.modalMask : styles.displayNone, 
                {
                    opacity: this.state.nowOpacity
                }
            ]}>
                <Animated.View style={ [styles.modalRoot, {
                    width: this.state.width, 
                    marginTop: this.state.top,
                    transform: [
                        { 
                            scale: this.state.nowScale 
                        }
                    ]
                    }]}
                    onLayout={this._onLayout}
                    ref={(ref)=>this.modalView=ref} >
                    <View style={styles.modalTitle}>
                        <Text style={styles.modalTitleText}>
                            {this.state.title}
                        </Text>
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={this.state.onClosePress}>
                            <Icon name={'close'} size={24} color={globalColor} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={{
                        width: this.state.width, 
                        maxHeight: Dimensions.get('window').height - Header.HEIGHT - 50 - 40 - 20 // -button - title - 保留
                        }}>
                        {this.state.item}
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={[styles.modalButtonView, this.state.width]}>
                        <TouchableOpacity 
                            style={this.state.leftButtonText ?[
                                styles.modalButton, 
                                {
                                    width:this.state.width / 2,
                                    borderBottomLeftRadius: 8,
                                }]:styles.displayNone
                            } 
                            onPress={this.state.onLeftButtonPress}>
                            <Text style={{fontSize: 20, color: globalColor}}>{this.state.leftButtonText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.modalButton, 
                                {
                                    width: this.state.leftButtonText ? this.state.width/2 : this.state.width, 
                                    backgroundColor: globalColor,
                                    borderBottomRightRadius: 8,
                                    borderBottomLeftRadius: this.state.leftButtonText?0:8
                                }
                            ]}
                            onPress={this.state.onRightButtonPress}>
                            <Text style={{fontSize: 20, color: '#FFF'}}>{this.state.rightButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        );
    }
}

export  { TopModal }