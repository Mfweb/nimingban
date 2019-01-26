import React from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, SectionList, Dimensions, TouchableOpacity } from 'react-native'
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
        zIndex: 9998,
    },
    modalRoot: {
        backgroundColor: '#FFF',
        borderRadius: 8,
        position: 'absolute',
        zIndex: 9999,
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
        fontSize: 24,
        marginLeft: 4
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    modalButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 48,
    }
});


class TopModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            top: 0,
            left: 0
        }
    }

    componentDidMount() {
        this.setState({
            left: Dimensions.get('window').width / 2 - this.props.width / 2,
            top: Dimensions.get('window').height / 2 - this.props.height / 2 - 80,
        });
    }

 
    render() {
        return (
            <View style={this.props.show ? styles.modalMask : styles.displayNone}>
                <View style={ [styles.modalRoot, {
                    width: this.props.width, 
                    height: this.props.height + 90,
                    left: this.state.left,
                    top: this.state.top}]}>
                    <View style={styles.modalTitle}>
                        <Text style={styles.modalTitleText}>
                            {this.props.title}
                        </Text>
                        <TouchableOpacity style={styles.modalCloseBtn} onPress={this.props.onClosePress}>
                            <Icon name={'close'} size={24} color={globalColor} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={{height: this.props.height, width: this.props.width}}>
                        {this.props.item}
                    </View>
                    <View style={styles.modalTitleSplitLine}></View>
                    <View style={[styles.modalButtonView, this.props.width]}>
                        <TouchableOpacity 
                            style={[styles.modalButton, {width:this.props.width/2}]} 
                            onPress={this.props.onLeftButtonPress}>
                            <Text style={{fontSize: 20, color: globalColor}}>{this.props.leftButtonText}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalButton, {width:this.props.width/2, backgroundColor:globalColor,borderBottomRightRadius:8}]}
                            onPress={this.props.onRightButtonPress}>
                            <Text style={{fontSize: 20, color: '#FFF'}}>{this.props.rightButtonText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}


export  { TopModal }