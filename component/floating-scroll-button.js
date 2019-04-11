import React from 'react'
import { StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { UISetting } from '../modules/config'

const styles = StyleSheet.create({
    mainView: {
        position: 'absolute',
        zIndex: 601,
        width: 30,
        height: 30 + 30 + 30,

    },
    button: {
        width: 30,
        height: 30,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    icon: {
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 5,
    }
});


class FloatingScrollButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottom: Dimensions.get('window').height * 0.1,
            left: -22,
            showx: false,
        }
    }
    timeCounter = 0;
    timer = null;
    isUnMount = false;
    componentDidMount() {
        this.isUnMount = false;
    }

    componentWillUnmount() {
        this.isUnMount = true;
    }

    _onLayout = (res) => {
        this.setState({
            left: Dimensions.get('window').width / 2 - res.nativeEvent.layout.width / 2
        });
    }

    show = (time = 1000) => {
        if(this.state.showx) {
            this.timeCounter = time;
        }
        else {
            this.setState({
                showx: true
            });
            this.timer = setInterval(()=>{
                this.timeCounter -= 100;
                if( this.timeCounter <= 0) {
                    this.timeCounter = 0;
                    clearInterval(this.timer);
                    this.timer = null;
                    this.setState({
                        showx: false
                    });
                }
            }, 100);
        }
    }

    render() {
        if (this.state.showx === false) {
            return null;
        }
        return (
            <Animated.View style={[styles.mainView, {
                bottom: this.state.bottom,
                left: this.state.left
            }]}
                onLayout={this._onLayout}
                pointerEvent={'box-none'}>
                <TouchableOpacity style={styles.button} onPress={this.props.onUpPress}>
                    <Icon 
                        style={[styles.icon, {shadowColor: UISetting.colors.globalColor}]}
                        name={'arrow-up'} 
                        size={22} 
                        color={UISetting.colors.globalColor} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, { marginTop: 30 }]} onPress={this.props.onDownPress}>
                    <Icon 
                        style={[styles.icon, {shadowColor: UISetting.colors.globalColor}]}
                        name={'arrow-down'} 
                        size={22} 
                        color={UISetting.colors.globalColor} />
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

export { FloatingScrollButton }