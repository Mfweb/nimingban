import React, { Component } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Header } from 'react-navigation'
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
    }

    render() {
        return (
            <View style={styles.mainView}>
                <ZoomImageViewer 
                saveToLocalByLongPress={false}
                imageUrls={[{url: this.props.navigation.getParam('imageUrl', '-1'), props: {}}]}
                backgroundColor={'#5F5F5F'}/>
            </View>
        );
    }
}

export { ImageViewer }