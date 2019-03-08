import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'

const styles = StyleSheet.create({
    mainListItem: {
        backgroundColor: '#FFF',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
        paddingBottom: 8
    },
    mainListItemContent: {
        color: '#000',
        fontSize: 20,
        paddingLeft: 8,
        paddingRight: 8
    },
});

class DetailListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayData:{},
            imgLocalUri: null,
            fullImageDownloading: false
        }
    }
    _onPressImage = () => {
        if(this.state.fullImageDownloading) {
            return;
        }
        this.setState({
            fullImageDownloading: true
        }, async () => {
            let res = await getImage('image', this.props.itemDetail.img + this.props.itemDetail.ext);
            this.setState({
                fullImageDownloading: false
            });
            if(res.status === 'ok') {
                this.props.navigation.push('ImageViewer', {
                    imageUrl: res.path
                });
            }
            else {
                mToast.show('图片加载失败');
            }
        });
    }
    componentDidMount() {
        this._updateData(this.props.itemDetail);
    }
    
    componentWillReceiveProps(res) {
        this._updateImage(res.itemDetail.localImage);
        this._updateData(res.itemDetail);
    }
    componentWillUnmount() {
    }
    _updateImage = (localUri) => {
        if(this.state.imgLocalUri != localUri) {
            this.setState({
                imgLocalUri: localUri
            });
        }
    }
    _updateData = (itemDetail) => {
        let displayData = {};
        //console.log(this.props.itemDetail);
        displayData['threadContent'] = getHTMLDom(itemDetail.content, (url)=>{
            if( (url.href.indexOf('/t/') >= 0) && (
                (url.href.indexOf('adnmb') >= 0) || (url.href.indexOf('nimingban') >= 0) || (url.href.indexOf('h.acfun'))
            ) ) {
                let threadNo = url.href.split('/t/')[1];
                this.props.navigation.push('Details', {
                    threadDetail: {
                        id: threadNo, 
                        userid: 'null', 
                        content: 'null',
                        now: '2099-12-12 12:12:12'
                    }
                })
            }
            else {
                this.props.navigation.push('WebView', {
                    URL: url.href
                });
            }
        });

        this.setState({
            displayData: displayData,
        });
    }
    render() {
        let { itemDetail } = this.props;
        return (
            <View style={styles.mainListItem}>
                <MainListItemHeader itemDetail={itemDetail} po={this.props.po}/>
                <Text style={styles.mainListItemContent}>
                    {this.state.displayData['threadContent']}
                </Text>
                <MainListImage 
                    tid={itemDetail.id}
                    navigation={this.props.navigation}
                    Toast={this.props.Toast}
                    localUri={this.state.imgLocalUri}
                    imgUri={itemDetail.img + itemDetail.ext}/>
            </View>
        );
    }
}

export { DetailListItem }