import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { getImage } from '../modules/api/image'
import { getHTMLDom } from '../modules/html-decoder'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'
import { ItemQuote } from './item-quote'
import { UISetting } from '../modules/config'

const styles = StyleSheet.create({
    mainListItem: {
        shadowOffset: { width: 0, height: 5 },
        paddingBottom: 8
    },
    mainListItemContent: {
        fontSize: 20,
        lineHeight: 21,
        paddingLeft: 8,
        paddingRight: 8
    },
    quoteText: {
        color: '#789922',
        fontSize: 20,
        lineHeight: 20,
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
            fullImageDownloading: false,
            selected: false
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
    _onPressUrl = (url)=>{
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
    }
    _updateData = (itemDetail) => {
        let displayData = {};
        let contentBlocks = itemDetail.content.split(/((?:&gt;|\>){2}No\.\d{1,11}(?:<br \/>)*(?:\n)*)/);
        displayData['threadContent'] = [];
        for(let i = 0; i < contentBlocks.length; i++) {
            let content = contentBlocks[i];
            if(content === '' || content === null) {
                continue;
            }
            if(/((&gt;){2}|(>){2})(No\.){0,1}\d{1,11}/.test(content)) {
                let contentDom = getHTMLDom(content.replace('\n','').replace('<br />', ''), this._onPressUrl);
                if(UISetting.nestedQuoteCount == 0) {
                    displayData['threadContent'].push(
                    <TouchableOpacity
                        activeOpacity={0.7}
                        key={'touch-' + i}
                        onPress={()=>{
                            let dpId = content.match(/\d{1,11}/)[0];
                            this.props.navigation.push('Details', {
                                threadDetail: {
                                    id: dpId, 
                                    userid: 'null', 
                                    content: 'null',
                                    now: '2099-12-12 12:12:12'
                                }
                            })
                        }}>
                        <Text key={'text-' + i}  style={styles.quoteText}>{contentDom}</Text>
                    </TouchableOpacity>);
                }
                else {
                    displayData['threadContent'].push(
                        <Text key={'text-' + i}  style={styles.quoteText}>{contentDom}</Text>
                    );
                }
                if(UISetting.nestedQuoteCount !== 0) {
                    displayData['threadContent'].push(
                        <ItemQuote counter={0} key={'quote-' + i} id={content} navigation={this.props.navigation} po={this.props.po}></ItemQuote>
                    );
                }
            }
            else {
                let contentDom = getHTMLDom(content, this._onPressUrl);
                displayData['threadContent'].push(
                    <Text key={'text-' + i} style={[styles.mainListItemContent, {color: UISetting.colors.threadFontColor}]}>{contentDom}</Text>
                );
            }
        }
        this.setState({
            displayData: displayData,
        });
    }
    _longPressItem = (res) => {
        this.setState({
            selected: true
        });
        if(this.props.longPressItem && typeof this.props.longPressItem == 'function') {
            this.props.longPressItem(res, this.props.itemDetail.id, ()=>{
                this.setState({
                    selected: false
                });
            });
        }
    }
    render() {
        let { itemDetail } = this.props;
        return (
            <TouchableOpacity style={[styles.mainListItem, this.state.selected?{backgroundColor: UISetting.colors.lightColor}:{backgroundColor: UISetting.colors.threadBackgroundColor}]} onLongPress={this._longPressItem} activeOpacity={1}>
                <MainListItemHeader itemDetail={itemDetail} po={this.props.po}/>
                {this.state.displayData['threadContent']}
                <MainListImage 
                    tid={itemDetail.id}
                    navigation={this.props.navigation}
                    Toast={this.props.Toast}
                    localUri={this.state.imgLocalUri}
                    imgUri={itemDetail.img + itemDetail.ext}/>
            </TouchableOpacity>
        );
    }
}

export { DetailListItem }