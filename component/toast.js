import React from 'react'
import { Text, View, StyleSheet, Animated, Dimensions, Keyboard, TouchableOpacity, ScrollView } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { Header } from 'react-navigation';

const globalColor = '#fa7296';
const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        zIndex: 600,
        backgroundColor: globalColor,
        borderWidth: 1,
        borderColor: '#FFB6C1',
        borderRadius: 30,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
    },
    toastText: {
        fontSize: 20,
        color: '#F5F5F5',
        margin: 10,
    }
});


class Toast extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottom: Dimensions.get('window').height * 0.2,
            left: 0,
            showx: false,
            message: null,
            nowOpacity: new Animated.Value(0),
            nowScale: new Animated.Value(0.1),
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
    _keyboardWillShow = (e) => {
        this.setState({
            bottom: e.startCoordinates.height + 30
        });
    }
    _keyboardWillHide = () => {
        this.setState({bottom: Dimensions.get('window').height * 0.2});
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
                    duration: 100,
                    useNativeDriver: true,
                    stiffness: 50
                }
            ),
            Animated.timing(
                this.state.nowScale,
                {
                    toValue: mode==='in'?1.0:0.1,
                    duration: 100,
                    useNativeDriver: true,
                    friction: 2
                }
            )
        ]).start(finish);
    }

    showToast = (showTime, success=()=>{}) => {
        this.setState({
            showx: true
        }, ()=>{
            this.startAnime('in', ()=>{
                setTimeout(()=>{
                    this.startAnime('out', success);
                }, showTime);
            });
        });
    }
    _onLayout = (res) => {
        this.setState({
            left: Dimensions.get('window').width / 2 - res.nativeEvent.layout.width / 2
        });
    }

    show = (content, time=1000) => {
        this.setState({
            message: content
        }, ()=>{
            this.showToast(time);
        });
    }
    render() {
        if(this.state.showx === false) {
            return null;
        }
        return (
            <Animated.View style={[styles.toast, {
                bottom: this.state.bottom,
                left: this.state.left,
                opacity: this.state.nowOpacity,
                transform: [
                    { 
                        scale: this.state.nowScale 
                    }
                ]
            }]}
            onLayout={this._onLayout}>
            <Text style={styles.toastText}>
                {this.state.message}
            </Text>
            </Animated.View>
        );
    }
}

export  { Toast }