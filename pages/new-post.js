import React from 'react'
import { Text, View, Image, StyleSheet, ScrollView, Dimensions, TouchableOpacity, TextInput, Keyboard, Animated, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal, TopModalApis } from '../component/top-modal'
import { replyNewThread } from '../modules/apis'
import { ActionSheet, ActionSheetApis } from '../component/action-sheet'
import ImagePicker from 'react-native-image-picker';
const globalColor = '#fa7296';
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
        padding: 2,
        backgroundColor: '#F5F5F5'
    },
    inputText: {
        backgroundColor: '#FFF',
        flex: 1,
        textAlignVertical: 'top',
        fontSize: 20
    },
    toolsView: {
        height: 50,
        backgroundColor: globalColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 12
    },
    emoticonView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        overflow: 'scroll'
    },
    emoticonItemView: {
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderLeftWidth: 1,
        borderColor: globalColor
    },
    emoticonText: {
        fontSize: 20,
        color: '#696969'
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
    }
});

class NewPostScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottomHeight: 0,
            inputText: '',
            imageWatermark: false,
            selectdeImage: null,
            translateNow: new Animated.Value(0),
            sending: false
        }
    }
    static navigationOptions = ({ navigation }) => {
        //const { params = {} } = navigation.state;
        return {
            title: navigation.getParam('mode', 1) == 1 ? 
                `回复 No.${navigation.getParam('replyId', '0')}`
                :
                `发串 (${navigation.getParam('fname', '错误')})`
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
    }
    componentWillUnmount() {
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }
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
     * 键盘打开或改变
     */
    _keyboardWillShow = (e) => {
        this.setState({
            bottomHeight: e.endCoordinates.height
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
        if(this._sending){
            return;
        }
        if(!this.state.selectdeImage && this.state.inputText.length <= 0) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', '请输入内容','确认');
            return;
        }
        this._sending = true;
        this.setState({
            sending: true,
        });
        let res = await replyNewThread(
            this.mode,
            this.mode == 1 ? this.replyId: this.fid,
            this.state.inputText,
            '','','',
            this.state.selectdeImage?this.state.selectdeImage.uri:null,
            this.state.imageWatermark,
            this._setProgress
        );
        this._sending = false;
        this.setState({
            sending: false,
        });
        if(res.status == 'ok') {
            this.props.navigation.goBack();
        }
        else {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', res.errmsg,'确认');
            this._setProgress(0);
        }
    }

    /**
     * 将图片显示在工具栏上
     * @param {object} imgData 选择或拍照的数据
     */
    _selectImageHandle(imgData) {
        if(imgData.error) {
            TopModalApis.showMessage(this.refs['msgBox'], '错误', imgData.error,'确认');
        }
        else {
            TopModalApis.showMessage(this.refs['msgBox'], '提示', '图片添加水印？', '是', ()=>{
                TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                    this.setState({
                        imageWatermark: true,
                        selectdeImage: {uri: imgData.uri}
                    });
                });
            }, '否', ()=>{
                TopModalApis.closeModal(this.refs['msgBox'], ()=>{
                    this.setState({
                        imageWatermark: false,
                        selectdeImage: {uri: imgData.uri}
                    });
                });
            });
        }
    }
    /**
     * 预览图片
     */
    _viewImage = () => {
        console.log('view image');
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
        ActionSheetApis.showActionSheet(
            this.refs['actMenu'], 
            Dimensions.get('window').width / 3 - 12 + 12,
            Dimensions.get('window').height - 50,
            '选择图片',
            ['相机', '从相册选择', '涂鸦(未实现)', '芦苇娘(未实现)'], 
            (index) => {
                ActionSheetApis.closeActionSheet(this.refs['actMenu'], ()=>{
                    switch (index) {
                        case 0:
                            ImagePicker.launchCamera({
                                cameraType: 'back',
                                mediaType: 'photo',
                                noData: true,
                                //allowsEditing: true,
                            }, (response) => {
                                if(!response.didCancel) {
                                    this._selectImageHandle(response);
                                }
                            });
                            break;
                        case 1:
                            ImagePicker.launchImageLibrary({
                                mediaType: 'photo',
                                noData: true
                                //allowsEditing: true,
                            }, (response) => {
                                if(!response.didCancel) {
                                    this._selectImageHandle(response);
                                }
                            });
                            break;
                        case 2:
                            TopModalApis.showMessage(this.refs['msgBox'], '错误', '未实现','确认');
                            break;
                        case 3:
                            TopModalApis.showMessage(this.refs['msgBox'], '错误', '未实现','确认');
                            break;
                    }
                });
            });
    }
    /**
     * 打开颜文字输入
     */
    _openEmoticon = () => {
        Keyboard.dismiss();
        let tempList = [];
        for(let i = 0; i < emoticonList.length; i++) {
            tempList.push(
            <TouchableOpacity key={i+1} style={styles.emoticonItemView} onPress={()=>{this.setState({inputText: this.state.inputText + emoticonList[i]});}}>
                <Text style={styles.emoticonText}>{emoticonList[i]}</Text>
            </TouchableOpacity>);
        }
        TopModalApis.showMessage(this.refs['msgBox'], '颜文字', 
        (
            <ScrollView>
                <View style={styles.emoticonView}>
                    {tempList}
                </View>
            </ScrollView>
        ),
        '确认');
    }

    render() {
        return(
            <View style={[styles.pageView, {paddingBottom: this.state.bottomHeight}]}>
                <TopModal ref={'msgBox'} />
                <ActionSheet ref={'actMenu'} />
                <Animated.View style={[styles.progressView, { transform: [{ translateX: this.state.translateNow }]}]}/>
                <View style={styles.inputView}>
                    <TextInput
                        value={this.state.inputText}
                        style={styles.inputText}
                        autoCapitalize='none'
                        autoComplete='off'
                        multiline={true}
                        placeholder='串内容'
                        onChangeText={(text)=>{this.setState({inputText: text});}}
                        />
                </View>
                <View style={styles.toolsView}>
                    <TouchableOpacity style={styles.toolsButton} onPress={this._openEmoticon}>
                        <Icon name={'emotsmile'} size={24} color={'#FFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={this.state.selectdeImage?styles.displayNone:styles.toolsButton} onPress={this._selectImage}>
                    <Icon name={'picture'} size={24} color={'#FFF'} />
                        <Image resizeMode='cover' source={this.state.selectdeImage} style={this.state.selectdeImage?styles.selectedImg:styles.displayNone}/>
                    </TouchableOpacity>

                    <TouchableOpacity style={this.state.selectdeImage?styles.toolsButton:styles.displayNone} onPress={this._viewImage}>
                        <Image resizeMode='cover' source={this.state.selectdeImage} style={styles.selectedImg}/>
                        <TouchableOpacity onPress={this._removeImage} style={styles.deleteImage}>
                            <Icon name={'close'} size={14} color={'red'} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolsButton} onPress={this._clearInput}>
                        <Icon name={'trash'} size={24} color={'#FFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.toolsButton} onPress={this._startSend}>
                        <Icon style={this.state.sending?styles.displayNone:{}} name={'paper-plane'} size={24} color={'#FFF'} />
                        <ActivityIndicator style={this.state.sending?{}:styles.displayNone} color={'#FFF'} size='small'/>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


export {NewPostScreen}