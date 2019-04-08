import React from 'react'
import { Text, View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native'
import { Header } from 'react-navigation';
import { UISetting } from '../modules/config';

const styles = StyleSheet.create({
    modalMask: {
        backgroundColor: '#00000072',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
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
        backgroundColor: UISetting.colors.lightFontColor
    },
    body: {
        width: '95%',
        backgroundColor: UISetting.colors.defaultBackgroundColor,
        borderRadius: 8,
        padding: 4
    },
    title: {
        borderRadius: 8,
        marginTop: 14,
        marginBottom: 14
    },
    titleText: {
        color: UISetting.colors.lightFontColor,
        fontSize: 18,
        textAlign: 'center'
    },
    item: {
        borderRadius: 8,
        paddingTop: 10,
        paddingBottom: 10
    },
    itemText: {
        color: UISetting.colors.linkColor,
        fontSize: 22,
        textAlign: 'center'
    },
    topArrowView: {
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
        borderBottomColor: UISetting.colors.defaultBackgroundColor,
    },
    bottomArrorView: {
        position: 'absolute',
        zIndex: 9996,
        width: 0,
        height: 0,
        left: Dimensions.get('window').width * 0.025 + 4,
        borderTopWidth: 10,
        borderTopColor: UISetting.colors.defaultBackgroundColor,

        borderRightWidth: 10,
        borderRightColor: 'transparent',

        borderLeftWidth: 10,
        borderLeftColor: 'transparent',

        borderBottomWidth: 8,
        borderBottomColor: 'transparent',
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
            arrowTranslate: new Animated.Value(0),
            invert: false,
            arrorTop: 0,
            top: 0,

            setTop: 0,
            setLeft: 0,

            items: [],
            title: '',

            onItemPress: (index)=>{},
            onClosePress: ()=>{}
        }
    }
    isUnmount = false;
    componentDidMount() {
        this.isUnmount = false;
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }

    _showActionSheet = (success=()=>{}) =>{
        this.setState({
            showx: true
        }, ()=>{
            this.startAnime('in', success);
        });
    }

    _hideActionSheet = (success=()=>{}) =>{
        this.startAnime('out', ()=>{
            this.setState({
                showx: false
            }, success);
        });
    }

    startAnime = (mode, finished = ()=>{}) => {
        if(this.isUnmount) {
            return;
        }
        let arrowLeft = this.state.setLeft - Dimensions.get('window').width * 0.025 - 4;
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
        if(this.state.onItemPress && typeof this.state.onItemPress === 'function') {
            this.state.onItemPress(index);
        }
    }
    _onLayout = (res) => {
        if(Dimensions.get('window').height - 70 - this.state.setTop < res.nativeEvent.layout.height) {
            //下面放不开了，倒置显示
            let tempTop = this.state.setTop - Header.HEIGHT - res.nativeEvent.layout.height - 8;
            let tempArrorTop = this.state.setTop - Header.HEIGHT - 8;
            if(tempTop < 0) {
                tempTop = 5;
                tempArrorTop = tempTop + res.nativeEvent.layout.height;
            }
            this.setState({
                invert: true,
                top: tempTop,
                arrorTop: tempArrorTop
            });
        }
        else {
            this.setState({
                invert: false,
                top: this.state.setTop - Header.HEIGHT + 8,
                arrorTop: this.state.setTop - Header.HEIGHT - 8
            });  
        }
    }


    /**
     * 显示一个actionSheet
     * @param {number} x 箭头X坐标
     * @param {number} y 箭头Y坐标
     * @param {string} title 标题
     * @param {object} items 内容
     * @param {function} pressCallback 点击了项目回调
     * @param {function} success 显示完成回调
     * @param {function} close 关闭回调
     */
    showActionSheet = (x, y, title, items, pressCallback, success=()=>{} , close = null) => {
        this.setState({
            setTop: y,
            setLeft: x,

            items: items,
            title: title,

            onItemPress: pressCallback,
            onClosePress: close?close:()=>this._hideActionSheet()
        }, ()=>{
            this._showActionSheet(success);
        });
    }

    /**
     * 关闭actionSheet
     * @param {function} success 关闭回调
     */
    closeActionSheet = (success=()=>{}) => {
        this._hideActionSheet(success);
    }
    render() {
        let items = [];
        for(let i = 0; i < this.state.items.length; i++) {
            items.push(
                <View key={i}>
                    <View style={styles.line}/>
                    <TouchableOpacity style={styles.item} onPress={()=>this._itemPress(i)}>
                        <Text style={styles.itemText}>
                            {this.state.items[i]}
                        </Text>
                    </TouchableOpacity>
                </View>
            );
        }
        if(!this.state.showx) {
            return null;
        }
        return (
            <Animated.View
            style = {[ styles.modalMask, { opacity: this.state.nowOpacity } ]}>
                <Animated.View 
                style={[
                    this.state.invert?styles.bottomArrorView:styles.topArrowView, 
                    {
                        top: this.state.arrorTop, 
                        transform: [
                            { 
                                translateX: this.state.arrowTranslate 
                            }
                        ]
                    }
                ]}/>

                <TouchableOpacity style={styles.modalMaskTouch} activeOpacity={1} onPress={this.state.onClosePress}>
                    <View ref='window' onLayout={this._onLayout} style={[styles.body, {top: this.state.top}]}>
                        <View style={styles.title}>
                            <Text style={styles.titleText}>
                                {this.state.title}
                            </Text>
                        </View>
                        {items}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

export { ActionSheet }