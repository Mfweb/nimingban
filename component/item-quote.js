import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { getImage } from '../modules/apis'
import { getHTMLDom } from '../modules/html-decoder'
import { MainListImage } from './list-image-view'
import { MainListItemHeader } from './list-header'

const styles = StyleSheet.create({
    quoteView: {
        color: '#789922'
    },

});

class ItemQuote extends React.Component {
    constructor(props) {
        super(props);
    }
   
    componentDidMount() {
    }
    
    componentWillReceiveProps(res) {

    }
    componentWillUnmount() {
    }

    render() {
        return (
            <View style={styles.quoteView}>
                <Text>{this.props.id}</Text>
            </View>
        );
    }
}

export { ItemQuote }