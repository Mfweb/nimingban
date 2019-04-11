import React, { Component } from 'react'
import { View, StyleSheet, Dimensions, CameraRoll, TouchableOpacity } from 'react-native'
import { Header } from 'react-navigation'
import ZoomImageViewer from 'react-native-image-zoom-viewer';
import { UISetting } from '../modules/config'
import { ActionSheet } from '../component/action-sheet'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { Toast } from '../component/toast'

const styles = StyleSheet.create({
    mainView: {
        top:0,
        flex: 1
    },
    headerRightView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
});


class ImageViewer extends React.Component {
    static navigationOptions = ({navigation}) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: '粉岛 - 图片预览',
            headerRight: (
                <View style={styles.headerRightView}>
                    <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={params.menuFunctions} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                        <Icon name={'options'} size={24} color={UISetting.colors.fontColor} />
                    </TouchableOpacity>
                </View>
            )
        };
    };
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.navigation.setParams({
            menuFunctions: this._menuFunctions
        });
    }
    _menuFunctions = () => {
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, this.fname,
        [
            '保存到相册',
            '百度搜图(未实现)',
            'Google搜图(未实现)',
        ],
        (index) => {
            this.ActionSheet.closeActionSheet(() => {
                switch(index) {
                    case 0:
                        this._saveToLocal();
                        break;
                    case 1:
                        break;
                    case 2:
                        break;
                }
            });
        });
    }
    _saveToLocal = async() => {
        try {
            await CameraRoll.saveToCameraRoll(this.props.navigation.getParam('imageUrl', '-1'));
            this.toast.show('保存完成');
        } catch (error) {
            this.toast.show('保存失败');
        }
    }
    render() {
        return (
            <View style={styles.mainView}>
                <Toast ref={(ref) => {this.toast = ref}}/>
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <ZoomImageViewer 
                saveToLocalByLongPress={false}
                imageUrls={[{url: this.props.navigation.getParam('imageUrl', '-1'), props: {}}]}
                backgroundColor={UISetting.colors.defaultBackgroundColor}/>
            </View>
        );
    }
}

export { ImageViewer }