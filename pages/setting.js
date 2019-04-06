import React from 'react'
import { Text, View, StyleSheet, FlatList, Dimensions, TouchableOpacity, RefreshControl, SafeAreaView, ScrollView, TextInput } from 'react-native'
import { TopModal } from '../component/top-modal'
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { configBase, configDynamic, configNetwork } from '../modules/config'
import { Toast } from '../component/toast'
import { ActionSheet } from '../component/action-sheet'

const styles = StyleSheet.create({
    settingGroup: {
        backgroundColor: '#FFF',
        marginTop: 5,
        marginBottom: 5,
        borderTopWidth: 1,
        borderTopColor: '#C0C0C0',
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0'
    },
    settingTitle: {
        fontSize: 18,
        color: "#696969",
        marginLeft: 5,
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
    settingItemLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#C0C0C0'
    },
    settingItemText: {
        fontSize: 20,
        color: '#000',
        lineHeight: 20
    }
});

class SettingScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settingList: []
        };
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title:  `${configBase.islandList[configDynamic.islandMode].displayName}(${navigation.getParam('name', '时间线')})`,
            headerLeft: (
                <TouchableOpacity style={{ marginLeft: 8, marginTop: 2 }} onPress={params.openLDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
                    <Icon name={'menu'} size={24} color={'#FFF'} />
                </TouchableOpacity>
            )
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({
            openLDrawer: this.props.navigation.openDrawer,
        });
    }

    render() {
        return (
            <SafeAreaView style={{flex:1, backgroundColor: '#DCDCDC'}}>
                <TopModal ref={(ref)=>{this.TopModal=ref;}} />
                <ActionSheet ref={(ref)=>{this.ActionSheet=ref;}} />
                <Toast ref={(ref) => {this.toast = ref}}/>
                <ScrollView style={{flex: 1}}>
                    <Text style={styles.settingTitle}>
                        外观设置
                    </Text>
                    <View style={styles.settingGroup}>
                        <View style={styles.settingItem}>
                            <View>
                                <Text style={styles.settingItemText}>
                                    字体大小
                                </Text>
                            </View>
                            <View>
                                <Text style={styles.settingItemText}>12</Text>
                            </View>
                        </View>
                    </View>
                    
                </ScrollView>
            </SafeAreaView>
        );
    }
}

export { SettingScreen };