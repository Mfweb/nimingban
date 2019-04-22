import React from 'react'
import { Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import { ImageProcessView } from '../component/list-process-view'
import { getImage } from '../modules/api/image'
import { history } from '../modules/history'

const styles = StyleSheet.create({
    mainListItemImage: {
        height: Dimensions.get('window').width / 2.5,
        width: Dimensions.get('window').width / 2.5,
        left: 0,
    },
    displayNone: {
        display: 'none'
    },
    mainListItemImageTouch: {
        marginTop: 5,
        flex: 0,
        width: Dimensions.get('window').width / 2.5,
        height: Dimensions.get('window').width / 2.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
    },
    downloadImage: {
        position: 'absolute',
        top: Dimensions.get('window').width / 2.5 / 2 - 20,
        left: Dimensions.get('window').width / 2.5 / 2 - 20,
        zIndex: 500
    }
});

/**
 * props:
 * localUri
 * imgUri
 * Toast
 */
class MainListImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            fullImageDownloading: false
        }
    }
    componentDidMount() {
        this.isUnmount = false;
    }
    componentWillUnmount() {
        this.isUnmount = true;
    }
    _onPressImage = () => {
        if(this.state.fullImageDownloading) {
            return;
        }
        this.setState({
            fullImageDownloading: true
        }, async () => {
            let res = await getImage('image', this.props.imgUri);
            if(res.status === 'ok') {
                history.addNewHistory('image', {id: this.props.tid, url: res.path}, Date.parse(new Date()));
                this.props.navigation.push('ImageViewer', {
                    imageUrl: res.path
                });
            }
            else {
                if(this.isUnmount) return;
                this.props.Toast.show('图片加载失败');
            }
            if(this.isUnmount) return;
            this.setState({
                fullImageDownloading: false
            });
        });
    }
    render() {
        let {localUri, imgUri} = this.props;
        if(!imgUri) {
            return null;
        }
        return (
            <TouchableOpacity style={styles.mainListItemImageTouch} onPress={this._onPressImage} activeOpacity={0.5}>
                <Image style={localUri ? styles.mainListItemImage : styles.displayNone}
                    source={ localUri } 
                    resizeMode='contain'/>

                <ImageProcessView style={
                    (this.state.fullImageDownloading || !localUri)
                    ?
                    styles.downloadImage
                    :
                    styles.displayNone} height={40} width={40} />
            </TouchableOpacity>
        );
    }
}

export { MainListImage }