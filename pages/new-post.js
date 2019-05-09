import React from 'react'
import { Text, View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, Keyboard, Animated, ActivityIndicator, SafeAreaView } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import MDIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import { TopModal } from '../component/top-modal'
import { replyNewThread } from '../modules/api/ano/thread'
import { getImage } from '../modules/api/image'
import { ActionSheet } from '../component/action-sheet'
import ImagePicker from 'react-native-image-crop-picker';
import { history } from '../modules/history'
import { Header } from 'react-navigation'
import { getUserCookieList, setUserCookie } from '../modules/cookie-manager'
import { configDynamic, UISetting } from '../modules/config';

const emoticonList = ["|∀ﾟ", "(´ﾟДﾟ`)", "(;´Д`)", "(｀･ω･)", "(=ﾟωﾟ)=",
    "| ω・´)", "|-` )", "|д` )", "|ー` )", "|∀` )",
    "(つд⊂)", "(ﾟДﾟ≡ﾟДﾟ)", "(＾o＾)ﾉ", "(|||ﾟДﾟ)", "( ﾟ∀ﾟ)",
    "( ´∀`)", "(*´∀`)", "(*ﾟ∇ﾟ)", "(*ﾟーﾟ)", "(　ﾟ 3ﾟ)",
    "( ´ー`)", "( ・_ゝ・)", "( ´_ゝ`)", "(*´д`)", "(・ー・)",
    "(・∀・)", "(ゝ∀･)", "(〃∀〃)", "(*ﾟ∀ﾟ*)", "( ﾟ∀。)",
    "( `д´)", "(`ε´ )", "(`ヮ´ )", "σ`∀´)", " ﾟ∀ﾟ)σ",
    "ﾟ ∀ﾟ)ノ", "(╬ﾟдﾟ)", "(|||ﾟдﾟ)", "( ﾟдﾟ)", "Σ( ﾟдﾟ)",
    "( ;ﾟдﾟ)", "( ;´д`)", "(　д ) ﾟ ﾟ", "( ☉д⊙)", "(((　ﾟдﾟ)))",
    "( ` ・´)", "( ´д`)", "( -д-)", "(>д<)", "･ﾟ( ﾉд`ﾟ)",
    "( TдT)", "(￣∇￣)", "(￣3￣)", "(￣ｰ￣)", "(￣ . ￣)",
    "(￣皿￣)", "(￣艸￣)", "(￣︿￣)", "(￣︶￣)", "ヾ(´ωﾟ｀)",
    "(*´ω`*)", "(・ω・)", "( ´・ω)", "(｀・ω)", "(´・ω・`)",
    "(`・ω・´)", "( `_っ´)", "( `ー´)", "( ´_っ`)", "( ´ρ`)",
    "( ﾟωﾟ)", "(oﾟωﾟo)", "(　^ω^)", "(｡◕∀◕｡)", "/( ◕‿‿◕ )\\",
    "ヾ(´ε`ヾ)", "(ノﾟ∀ﾟ)ノ", "(σﾟдﾟ)σ", "(σﾟ∀ﾟ)σ", "|дﾟ )",
    "┃電柱┃", "ﾟ(つд`ﾟ)", "ﾟÅﾟ )　", "⊂彡☆))д`)", "⊂彡☆))д´)",
    "⊂彡☆))∀`)", "(´∀((☆ミつ"];

const styles = StyleSheet.create({
    displayNone: {
        display: 'none'
    },
    selectedImg: {
        height: 35,
        width: 35,
        borderRadius: 3
    },
    pageView: {
        flex: 1
    },
    inputView: {
        flex: 1,
        padding: 2
    },
    inputText: {
        flex: 1,
        textAlignVertical: 'top',
        fontSize: 20
    },
    toolsView: {
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 12
    },
    emoticonItemView: {
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        width: '25%',
        overflow: 'hidden'
    },
    lwEmoticonItemView: {
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        width: '33.3%',
        height: 100
    },
    emoticonText: {
        fontSize: 18,
        lineHeight: 25,
        textAlign: 'center'
    },
    toolsButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50
    },
    deleteImage: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    progressView: {
        height: 8,
        width: Dimensions.get('window').width,
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: '#00BFFF',
        zIndex: 500
    },
    headerRightView: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerCookieView: {
        height: Header.HEIGHT,
        display: 'flex',
        marginRight: 8,
        marginLeft: 5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerCookieText: {
        lineHeight: Header.HEIGHT,
        textAlign: 'center'
    },
    bottomBoxView: {
        height: '30%',
        width: '100%',
        borderTopWidth: 1,
    },
    bottomView: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        overflow: 'scroll',
        marginTop: 1
    }
});

