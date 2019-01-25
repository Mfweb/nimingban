import React from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, SectionList, Dimensions, TouchableOpacity } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { getForumList } from '../modules/network'
import { getHTMLDom } from '../modules/html-decoder'
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const globalColor = '#f45a8d';
const styles = StyleSheet.create({
    wlp: {
        height: (Dimensions.get('window').width * 0.7),
        width: (Dimensions.get('window').width * 0.7)
    },
    groupView: {
        paddingLeft: 5,
        backgroundColor: '#D3D3D3',
        marginBottom: 5,
        paddingTop: 8,
        paddingBottom: 8,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        shadowColor: '#696969',
    },
    groupText: {
        color: globalColor,
        fontSize: 24,
    },
    itemView: {
        marginLeft: 10,
        paddingTop: 5,
        paddingBottom: 5
    },
    itemText: {
        fontSize: 20
    },
    bottomTools: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        backgroundColor: globalColor
    },
    bottomToolsItem: {

    }
});


class LeftDrawerNavigator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            forumList: [],
            headerLoading: false
        };
    }

    componentDidMount() {
        this._pullDownRefresh(false);
    }

    _renderSectionHeader = ({section}) => {
        return (
            <View style={styles.groupView}>
                <Text style={styles.groupText}>
                    {section.groupName}
                </Text>
            </View>
        );
    }

    _onPressItem = (item)=> {
        this.props.navigation._childrenNavigation.Home.reset([
            NavigationActions.navigate({ 
                routeName: 'Home',
                params: {
                    forumID: item.id,
                    name: item.name
                }
            })
        ], 0);
        this.props.navigation.closeDrawer();
    }
    _renderItem = ({item}) => {
        let displayName = item.showName?getHTMLDom(item.showName):getHTMLDom(item.name);
        return(
            <TouchableOpacity onPress={()=>this._onPressItem(item)}>
                <View style={styles.itemView}>
                    <Text style={styles.itemText}>
                    {displayName}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }
    _listHeaderComponent = () => (
        <Image style={styles.wlp} resizeMode='contain' resizeMethod='scale' source={require('../imgs/menu-top.jpg')}/>
    );
    _pullDownRefresh = (force) => {
        this.setState({
            headerLoading: true
        }, ()=>{
            getForumList(force).then((res) => {
                if(res.status == 'ok') {
                    let tempList = Array();
                    res.res.forEach(forumGroup => {
                        tempList.push({
                            groupName: forumGroup.name,
                            data: forumGroup.forums.slice()
                        });
                    });
                    this.setState({
                        forumList: tempList,
                        headerLoading: false
                    });
                }
                else {
                    alert('获取板块列表失败,' + res.errmsg);
                    this.setState({
                        headerLoading: false
                    });
                }
            }).catch(()=>{
                alert('获取板块列表失败');
                this.setState({
                    headerLoading: false
                });
            });
        });
    }
    render() {
        return (
            <View style={{top: 0, flex:1,flexDirection: 'column', justifyContent:'flex-start', backgroundColor: '#FFF'}}>
                <View style={{backgroundColor: globalColor, top: 0, height: 45}} />       
                
                <SectionList
                    onRefresh={()=>this._pullDownRefresh(true)}
                    refreshing={this.state.headerLoading}
                    ListHeaderComponent={this._listHeaderComponent}
                    renderSectionHeader={this._renderSectionHeader}
                    renderItem={this._renderItem}
                    sections={this.state.forumList}
                    keyExtractor={(item, index) => {return index.toString()}}
                />      
                <SafeAreaView>
                    <View style={styles.bottomTools}>
                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity>
                                <Icon name={'settings'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity>
                                <Icon name={'star'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bottomToolsItem}>
                            <TouchableOpacity>
                                <Icon name={'user'} size={32} color={'#FFF'} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            </View>
        );
    }
}


export  { LeftDrawerNavigator }