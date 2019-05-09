import React, { Component } from 'react'
import { TouchableOpacity, Linking, Text, StyleSheet, ActivityIndicator, View } from 'react-native'
import { WebView } from "react-native-webview"
import Icon from 'react-native-vector-icons/SimpleLineIcons'
import { UISetting } from '../modules/config'
const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    titleText: {
        fontSize: 18
    }
});

class PinkWebView extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerStyle: {
                backgroundColor: UISetting.colors.globalColor
            },
            headerTintColor: UISetting.colors.fontColor,
            headerTitle: (
                <View style={styles.titleView}>
                    <ActivityIndicator
                        size='small'
                        hidesWhenStopped={true}
                        animating={navigation.getParam('loading', true)}
                        color={UISetting.colors.fontColor}/>
                    <Text style={[styles.titleText, {color: UISetting.colors.fontColor}]}>{navigation.getParam('title', 'Web')}</Text>
                </View>),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={() => {
                    Linking.openURL(navigation.getParam('URL', 'https://mfweb.top/'));
                }} underlayColor={UISetting.colors.lightColor} activeOpacity={0.5}>
                    <Icon name={'compass'} size={24} color={UISetting.colors.fontColor}/>
                </TouchableOpacity>
            )
        };
    };

    render() {
        let url = this.props.navigation.getParam('URL', 'https://mfweb.top/');
        return (
            <WebView
                style={{flex:1}}
                source={{uri: url}}
                onNavigationStateChange={(res) => { this.props.navigation.setParams( {'title': res.title }); }}
                startInLoadingState={true}
                onLoadStart={(res)=>{this.props.navigation.setParams({loading: true}); }}
                onLoadEnd={(res)=>{this.props.navigation.setParams({loading: false}); }}/>
        );
    }
}

export { PinkWebView }