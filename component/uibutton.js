import React from 'react'
import { Text, View, Image, StyleSheet, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const styles = StyleSheet.create({
    toolButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
        width: Dimensions.get('window').width / 2.5,
        borderRadius: 8
    },
});

/**
 * 粉色或白色按钮
 */
class UIButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if(this.props.showLoading) {
            return (
                <View style={ [styles.toolButton, {opacity: 0.3}].concat(this.props.style) } >
                    <ImageProcessView height={25} width={25} />
                    <Text style={this.props.textStyle}>
                        {this.props.text}
                    </Text>
                </View>
            )
        }
        else {
            return (
                <TouchableOpacity 
                    style={ [styles.toolButton, {opacity: 1}].concat(this.props.style) } 
                    activeOpacity={0.5}
                    onPress={this.props.onPress}>
                    <Text style={this.props.textStyle}>
                        {this.props.text}
                    </Text>
                </TouchableOpacity>
            )
        }
    }
}

export { UIButton }