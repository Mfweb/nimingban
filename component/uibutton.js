import React from 'react'
import { Text, View, Image, StyleSheet, TextInput, Dimensions, TouchableOpacity, Keyboard } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const styles = StyleSheet.create({
    toolButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: 'solid',
        maxWidth: '100%',
    },
    toolButtonText: {
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'center'
    }
});

/**
 * 按钮
 */
class UIButton extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (!this.props.show) {
            return null;
        }
        if (this.props.showLoading) {
            return (
                <View style={[
                    styles.toolButton, {
                        opacity: 0.3,
                        borderColor: this.props.textColor,
                        backgroundColor: this.props.backgroundColor,
                        width: this.props.width
                        }]} >
                    <ImageProcessView height={25} width={25} />
                    <Text style={[styles.toolButtonText, {color: this.props.textColor, fontSize: this.props.fontSize}]}>
                        {this.props.text}
                    </Text>
                </View>
            )
        }
        else {
            return (
                <TouchableOpacity
                    style={[
                        styles.toolButton, {
                            opacity: 1,
                            borderColor: this.props.textColor,
                            backgroundColor: this.props.backgroundColor,
                            width: this.props.width
                        }]}
                    activeOpacity={0.5}
                    onPress={this.props.onPress}>
                    <Text style={[styles.toolButtonText, {color: this.props.textColor,  fontSize: this.props.fontSize}]}>
                        {this.props.text}
                    </Text>
                </TouchableOpacity>
            )
        }
    }
}

export { UIButton }