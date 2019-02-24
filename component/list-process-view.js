import React from 'react'
import { View, Animated } from 'react-native'

//loading动画颜色，粉(岛)-紫(岛)-浅蓝(芦苇)-橙(岛)
const listProcessColorList = ['#FA7296', '#8A2BE2', '#00BFFF', '#FF7F50'];
/**
 * List底部loading动画
 */
class ListProcessView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            colorNow: 0,
            translateNow: new Animated.Value(0),
        };
    }
    isUnMount = false;
    componentDidMount() {
        this.startAnime()
    }
    componentWillUnmount() {
        this.isUnMount = true;
    }
    startAnime = function () {
        if(this.isUnMount) {
            return;
        }
        let nextColor = this.state.colorNow + 1;
        if (nextColor >= listProcessColorList.length) {
            nextColor = 0;
        }

        this.setState({
            colorNow: nextColor
        });
        this.state.translateNow.setValue(0);

        Animated.timing(
            this.state.translateNow,
            {
                toValue: this.props.toMax,
                duration: 1000,
                useNativeDriver: true,
                stiffness: 80
            }
        ).start(() => this.startAnime());
    }

    render() {
        return (
            <View style={{
                backgroundColor: listProcessColorList[(this.state.colorNow + 1 >= listProcessColorList.length) ? 0 : this.state.colorNow + 1],
                marginBottom: 8
            }}>
                <Animated.View style={{ height: this.props.height, transform: [{ translateX: this.state.translateNow }], backgroundColor: listProcessColorList[this.state.colorNow] }}>
                </Animated.View>
            </View>
        );
    }
}

/**
 * 图片Loading动画
 */
class ImageProcessView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            translateNow: new Animated.Value(0),
        };
    }
    isUnMount = false;
    componentDidMount() {
        this.startAnime();
        //console.log('Anime loading mount');
    }
    componentWillUnmount() {
        this.isUnMount = true;
        //console.log('Anime loading unmount');
    }
    startAnime = function () {
        if(this.isUnMount) {
            return;
        }
        this.state.translateNow.setValue(0);

        Animated.timing(
            this.state.translateNow,
            {
                toValue: 360,
                duration: 1000,
                useNativeDriver: true,
                stiffness: 80
            }
        ).start(() => this.startAnime());
    }
    render() {
        return (
            <Animated.Image 
            style={[{
                height: this.props.height,
                width: this.props.width,
                left: 0,
                transform: [
                    { 
                        rotate: this.state.translateNow.interpolate( {inputRange: [0, 360],outputRange: ['0deg', '360deg']} )
                    }
                ] 
            }].concat(this.props.style)}
            resizeMode='contain'
            source={require('../imgs/loading.png')}>
            </Animated.Image>
        );
    }
}

export { ListProcessView, ImageProcessView }