import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, TextInput, Keyboard, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { replyThread } from '../modules/apis'
import { ActionSheet } from '../component/action-sheet'
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
        width: Dimensions.get('window').width * 0.95,
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
            messageModal: {
                show: false,
                title: '提示',
                content: <Text></Text>,
                leftButtonText: '',
                rightButtonText: '',
                leftButtonCallBack: null,
                rightButtonCallBack: null,
                closedCallback: null,
                width: 280
            },
            actionSheet: {
                show: false,
                top: 0,
                left: 0,
                title: '',
                items: [],
                closedCallback: null,
                onItemPress: null
            },
        }
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: navigation.getParam('mode', 0)==1?`回复 No.${navigation.getParam('replyId', '0')}`:'发串'
        }
    }
    keyboardWillShowListener = null;
    keyboardWillHideListener = null;
    componentDidMount() {
        this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this._keyboardWillShow.bind(this));
        this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this._keyboardWillHide.bind(this));
    }
    componentWillUnmount() {
        this.keyboardWillShowListener.remove();
        this.keyboardWillHideListener.remove();
    }
    /**
     * 显示一个信息窗口
     */
    showMessageModal = async (title, content, successButtonText, successButtonCallBack = null, cancelButtonText = null, cancelButtonCallBack = null) => {
        let closeModal = ()=>{this.closeMessageModal()};
        this.setState({
            messageModal: {
                show: true,
                title: title,
                width: 280,
                content: (<Text style={{width: 260, fontSize: 20, margin: 10}}>{content}</Text>),
                leftButtonText: cancelButtonText,
                rightButtonText: successButtonText,
                leftButtonCallBack: cancelButtonCallBack == null?closeModal:cancelButtonCallBack,
                rightButtonCallBack: successButtonCallBack == null?closeModal:successButtonCallBack,
                closedCallback: ()=>{}
            }
        });
    }
    /**
     * 关闭信息窗口
     */
    closeMessageModal = (callback = ()=>{}) => {
        //这样关闭可以防止闪烁
        let tempObj = {
            show: false,
            title: this.state.messageModal.title,
            content: this.state.messageModal.content,
            width: this.state.messageModal.width,
            leftButtonText: this.state.messageModal.leftButtonText,
            rightButtonText: this.state.messageModal.rightButtonText,
            leftButtonCallBack: null,
            rightButtonCallBack: null,
            closedCallback: ()=>callback()
        }
        Keyboard.dismiss();
        this.setState({
            messageModal: tempObj
        });
    }
    /**
     * 关闭ActionSheet
     */
    closeActionSheet = (callback = ()=>{}) => {
        let tempObj = {
            show: false,
            top: this.state.actionSheet.top,
            left: this.state.actionSheet.left,
            title: this.state.actionSheet.title,
            items: this.state.actionSheet.items,
            closedCallback: ()=>callback(),
            onItemPress: null
        }
        this.setState({
            actionSheet: tempObj
        });
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
        if(this.state.inputText.length <= 0) {
            this.showMessageModal('错误', '请输入内容', '确认');
            return;
        }
        let res = await replyThread(
            this.props.navigation.getParam('replyId', '0'),
            this.state.inputText,
            '','','',
            this.state.selectdeImage?this.state.selectdeImage.uri:null,
            this.state.imageWatermark);
        if(res.status == 'ok') {
            this.props.navigation.goBack();
        }
        else {
            this.showMessageModal('错误', res.errmsg, '确认');
        }
    }

    /**
     * 将图片显示在工具栏上
     * @param {object} imgData 选择或拍照的数据
     */
    _selectImageHandle(imgData) {
        if(imgData.error) {
            this.showMessageModal('错误', imgData.error, '确认');
        }
        else {
            this.showMessageModal('提示', '图片添加水印？', '是', ()=>{
                this.closeMessageModal(()=>{
                    this.setState({
                        imageWatermark: true,
                        selectdeImage: {uri: imgData.uri}
                    });
                });
            }, '否', ()=>{
                this.closeMessageModal(()=>{
                    this.setState({
                        imageWatermark: true,
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
        this.setState({
            actionSheet: {
                show: true,
                top: Dimensions.get('window').height - 50,
                left: Dimensions.get('window').width / 3 - 12 + 12,
                title: '选择图片',
                items: [
                    '相机',
                    '从相册选择',
                    '涂鸦(未实现)',
                    '芦苇娘(未实现)'
                ],
                onItemPress:(index) => {
                    this.closeActionSheet(()=>{
                        switch (index) {
                            case 0:
                                ImagePicker.launchCamera({
                                    cameraType: 'back',
                                    mediaType: 'photo',
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
                                    //allowsEditing: true,
                                }, (response) => {
                                    if(!response.didCancel) {
                                        this._selectImageHandle(response);
                                    }
                                });
                                break;
                            case 2:
                                this.showMessageModal('错误', '未实现', '确认');
                                break;
                            case 3:
                                this.showMessageModal('错误', '未实现', '确认');
                                break;
                        }
                    });
                }
            }
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
        this.setState({
            messageModal: {
                show: true,
                title: '颜文字',
                width: Dimensions.get('window').width * 0.95,
                content: (
                <View style={styles.emoticonView}>
                    {tempList}
                </View>
                    ),
                rightButtonText: '确认',
                rightButtonCallBack: ()=>this.closeMessageModal(),
                closedCallback: ()=>{}
            }
        });
    }

    render() {
        return(
            <View style={[styles.pageView, {paddingBottom: this.state.bottomHeight}]}>
                <TopModal
                    show={this.state.messageModal.show}
                    width={this.state.messageModal.width}
                    title={ this.state.messageModal.title }
                    rightButtonText={this.state.messageModal.rightButtonText}
                    leftButtonText={this.state.messageModal.leftButtonText}
                    item={this.state.messageModal.content}
                    onClosePress={()=>this.closeMessageModal()}
                    onRightButtonPress={this.state.messageModal.rightButtonCallBack} 
                    onLeftButtonPress={this.state.messageModal.leftButtonCallBack}
                    closedCallback={this.state.messageModal.closedCallback}/>
                <ActionSheet 
                    show={this.state.actionSheet.show}
                    top={this.state.actionSheet.top}
                    left={this.state.actionSheet.left}
                    title={this.state.actionSheet.title}
                    items={this.state.actionSheet.items}
                    onItemPress={this.state.actionSheet.onItemPress}
                    closedCallback={this.state.actionSheet.closedCallback}
                    onClosePress={()=>this.closeActionSheet()}/>
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
                        <Icon name={'paper-plane'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


export {NewPostScreen}