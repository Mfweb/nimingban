import React, { Component } from 'react'
import { TouchableOpacity, Linking, Text, StyleSheet, ActivityIndicator, View } from 'react-native'
import { WebView } from "react-native-webview"
import Icon from 'react-native-vector-icons/SimpleLineIcons'

const styles = StyleSheet.create({
    titleView: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    titleText: {
        fontSize: 18,
        color: '#FFF'
    }
});

class PinkWebView extends React.Component {
    static navigationOptions = ({navigation}) => {
        return {
            headerTitle: (
                <View style={styles.titleView}>
                    <ActivityIndicator
                        size='small'
                        hidesWhenStopped={true}
                        animating={navigation.getParam('loading', true)}
                        color={'#FFF'}/>
                    <Text style={styles.titleText}>{navigation.getParam('title', 'Web')}</Text>
                </View>),
            headerRight: (
                <TouchableOpacity style={{ marginRight: 8, marginTop: 2 }} onPress={() => {
                    Linking.openURL(navigation.getParam('URL', 'https://mfweb.top/'));
                }} underlayColor={'#ffafc9'} activeOpacity={0.5}>
                    <Icon name={'compass'} size={24} color={'#FFF'}/>
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