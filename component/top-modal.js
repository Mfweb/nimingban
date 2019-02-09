import React from 'react'
import { Text, View, Image, StyleSheet, Animated, SectionList, Dimensions, Keyboard, TouchableOpacity } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { getForumList } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    modalMask: {
        backgroundColor: '#00000072',
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
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
            top: -70,
            nowOpacity: new Animated.Value(0),
            nowScale: new Animated.Value(0.1),
            showx: false
        }
    }
    isUnMount = false;
    componentDidMount() {
        this.isUnMount = false;
    }
    keyboardDidShowListener = null;
    keyboardDidHideListener = null;
    componentWillUnmount() {
        this.isUnMount = true;
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }
    modalSize = null;
    _keyboardDidShow = (e) => {
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
            this.setState({top: -70});
        }
    }
    _keyboardDidHide = () => {
        this.setState({top: -70});
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

    componentWillReceiveProps(res) {
        if( res.show != this.state.showx ) {
            if(res.show) {
                this.setState({
                    showx: true
                }, ()=>{
                    this.startAnime('in');
                })
            }
            else {
                this.startAnime('out', ()=>{
                    this.setState({
                        showx: false
                    }, ()=>{
                        if(this.props.closedCallback && typeof this.props.closedCallback === 'function') {
                            this.props.closedCallback();
                        }
                    });
                });
            }
        }
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
                    width: this.props.width, 
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
                            {this.props.title}
                        </Text>
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={this.props.onClosePress}>
                            <Icon name={'close'} size={24} color={globalColor} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={{width: this.props.width}}>
                        {this.props.item}
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={[styles.modalButtonView, this.props.width]}>
                        <TouchableOpacity 
                            style={this.props.leftButtonText ?[
                                styles.modalButton, 
                                {
                                    width:this.props.width / 2,
                                    borderBottomLeftRadius: 8,
                                }]:styles.displayNone
                            } 
                            onPress={this.props.onLeftButtonPress}>
                            <Text style={{fontSize: 20, color: globalColor}}>{this.props.leftButtonText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[
                                styles.modalButton, 
                                {
                                    width: this.props.leftButtonText ? this.props.width/2 : this.props.width, 
                                    backgroundColor: globalColor,
                                    borderBottomRightRadius: 8,
                                    borderBottomLeftRadius: this.props.leftButtonText?0:8
                                }
                            ]}
                            onPress={this.props.onRightButtonPress}>
                            <Text style={{fontSize: 20, color: '#FFF'}}>{this.props.rightButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        );
    }
}


export  { TopModal }