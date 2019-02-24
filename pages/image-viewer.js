import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, PanResponder, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { Header } from 'react-navigation'
import { getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { HomeScreen } from '../pages/main-page'
import { ImageProcessView } from '../component/list-process-view'
import ZoomImageViewer from 'react-native-image-zoom-viewer';

const screenDisplaySize = {
    height: Dimensions.get('window').height - Header.HEIGHT,
    width: Dimensions.get('window').width
}

const styles = StyleSheet.create({
    mainView: {
        top:0,
        flex: 1
    },
    mainImage: {
        left: 0,
        top: 0
    }
});


class ImageViewer extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: '粉岛 - 图片预览',
            left: 0,
            top: 0
        };
    };
    constructor(props) {
        super(props);
        this.state = {
            localImage: null,
        };
    }
    unmount = true;
    componentDidMount() {
        this.unmount = false;
        this._downloadImage();
    }
    _downloadImage = async () =>{
        let res = await getImage('image', this.props.navigation.getParam('imgName', '-1'));
        if(this.unmount) {
            return;
        }
        if(res.status === 'ok') {
            this.setState({
                localImage: {url: res.path, props: {}}
            });
        }
        else {
            this.setState({
                localImage: {url: '', source: require('../imgs/img-error.png')}
            });
        }
    }
    componentWillUnmount() {
        this.unmount = true;
    }
    render() {
        if(this.state.localImage) {
            return (
                <View style={styles.mainView}>
                    <ZoomImageViewer 
                    imageUrls={[this.state.localImage]}
                    backgroundColor={'#5F5F5F'}/>
                </View>
            );
        }
        else {
            return (
                <View style={[styles.mainView,{alignItems: 'center',justifyContent: 'center',}]}>
                    <ImageProcessView height={40} width={40} />
                </View>
            );
        }
    }
}

export { ImageViewer }