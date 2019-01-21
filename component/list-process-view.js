import React from 'react'
import { View, Animated } from 'react-native'

const listProcessColorList = ['#f45a8d', '#8A2BE2', '#00BFFF', '#FF7F50'];
class ListProcessView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            colorNow: 0,
            translateNow: new Animated.Value(0),
        };
    }

    componentDidMount() {
        this.startAnime()
    }
    startAnime = function () {
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


export { ListProcessView }