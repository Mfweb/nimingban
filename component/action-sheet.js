import React from 'react'
import { Text, View, Image, StyleSheet, Animated, SectionList, Dimensions, Keyboard, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const globalColor = '#fa7296';

const styles = StyleSheet.create({
    modalMask: {
        backgroundColor: '#00000072',
        top: 0,
        left: 0,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
        position: 'absolute',
        zIndex: 9996,
    },
    modalMaskTouch: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center'
    },
    displayNone: {
        display: 'none'
    },
    line: {
        height: 1,
        backgroundColor: '#696969'
    },
    body: {
        width: Dimensions.get('window').width * 0.95,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: 4
    },
    title: {
        borderRadius: 8,
        marginTop: 14,
        marginBottom: 14
    },
    titleText: {
        color: '#696969',
        fontSize: 18,
        textAlign: 'center'
    },
    item: {
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 10
    },
    itemText: {
        color: '#1E90FF',
        fontSize: 25,
        textAlign: 'center'
    },
    arrowView: {
        position: 'absolute',
        zIndex: 9996,
        width: 0,
        height: 0,
        left: Dimensions.get('window').width * 0.025 + 4,
        borderTopWidth: 8,
        borderTopColor: 'transparent',

        borderRightWidth: 10,
        borderRightColor: 'transparent',

        borderLeftWidth: 10,
        borderLeftColor: 'transparent',

        borderBottomWidth: 10,
        borderBottomColor: '#F5F5F5',
    }
});

/**
 * props:
 * top
 * left
 * show
 * title
 * items
 * onItemPress
 * onClosePress
 * closedCallback
 */
class ActionSheet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showx: false,
            nowOpacity: new Animated.Value(0),
            arrowTranslate: new Animated.Value(0)
        }
    }
    isUnmount = false;
    componentDidMount() {
        this.isUnmount = false;
    }
    componentWillUnmount() {
        this.isUnmount = true;
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
    startAnime = (mode, finished = ()=>{}) => {
        if(this.isUnmount) {
            return;
        }
        let arrowLeft = this.props.left - Dimensions.get('window').width * 0.025 - 4;
        let arrowLeftMax = Dimensions.get('window').width * 0.95 - 30;
        arrowLeft = arrowLeft>arrowLeftMax?arrowLeftMax:arrowLeft;
        arrowLeft = arrowLeft<0?0:arrowLeft;

        this.state.nowOpacity.setValue(mode==='in'?0:1);
        this.state.arrowTranslate.setValue(mode==='in'?0:arrowLeft);
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
                this.state.arrowTranslate,
                {
                    toValue: mode==='in'?arrowLeft:0,
                    duration: 200,
                    useNativeDriver: true,
                    stiffness: 50
                }
            )
        ]).start(finished);
    }

    _itemPress = (index) => {
        if(this.props.onItemPress && typeof this.props.onItemPress === 'function') {
            this.props.onItemPress(index);
        }
    }

    render() {
        let items = [];
        for(let i = 0; i < this.props.items.length; i++) {
            items.push(
                <View key={i}>
                    <View style={styles.line}/>
                    <TouchableOpacity style={styles.item} onPress={()=>this._itemPress(i)}>
                        <Text style={styles.itemText}>
                            {this.props.items[i]}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return (
            <Animated.View
            style = {[
                this.state.showx ? styles.modalMask : styles.displayNone, 
                {
                    opacity: this.state.nowOpacity
                }
            ]}>
                <Animated.View style={[
                    styles.arrowView, 
                    {
                        top: this.props.top - 8, 
                        transform: [
                            { 
                                translateX: this.state.arrowTranslate 
                            }
                        ]
                    }
                ]}/>

                <TouchableOpacity style={styles.modalMaskTouch} activeOpacity={1} onPress={this.props.onClosePress}>
                    <View style={[styles.body, {top: this.props.top + 10}]}>
                        <View style={styles.title}>
                            <Text style={styles.titleText}>
                                {this.props.title}
                            </Text>
                        </View>
                        {items}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

export {ActionSheet}