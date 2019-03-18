import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'
const globalColor = '#fa7296';
const styles = StyleSheet.create({
    quoteView: {
        borderLeftColor: globalColor,
        borderLeftWidth: 8,
        marginLeft: 8,
        width: 'auto',
        backgroundColor: 'rgba(250,114,150,0.3)'
    },
    quoteText: {
        color: '#789922',
        fontSize: 20
    }
});

class ItemQuote extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayText: ""
        }
    }
   
    componentDidMount() {
        this.setState({
            displayText: this.props.id.replace('<br />', '').replace(/&gt;/g, '>')
        });
    }
    
    componentWillReceiveProps(res) {

    }
    componentWillUnmount() {
    }

    render() {
        return (
            <View style={styles.quoteView}>
                <Text style={styles.quoteText}>{this.state.displayText}</Text>
            </View>
        );
    }
}

export { ItemQuote }