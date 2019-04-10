import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Slider, Dimensions } from 'react-native'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic, UISetting, setUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { ActionSheet } from '../component/action-sheet'
import ColorPicker from 'react-colorizer';
import { UIButton } from '../component/uibutton'

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    fontSizeView: {

    },
    themeColorValueView: {
        display: 'flex',
        flexDirection: 'row'
    },
    themeColorRect: {
        height: 18,
        width: 18,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#000",
        marginRight: 2,
        marginLeft: 2
    },
    themeColorView: {
        display: 'flex',
        flexDirection: 'column'
    },
    themeColorViewRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 5,
        paddingBottom: 5
    },
    themeColorViewColumn: {
        width: '50%',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 15,
        paddingRight: 15
    },
    themeColorToolsView: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 20,
        paddingRight: 20,
        paddingBottom: 20
    },
    itemSplitLine: {
        height: 1,
        marginLeft: 15,
    },
    settingGroup: {
        marginTop: 5,
        marginBottom: 5,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start'
    },
    settingTitle: {
        fontSize: 18,
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
        lineHeight: 20
    },
    settingItemValueText: {
        fontSize: 18,
        lineHeight: 20
    }
});

class SettingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showFontSize: false,
            fontSizeString: '1x',

            showThemeColor: false,
            showThemeColorPicker: false,
            themeColorKeyNow: '',
        };
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            headerBackTitle: null,
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
                    <Text style={[styles.settingTitle, {color: UISetting.colors.lightFontColor}]}>
                        外观设置
                    </Text>
                    <View style={[styles.settingGroup, {backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                        <TouchableOpacity style={styles.settingItem} onPress={()=>this.setState({showFontSize: !this.state.showFontSize})}>
                            <View>
                                <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                    字体大小
                                </Text>
                            </View>
                            <View>
                                <Text style={[styles.settingItemValueText, {color: UISetting.colors.lightFontColor}]}>{this.state.fontSizeString}</Text>
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
                        <View style={[styles.itemSplitLine, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}></View>

                        <TouchableOpacity style={styles.settingItem} onPress={()=>this.setState({showThemeColor: !this.state.showThemeColor})}>
                            <View>
                                <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                    主题配色
                                </Text>
                            </View>
                            <View style={styles.themeColorValueView}>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.globalColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.lightColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.fontColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.lightFontColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.threadFontColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.threadBackgroundColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}></View>
                                <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.linkColor}]}></View>
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showThemeColor?styles.themeColorView:styles.displayNone}>
                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'globalColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        UI主色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.globalColor}]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'lightColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        淡化色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.lightColor}]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'fontColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        UI字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.fontColor}]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'lightFontColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        淡化字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.lightFontColor}]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'threadFontColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        串字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.threadFontColor}]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'threadBackgroundColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        串背景色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.threadBackgroundColor}]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'defaultBackgroundColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        其他景色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={()=>this.setState({themeColorKeyNow: 'linkColor', showThemeColorPicker: true})}>
                                    <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                        强调色：
                                    </Text>
                                    <View style={[styles.themeColorRect, {backgroundColor: UISetting.colors.linkColor}]}></View>
                                </TouchableOpacity>
                            </View>
                            <View style={this.state.showThemeColorPicker?{}:styles.displayNone}>
                                <ColorPicker
                                    height={50}
                                    color={UISetting.colors[this.state.themeColorKeyNow]}
                                    width={Dimensions.get('window').width}
                                    onPressOut={()=>{
                                        this.props.navigation.setParams({a: Math.random()});
                                        console.log(123);
                                    }}
                                    onColorChanged={(color)=>{
                                        UISetting.colors[this.state.themeColorKeyNow] = color;
                                        this.forceUpdate();
                                        }}/>
                                <View style={styles.themeColorToolsView}>
                                    <UIButton text={'更新'}
                                        style={{backgroundColor: UISetting.colors.globalColor}}
                                        textStyle={{color: UISetting.colors.fontColor, fontSize: 18}}
                                        showLoading={this.props.checkingSession}
                                        onPress={()=>{
                                            this.props.navigation.setParams({a: Math.random()});
                                            this.setState({
                                                showThemeColorPicker: false
                                            });
                                        }}/>
                                    <UIButton text={'取消(还原)'}
                                        style={{backgroundColor: UISetting.colors.defaultBackgroundColor}}
                                        textStyle={{color: UISetting.colors.globalColor, fontSize: 18}}
                                        showLoading={this.props.checkingSession}
                                        onPress={()=>{
                                            UISetting.colors[this.state.themeColorKeyNow] = UISetting.defaultColors[this.state.themeColorKeyNow];
                                            this.props.navigation.setParams({a: Math.random()});
                                            this.setState({
                                                showThemeColorPicker: false
                                            });
                                        }}/>
                                </View>
                            </View>
                        </View>
                    </View>


                    <Text style={[styles.settingTitle, {color: UISetting.colors.lightFontColor}]}>
                        其他
                    </Text>
                    <View style={[styles.settingGroup, {backgroundColor: UISetting.colors.threadBackgroundColor}]}>
                        <TouchableOpacity style={styles.settingItem} onPress={()=>this.props.navigation.push('WebView', {URL: 'https://github.com/Mfweb/nimingban'})}>
                            <View>
                                <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                    项目地址
                                </Text>
                            </View>
                            <View>
                                <Text style={[styles.settingItemValueText, {color: UISetting.colors.linkColor}]}>https://github.com/Mfweb/nimingban</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={[styles.itemSplitLine, {backgroundColor: UISetting.colors.defaultBackgroundColor}]}></View>

                        <View style={styles.settingItem}>
                            <View>
                                <Text style={[styles.settingItemText ,{color: UISetting.colors.threadFontColor}]}>
                                    版本号
                                </Text>
                            </View>
                            <View>
                                <Text style={[styles.settingItemValueText, {color: UISetting.colors.lightFontColor}]}>1.00 beta(build 6)</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export { SettingScreen };