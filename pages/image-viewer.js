import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList, SafeAreaView, StatusBar, TouchableHighlight, Dimensions, Animated, TouchableOpacity } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList, getImageCDN } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { ListProcessView } from '../component/list-process-view'
import { HomeScreen } from '../pages/main-page'

const screenDisplaySize = {
    height: Dimensions.get('window').height - 100,
    width: Dimensions.get('window').width
}
const styles = StyleSheet.create({
    mainView: {
        top:0,
        width: screenDisplaySize.width,
        height: screenDisplaySize.height,
        borderWidth:1,
        borderColor:'red'
    },
    mainImage: {
        width: screenDisplaySize.width,
        height: screenDisplaySize.height,
    }
});


class ImageViewer extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            title: '粉岛 - 图片预览'
        };
    };
    
    render() {
        console.log(this.props.navigation);
        let imgUrl = getImageCDN() + 'image/' + this.props.navigation.getParam('imgName', '-1');
        console.log(imgUrl)
        return (
            <View style={styles.mainView}>
                <Image style={styles.mainImage} resizeMode='contain' source={{uri: imgUrl}}></Image>
            </View>
        );
    }
}

export { ImageViewer }