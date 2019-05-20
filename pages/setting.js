import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, Switch } from 'react-native'
import Slider from '@react-native-community/slider';
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configNetwork, configDynamic, UISetting, saveUISetting } from '../modules/config'
import { Toast } from '../component/toast'
import { ActionSheet } from '../component/action-sheet'
import ColorPicker from 'react-colorizer';
import { UIButton } from '../component/uibutton'
import SoundPlayer from 'react-native-sound'
import packageJson from '../package.json';
const timeFormatDisplayName = ['1天内相对时间', '原始格式', '始终绝对时间', '简化绝对'];

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    fontSizeView: {

    },
    themeColorValueView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
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
        alignItems: 'center',
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
    timeFormatItem: {
        marginTop: 5,
        marginBottom: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center'
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
        alignItems: 'center',
        marginLeft: 15,
        paddingRight: 15,
        paddingTop: 8,
        paddingBottom: 8,
    },
    settingItemText: {
        fontSize: 20,
        lineHeight: 40
    },
    settingItemValueText: {
        fontSize: 16,
        lineHeight: 20,
        flex: 1,
        textAlign: 'right'
    },
    settingItemValueView: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        flex: 1
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

            showTimeFormat: false,

            showNestedQuoteCount: false,
            nestedQuoteCountString: UISetting.nestedQuoteCount
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
            title: `粉岛-设置`,
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={UISetting.colors.fontColor} />
                </TouchableOpacity>
            )
        }
    }
    tnnaiiSound = null;
    componentDidMount() {
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
        });
        this.setState({
            fontSizeString: `${UISetting.fontScale}x`
        });
    }
    componentWillUnmount() {
        this._soundRelease();
    }
    _soundInit() {
        if(this.tnnaiiSound === null) {
            SoundPlayer.setCategory('Playback');
            this.tnnaiiSound = new SoundPlayer('tnnaii-h-island-c.mp3', SoundPlayer.MAIN_BUNDLE, (err) => {
                if (err) {
                    console.log('load sound error:', err);
                }
            });
        }
    }
    _soundPlay() {
        this._soundInit();
        try {
            this.tnnaiiSound.setVolume(1.0);
            this.tnnaiiSound.play();
        } catch {

        }
    }
    _soundRelease() {
        if(this.tnnaiiSound !== null) {
            this.tnnaiiSound.release();
        }
    }
    _onFontSizeChange = (value) => {
        UISetting.fontScale = parseFloat(value.toFixed(1));
        saveUISetting();
        this.forceUpdate();
        this.props.navigation.setParams({ a: Math.random() });
        this.setState({
            fontSizeString: `${UISetting.fontScale}x`
        });
    }
    clickVersionCounter = 0;
    onPressVersion = () => {
        if (this.clickVersionCounter == 0) {
            setTimeout(() => {
                if (this.clickVersionCounter >= 4) {
                    this._soundPlay();
                    this.clickVersionCounter = 0;
                }
                else {
                    this.clickVersionCounter = 0;
                }
            }, 500);
        }
        this.clickVersionCounter++;
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: UISetting.colors.defaultBackgroundColor }}>
                <TopModal ref={(ref) => { this.TopModal = ref; }} />
                <ActionSheet ref={(ref) => { this.ActionSheet = ref; }} />
                <Toast ref={(ref) => { this.toast = ref }} />
                <ScrollView style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Text style={[styles.settingTitle, { color: UISetting.colors.lightFontColor }]}>
                        外观设置
                    </Text>
                    <View style={[styles.settingGroup, { backgroundColor: UISetting.colors.threadBackgroundColor }]}>
                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showFontSize: !this.state.showFontSize })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    字体大小
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>{this.state.fontSizeString}</Text>
                                <Icon name={'arrow-right'} size={12} style={{marginLeft: 4}} color={UISetting.colors.lightFontColor} />
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showFontSize ? styles.fontSizeView : styles.displayNone}>
                            <Slider
                                style={{ marginLeft: 10, marginRight: 10 }}
                                maximumValue={3}
                                minimumValue={0.2}
                                minimumTrackTintColor={UISetting.colors.linkColor}
                                step={0.1}
                                onValueChange={this._onFontSizeChange}
                                value={UISetting.fontScale}></Slider>
                        </View>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>

                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showTimeFormat: !this.state.showTimeFormat })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    黑暗模式
                                </Text>
                            </View>
                            <View>
                                <Switch
                                    value={UISetting.colorMode==1?true:false}
                                    onValueChange={(newValue)=>{
                                        UISetting.colorMode = newValue?1:0;
                                        UISetting.colors = UISetting.colorMode === 1 ? UISetting.darkColors : UISetting.userColors;
                                        this.forceUpdate();
                                        this.props.navigation.setParams({ a: Math.random() });
                                        saveUISetting();
                                    }}/>
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>

                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showThemeColor: !this.state.showThemeColor })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    主题配色
                                </Text>
                            </View>
                            <View style={styles.themeColorValueView}>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.globalColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.lightColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.fontColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.lightFontColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.threadFontColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.threadBackgroundColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.defaultBackgroundColor }]}></View>
                                <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.linkColor }]}></View>
                                <Icon name={'arrow-right'} size={12} style={{marginLeft: 4}} color={UISetting.colors.lightFontColor} />
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showThemeColor ? styles.themeColorView : styles.displayNone}>
                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'globalColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        UI主色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.globalColor }]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'lightColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        淡化色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.lightColor }]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'fontColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        UI字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.fontColor }]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'lightFontColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        淡化字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.lightFontColor }]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'threadFontColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        串字体色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.threadFontColor }]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'threadBackgroundColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        串背景色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.threadBackgroundColor }]}></View>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.themeColorViewRow}>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'defaultBackgroundColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        其他背景色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.defaultBackgroundColor }]}></View>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.themeColorViewColumn} onPress={() => this.setState({ themeColorKeyNow: 'linkColor', showThemeColorPicker: true })}>
                                    <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                        强调色：
                                    </Text>
                                    <View style={[styles.themeColorRect, { backgroundColor: UISetting.userColors.linkColor }]}></View>
                                </TouchableOpacity>
                            </View>
                            <View style={this.state.showThemeColorPicker ? {} : styles.displayNone}>
                                <ColorPicker
                                    height={50}
                                    color={UISetting.colors[this.state.themeColorKeyNow]}
                                    width={Dimensions.get('window').width}
                                    onColorChanged={(color) => {
                                        UISetting.colors[this.state.themeColorKeyNow] = color;
                                        UISetting.userColors[this.state.themeColorKeyNow] = color;
                                        this.forceUpdate();
                                    }} />
                                <View style={styles.themeColorToolsView}>
                                    <UIButton text={'更新'}
                                        backgroundColor={UISetting.colors.globalColor}
                                        textColor={UISetting.colors.fontColor}
                                        fontSize={18}
                                        width="45%"
                                        show={true}
                                        showLoading={this.props.checkingSession}
                                        onPress={() => {
                                            this.props.navigation.setParams({ a: Math.random() });
                                            this.setState({
                                                showThemeColorPicker: false
                                            });
                                            saveUISetting();
                                        }} />
                                    <UIButton text={'取消(还原)'}
                                        backgroundColor={UISetting.colors.defaultBackgroundColor}
                                        textColor={UISetting.colors.globalColor}
                                        fontSize={18}
                                        width="45%"
                                        show={true}
                                        showLoading={this.props.checkingSession}
                                        onPress={() => {
                                            UISetting.colors[this.state.themeColorKeyNow] = UISetting.defaultColors[this.state.themeColorKeyNow];
                                            UISetting.userColors[this.state.themeColorKeyNow] = UISetting.defaultColors[this.state.themeColorKeyNow];
                                            this.props.navigation.setParams({ a: Math.random() });
                                            this.setState({
                                                showThemeColorPicker: false
                                            });
                                            saveUISetting();
                                        }} />
                                </View>
                            </View>
                        </View>

                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>
                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showTimeFormat: !this.state.showTimeFormat })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    时间格式
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>{timeFormatDisplayName[UISetting.timeFormat]}</Text>
                                <Icon name={'arrow-right'} size={12} style={{marginLeft: 4}} color={UISetting.colors.lightFontColor} />
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showTimeFormat ? styles.fontSizeView : styles.displayNone}>
                            <TouchableOpacity
                                style={styles.timeFormatItem}
                                onPress={() => {
                                    this.setState({
                                        showTimeFormat: false
                                    });
                                    UISetting.timeFormat = 0;
                                    saveUISetting();
                                }}>
                                <Text style={[
                                    styles.settingItemValueText, {
                                        color: UISetting.timeFormat == 0 ? UISetting.colors.linkColor : UISetting.colors.lightFontColor,
                                        textAlign: 'center'}]}>
                                    {timeFormatDisplayName[0]}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeFormatItem}
                                onPress={() => {
                                    this.setState({
                                        showTimeFormat: false
                                    });
                                    UISetting.timeFormat = 1;
                                    saveUISetting();
                                }}>
                                <Text style={[
                                    styles.settingItemValueText, {
                                        color: UISetting.timeFormat == 1 ? UISetting.colors.linkColor : UISetting.colors.lightFontColor,
                                        textAlign: 'center' }]}>
                                    {timeFormatDisplayName[1]}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeFormatItem}
                                onPress={() => {
                                    this.setState({
                                        showTimeFormat: false
                                    });
                                    UISetting.timeFormat = 2;
                                    saveUISetting();
                                }}>
                                <Text style={[
                                    styles.settingItemValueText, {
                                        color: UISetting.timeFormat == 2 ? UISetting.colors.linkColor : UISetting.colors.lightFontColor,
                                        textAlign: 'center' }]}>
                                    {timeFormatDisplayName[2]}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.timeFormatItem}
                                onPress={() => {
                                    this.setState({
                                        showTimeFormat: false
                                    });
                                    UISetting.timeFormat = 3;
                                    saveUISetting();
                                }}>
                                <Text style={[styles.settingItemValueText, {
                                    color: UISetting.timeFormat == 3 ? UISetting.colors.linkColor : UISetting.colors.lightFontColor,
                                    textAlign: 'center' }]}>
                                    {timeFormatDisplayName[3]}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>


                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showTimeFormat: !this.state.showTimeFormat })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    快速滚动按钮
                                </Text>
                            </View>
                            <View>
                                <Switch
                                    value={UISetting.showFastScrollButton}
                                    onValueChange={(newValue)=>{
                                        UISetting.showFastScrollButton = newValue;
                                        this.forceUpdate();
                                        saveUISetting();
                                    }}/>
                            </View>
                        </TouchableOpacity>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>


                        <TouchableOpacity style={styles.settingItem} onPress={() => this.setState({ showNestedQuoteCount: !this.state.showNestedQuoteCount })}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    嵌套引用层数
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>{this.state.nestedQuoteCountString}</Text>
                                <Icon name={'arrow-right'} size={12} style={{marginLeft: 4}} color={UISetting.colors.lightFontColor} />
                            </View>
                        </TouchableOpacity>
                        <View style={this.state.showNestedQuoteCount ? styles.fontSizeView : styles.displayNone}>
                            <Slider
                                style={{ marginLeft: 10, marginRight: 10 }}
                                maximumValue={20}
                                minimumValue={0}
                                minimumTrackTintColor={UISetting.colors.linkColor}
                                step={1}
                                onValueChange={(value)=>{
                                    UISetting.nestedQuoteCount = parseInt(value);
                                    this.setState({
                                        nestedQuoteCountString: UISetting.nestedQuoteCount
                                    });
                                    saveUISetting();
                                }}
                                value={UISetting.nestedQuoteCount}></Slider>
                        </View>
                    </View>


                    <Text style={[styles.settingTitle, { color: UISetting.colors.lightFontColor }]}>
                        其他
                    </Text>
                    <View style={[styles.settingGroup, { backgroundColor: UISetting.colors.threadBackgroundColor }]}>
                        <TouchableOpacity style={styles.settingItem} onPress={() => this.props.navigation.push('WebView', { URL: 'https://github.com/Mfweb/nimingban' })}>
                            <View>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    项目地址
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text style={[styles.settingItemValueText, { color: UISetting.colors.linkColor, fontSize: 16 }]}>https://github.com/Mfweb/nimingban</Text>
                            </View>
                        </TouchableOpacity>

                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>
                        <View style={styles.settingItem}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    当前Host
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>
                                    {
                                        configNetwork.baseUrl[configDynamic.islandMode].useRedirect
                                        ?
                                        configDynamic.apiRedirectURL[configDynamic.islandMode]
                                        :
                                        configNetwork.baseUrl[configDynamic.islandMode].base
                                    }
                                </Text>
                            </View>
                        </View>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>


                        <View style={styles.settingItem}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    当前图片CDN
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>{configDynamic.imageCDNURL[configDynamic.islandMode]}</Text>
                                <Icon name={'arrow-right'} size={12} style={{marginLeft: 4}} color={UISetting.colors.lightFontColor} />
                            </View>
                        </View>
                        <View style={[styles.itemSplitLine, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}></View>


                        <TouchableOpacity
                            activeOpacity={0.9}
                            style={styles.settingItem}
                            onPress={this.onPressVersion}>
                            <View>
                                <Text style={[styles.settingItemText, { color: UISetting.colors.threadFontColor }]}>
                                    版本号
                                </Text>
                            </View>
                            <View style={styles.settingItemValueView}>
                                <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.settingItemValueText, { color: UISetting.colors.lightFontColor }]}>1.00 beta(build 14-({packageJson.version}))</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export { SettingScreen };