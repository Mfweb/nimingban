import React from 'react'
import { Text, View, Image, StyleSheet, FlatList, Dimensions, TouchableOpacity, TextInput, Keyboard, Animated } from 'react-native'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { TopModal } from '../component/top-modal'
import { replyThread } from '../modules/apis'
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
    }
});

class NewPostScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottomHeight: 0,
            inputText: '',
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
            this.state.inputText);
        if(res.status == 'ok') {
            this.props.navigation.goBack();
        }
        else {
            this.showMessageModal('错误', res.errmsg, '确认');
        }
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
                    <TouchableOpacity onPress={this._openEmoticon}>
                    <Icon name={'emotsmile'} size={24} color={'#FFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity>
                    <Icon name={'picture'} size={24} color={'#FFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this._clearInput}>
                    <Icon name={'trash'} size={24} color={'#FFF'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={this._startSend}>
                    <Icon name={'paper-plane'} size={24} color={'#FFF'} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}


export {NewPostScreen}