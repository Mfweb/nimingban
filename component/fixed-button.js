import React from 'react'
import { Text, View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native'
import { Header } from 'react-navigation';
import { UISetting } from '../modules/config';
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const styles = StyleSheet.create({
    btnView: {
        position: 'absolute',
        zIndex: 998,
        height: 60,
        width: 60,
        borderRadius: 30,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        bottom: 25,
        right: 25
    }
});

/**
 * props:
 * icon,
 * onPress
 * visible
 */
class FixedButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        
        }
    }
    isUnmount = false;
    componentDidMount() {
        this.isUnmount = false;
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }

    render() {
        if(!this.props.visible) {
            return null;
        }
        return (
            <View style={[styles.btnView, {
                backgroundColor: UISetting.colors.globalColor,
                shadowColor: UISetting.colors.lightFontColor
                }]}>
                <TouchableOpacity onPress={this.props.onPress}>
                    <Icon name={this.props.icon} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            </View>
        );
    }
}

export { FixedButton }