const modeTitleText = ['', '回复', '发串', '举报'];

class NewPostScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottomHeight: 0,
            inputText: this.props.navigation.getParam('content', ''),
            imageWatermark: false,
            selectdeImage: null,
            translateNow: new Animated.Value(0),
            sending: false,
            displayHeight: null,
            showBottomBox: false,
            bottomBoxMode: 0,
            EmoticonViews: [],
            luweiEmoticonViews: []
        }
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        const nMode = navigation.getParam('mode', 1);
        const userCookieText = navigation.getParam('userCookieText', '无');
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            title: `${modeTitleText[nMode]}-` + (nMode == 1 ? `No.${navigation.getParam('replyId', '0')}` : nMode == 2 ? navigation.getParam('fname', '错误') : navigation.getParam('repId', '?')),
            headerRight: (
                <View style={styles.headerRightView}>
                    <TouchableOpacity style={styles.headerCookieView} onPress={params.openCookieSelect} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5} >
                        <MDIcon name={'cookie'} size={24} color={UISetting.colors.fontColor} />
                        <Text style={[styles.headerCookieText, { color: UISetting.colors.fontColor }]}>{userCookieText}</Text>
                    </TouchableOpacity>
                </View>
            )
        }
    }
    replyId = 0;
    mode = 1;
    fid = 0;
    keyboardWillShowListener = null;
    keyboardWillHideListener = null;
    componentDidMount() {
        this.replyId = this.props.navigation.getParam('replyId', '0');
        this.mode = this.props.navigation.getParam('mode', 1);
        this.fid = this.props.navigation.getParam('fid', 1);

        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this));
        this._setProgress(0);
        this.props.navigation.setParams({
            openCookieSelect: this._openCookieSelect,
        });
        this._getUseCookieMark();
        this._initEmoticonList();
    }
    componentWillUnmount() {
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }
    /**
     * 初始化颜文字和芦苇娘表情包ViewMap
     */
    _initEmoticonList = () => {
        let emotiTemp = [];
        for (let i = 0; i < emoticonList.length; i++) {
            emotiTemp.push(
                <TouchableOpacity key={i + 1} style={[styles.emoticonItemView, { borderColor: UISetting.colors.fontColor }]} onPress={() => { this.setState({ inputText: this.state.inputText + emoticonList[i] }); }}>
                    <Text style={[styles.emoticonText, { color: UISetting.colors.fontColor }]} numberOfLines={1}>{emoticonList[i]}</Text>
                </TouchableOpacity>);
        }
        let lwEmotiTemp = [];
        for (let i = 1; i < 107; i++) {
            lwEmotiTemp.push(
                <TouchableOpacity key={`lw${i}`} style={[styles.lwEmoticonItemView, { borderColor: UISetting.colors.fontColor }]} onPress={() => { this._downloadLw(i.toString()) }}>
                    <Image style={{ width: '100%', height: '100%' }} resizeMode={'contain'} source={{ url: `https://amember.mfweb.top/adao/luwei/lw${i}.png` }}></Image>
                </TouchableOpacity>);
        }
        this.setState({
            EmoticonViews: emotiTemp,
            luweiEmoticonViews: lwEmotiTemp
        });
    }
    _downloadLw = (index) => {
        let url = `https://amember.mfweb.top/adao/luwei/lw${index}.png`
        getImage('customize', url, `lw${index}.png`).then((res) => {
            if (res.status == 'ok') {
                this.setState({
                    imageWatermark: false,
                    showBottomBox: false,
                    selectdeImage: { uri: `file://${res.path}` }
                });
            }
            else {
                this.TopModal.showMessage('错误', res.errmsg, '确认');
                this.setState({
                    showBottomBox: false
                });
            }
        });
    }
    /**
     * 发送进度条
     */
    _setProgress = (targetValue) => {
        Animated.timing(
            this.state.translateNow,
            {
                toValue: (-Dimensions.get('window').width) + Dimensions.get('window').width * (targetValue / 100),
                duration: 300,
                useNativeDriver: true,
                stiffness: 80
            }
        ).start();
    }
    /**
     * 获取饼干列表
     */
    _getUseCookieMark = async () => {
        let cookieList = await getUserCookieList();
        if (cookieList.length > 0) {
            cookieList.forEach(item => {
                if (`userhash=${item.value}` == configDynamic.userCookie[configDynamic.islandMode]) {
                    this.props.navigation.setParams({
                        userCookieText: item.mark
                    });
                }
            });
        }
    }
    /**
     * 打开饼干选择
     */
    _openCookieSelect = async () => {
        let cookieList = await getUserCookieList();
        if (cookieList.length === 0) {
            this.TopModal.showMessage('错误', '你没有饼干，请先在饼干管理器导入饼干', '确认');
            return;
        }
        let cookieNameList = [];
        cookieList.forEach(item => {
            if (`userhash=${item.value}` == configDynamic.userCookie[configDynamic.islandMode]) {
                cookieNameList.push(`${item.mark}✔`);
            }
            else {
                cookieNameList.push(item.mark);
            }
        });
        this.ActionSheet.showActionSheet(Dimensions.get('window').width, Header.HEIGHT, '选择要使用的饼干',
            cookieNameList,
            (index) => {
                this.ActionSheet.closeActionSheet();
                setUserCookie(cookieList[index].value);
                this.props.navigation.setParams({
                    userCookieText: cookieList[index].mark
                });
            });
    }
    /**
     * 键盘打开或改变
     */
    _keyboardWillShow = (e) => {
        this.setState({
            bottomHeight: e.endCoordinates.height,
            showBottomBox: false
        });
    }
    /**
     * 键盘关闭
     */
    _keyboardWillHide = () => {
        this.setState({
            bottomHeight: 0
        });
    }
    /**
     * 清空输入
     */
    _clearInput = () => {
        Keyboard.dismiss();
        this.setState({
            inputText: ''
        });
    }

    /**
     * 开始发送
     */
    _startSend = async () => {
        Keyboard.dismiss();
        if (this._sending) {
            return;
        }
        if (!this.state.selectdeImage && this.state.inputText.length <= 0) {
            this.TopModal.showMessage('错误', '请输入内容', '确认');
            return;
        }
        this._sending = true;
        this.setState({
            sending: true,
            showBottomBox: false
        });
        let res = await replyNewThread(
            this.mode,
            this.mode == 1 ? this.replyId : this.fid,
            this.state.inputText,
            '', '', '',
            this.state.selectdeImage ? this.state.selectdeImage.uri : null,
            this.state.imageWatermark,
            this._setProgress
        );
        this._sending = false;
        this.setState({
            sending: false,
        });
        if (res.status == 'ok') {
            if (this.props.navigation.getParam('mode', 1) == 1) {
                history.addNewHistory('reply', this.props.navigation.getParam('threadDetail', 'null'), Date.parse(new Date()))
                    .then(() => {
                        this.props.navigation.goBack();
                    });
            }
            else {
                this.props.navigation.goBack();
            }
        }
        else {
            this.TopModal.showMessage('错误', res.errmsg, '确认');
            this._setProgress(0);
        }
    }

    /**
     * 将图片显示在工具栏上
     * @param {object} imgData 选择或拍照的数据
     */
    _selectImageHandle(imgData) {
        this.TopModal.showMessage('提示', '图片添加水印？', '是', () => {
            this.TopModal.closeModal(() => {
                this.setState({
                    imageWatermark: true,
                    selectdeImage: { uri: `file://${imgData}` }
                });
            });
        }, '否', () => {
            this.TopModal.closeModal(() => {
                this.setState({
                    imageWatermark: false,
                    selectdeImage: { uri: `file://${imgData}` }
                });
            });
        });
    }
    /**
     * 预览图片
     */
    _viewImage = () => {
        this.props.navigation.push('ImageViewer', {
            imageUrl: this.state.selectdeImage.uri
        });
    }
    /**
     * 去掉图片
     */
    _removeImage = () => {
        this.setState({
            selectdeImage: null
        });
    }
    /**
     * 选择图片
     */
    _selectImage = () => {
        Keyboard.dismiss();
        this.setState({
            showBottomBox: false
        });
        this.ActionSheet.showActionSheet(Dimensions.get('window').width / 3 - 12 + 12, this.bodyViewBottom,
            '选择图片',
            ['相机', '从相册选择', '涂鸦(未实现)', '芦苇娘'],
            (index) => {
                this.ActionSheet.closeActionSheet(() => {
                    switch (index) {
                        case 0:
                            this._selectImageFromCamera();
                            break;
                        case 1:
                            this._selectImageFromLibrary();
                            break;
                        case 2:
                            this.TopModal.showMessage('错误', '未实现', '确认');
                            break;
                        case 3:
                            Keyboard.dismiss();
                            if (this.state.showBottomBox && this.state.bottomBoxMode != 1) {
                                this.setState({
                                    bottomBoxMode: 1
                                });
                                return;
                            }
                            this.setState({
                                showBottomBox: !this.state.showBottomBox,
                                bottomBoxMode: 1
                            });
                            break;
                    }
                });
            });
    }

    /**
     * 拍照
     */
    _selectImageFromCamera = async () => {
        try {
            let pickerImage = await ImagePicker.openCamera({
                mediaType: 'photo',
                cropping: false,
                multiple: false,
                writeTempFile: false,
                includeBase64: false,
                compressImageQuality: 0.8
            });
            if (!pickerImage) {
                return;
            }
            if (pickerImage.size > (2 * 1024 * 1024)) {
                this.TopModal.showMessage('错误', '图片大于2M，请重新选择', '确认');
            }
            else {
                this._selectImageHandle(pickerImage.path);
            }
        } catch {
        }
    }
    /**
     * 从图库中选择图片
     */
    _selectImageFromLibrary = async () => {
        try {
            let pickerImage = await ImagePicker.openPicker({
                mediaType: 'photo',
                cropping: false,
                multiple: false,
                writeTempFile: false,
                includeBase64: false,
                compressImageQuality: 0.8
            });
            if (!pickerImage) {
                return;
            }
            if (pickerImage.size > (2 * 1024 * 1024)) {
                this.TopModal.showMessage('错误', '图片大于2M，请重新选择', '确认');
            }
            else {
                this._selectImageHandle(pickerImage.path);
            }
        } catch {
        }
    }
    /**
     * 打开颜文字输入
     */
    _openEmoticon = () => {
        Keyboard.dismiss();
        if (this.state.showBottomBox && this.state.bottomBoxMode != 0) {
            this.setState({
                bottomBoxMode: 0
            });
            return;
        }
        this.setState({
            showBottomBox: !this.state.showBottomBox,
            bottomBoxMode: 0
        });
    }

    render() {
        return (
            <View style={[styles.pageView, { paddingBottom: this.state.bottomHeight }]}>
                <TopModal ref={(ref) => { this.TopModal = ref; }} maxHeight={this.state.displayHeight} />
                <ActionSheet ref={(ref) => { this.ActionSheet = ref; }} />
                <Animated.View style={[styles.progressView, { transform: [{ translateX: this.state.translateNow }] }]} />
                <View
                    style={[styles.inputView, { backgroundColor: UISetting.colors.defaultBackgroundColor }]}
                    onLayout={(e) => {
                        this.setState({
                            displayHeight: e.nativeEvent.layout.height
                        });
                        if (!this.bodyViewBottom) {
                            this.bodyViewBottom = e.nativeEvent.layout.height + Header.HEIGHT
                        }
                    }}
                >
                    <TextInput
                        value={this.state.inputText}
                        style={[styles.inputText, { backgroundColor: UISetting.colors.threadBackgroundColor,color: UISetting.colors.lightFontColor }]}
                        autoCapitalize='none'
                        autoComplete='off'
                        multiline={true}
                        placeholder='串内容'
                        onChangeText={(text) => { this.setState({ inputText: text }); }}
                    />
                </View>
                <SafeAreaView style={{ backgroundColor: UISetting.colors.globalColor }}>
                    <View style={[styles.toolsView, { backgroundColor: UISetting.colors.globalColor }]}>
                        <TouchableOpacity style={styles.toolsButton} onPress={this._openEmoticon}>
                            <Icon name={'emotsmile'} size={24} color={UISetting.colors.fontColor} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={this.state.selectdeImage ? styles.displayNone : styles.toolsButton}
                            onPress={this._selectImage}>
                            <Icon name={'picture'} size={24} color={UISetting.colors.fontColor} />
                            <Image resizeMode='cover' source={this.state.selectdeImage} style={this.state.selectdeImage ? styles.selectedImg : styles.displayNone} />
                        </TouchableOpacity>

                        <TouchableOpacity style={this.state.selectdeImage ? styles.toolsButton : styles.displayNone} onPress={this._viewImage}>
                            <Image resizeMode='cover' source={this.state.selectdeImage} style={styles.selectedImg} />
                            <TouchableOpacity onPress={this._removeImage} style={styles.deleteImage}>
                                <Icon name={'close'} size={14} color={'red'} />
                            </TouchableOpacity>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolsButton} onPress={this._clearInput}>
                            <Icon name={'trash'} size={24} color={UISetting.colors.fontColor} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.toolsButton} onPress={this._startSend}>
                            <Icon style={this.state.sending ? styles.displayNone : {}} name={'paper-plane'} size={24} color={UISetting.colors.fontColor} />
                            <ActivityIndicator style={this.state.sending ? {} : styles.displayNone} color={UISetting.colors.fontColor} size='small' />
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={[this.state.showBottomBox ? styles.bottomBoxView : styles.displayNone, { borderTopColor: UISetting.colors.defaultBackgroundColor }]}>
                        <View style={styles.bottomView}>
                            {this.state.bottomBoxMode == 0
                                ?
                                this.state.EmoticonViews
                                :
                                this.state.luweiEmoticonViews}
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }
}


export { NewPostScreen }