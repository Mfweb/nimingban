import React from 'react'
import { Text, View, Image, StyleSheet, Animated, SectionList, Dimensions, TouchableOpacity } from 'react-native'
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalRoot: {
        backgroundColor: '#FFF',
        borderRadius: 8,
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
            nowOpacity: new Animated.Value(0),
            showx: false
        }
    }
    isUnMount = false;
    componentDidMount() {
        this.isUnMount = false;
    }
    componentWillUnmount() {
        this.isUnMount = true;
    }
    startAnime = function (mode, finish = null) {
        if(this.isUnMount) {
            return;
        }
        this.state.nowOpacity.setValue(mode==='in'?0:1);
        Animated.timing(
            this.state.nowOpacity,
            {
                toValue: mode==='in'?1:0,
                duration: 200,
                useNativeDriver: true,
                stiffness: 50
            }
        ).start(finish);
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
                    })
                });
            }
        }
    }

    _onLayout(e){
        let {height} = event.nativeEvent.layout;
        console.log(height);
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
                <View style={ [styles.modalRoot, {
                    width: this.props.width, 
                    marginTop: this.props.top?this.props.top: -70
                    }]}
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
                                    width:this.props.width / 2
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
                </View>
            </Animated.View>
        );
    }
}


export  { TopModal }