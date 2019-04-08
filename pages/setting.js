import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Slider } from 'react-native'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic, UISetting, setUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { ActionSheet } from '../component/action-sheet'

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    fontSizeView: {

    },
    itemSplitLine: {
        height: 1,
        backgroundColor: UISetting.colors.defaultBackgroundColor,
        marginLeft: 15,
    },
    settingGroup: {
        backgroundColor: UISetting.colors.threadBackgroundColor,
        marginTop: 5,
        marginBottom: 5,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    settingTitle: {
        fontSize: 18,
        color: UISetting.colors.lightFontColor,
        marginLeft: 5,
        marginTop: 15
    },
    settingItem: {
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 15,
        paddingRight: 15,
        paddingTop: 8,
        paddingBottom: 8,
    },
    settingItemText: {
        fontSize: 20,
        color: UISetting.colors.threadFontColor,
        lineHeight: 20
    }
});

class SettingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFontSize: false,
            fontSizeString: '1x'
        };
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title:  `${configBase.islandList[configDynamic.islandMode].displayName}(${navigation.getParam('name', '时间线')})`,
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
        });
        this.setState({
            fontSizeString: `${UISetting.fontScale}x`
        });
    }
    _pressFontSize = () => {
        this.setState({
            showFontSize: !this.state.showFontSize
        });
    }
    _onFontSizeChange = (value) => {
        setUISetting('fontScale', parseFloat(value.toFixed(1)));
        this.forceUpdate();
        this.props.navigation.setParams({a: Math.random()});
        this.setState({
            fontSizeString: `${UISetting.fontScale}x`
        });
    }
    render() {
        return (
            <SafeAreaView style={{flex:1, backgroundColor: UISetting.colors.defaultBackgroundColor}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
                <ScrollView style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <Text style={styles.settingTitle}>
                        外观设置
                    </Text>
                    <View style={styles.settingGroup}>
                        <TouchableOpacity style={styles.settingItem} onPress={this._pressFontSize}>
                            <View>
                                <Text style={styles.settingItemText}>
                                    字体大小
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.settingItemText}>{this.state.fontSizeString}</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showFontSize?styles.fontSizeView:styles.displayNone}>
                            <Slider
                                style={{marginLeft: 10, marginRight: 10}}
                                maximumValue={3}
                                minimumValue={0.2}
                                minimumTrackTintColor={UISetting.colors.linkColor}
                                step={0.1}
                                onValueChange={this._onFontSizeChange}
                                value={UISetting.fontScale}></Slider>
                        </View>
                        <View style={styles.itemSplitLine}></View>

                        <View style={styles.settingItem}>
                            <View>
                                <Text style={styles.settingItemText}>
                                    主题配色
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.settingItemText}>无</Text>
                            </View>
                        </View>
                    </View>
                    
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export { SettingScreen };