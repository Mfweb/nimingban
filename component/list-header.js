import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { getHTMLDom } from '../modules/html-decoder'
import { converDateTime } from '../modules/date-time'
import { UISetting } from '../modules/config'

const styles = StyleSheet.create({
    mainListItemUserCookieNameBigVIP: {
        fontSize: 18,
        color: 'red'
    },
    mainListItemUserCookieName: {
        fontSize: 18,
    },
    mainListItemUserCookieNamePO: {
        borderWidth: 1,
        borderRadius: 2,
    },
    mainListItemHeader: {

    },
    mainListItemHeaderL1: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    mainListItemTid: {
        fontSize: 18
    },
    mainListItemTime: {
        fontSize: 18
    },
    mainListItemHeaderL2: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    mainListItemHeaderL2L: {
        marginLeft: 5,
    },
    mainListItemHeaderL2R: {
        marginRight: 5,
    },
    displayNone: {
        display: 'none'
    },
    mainListItemTitle: {
        fontSize: 16
    },
    mainListItemName: {
        fontSize: 16
    },
    mainListItemSAGE: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 22
    },
    mainListItemForumName: {
        color: 'red',
        fontSize: 20
    },
});

/**
 * props:
 * itemDetail
 * po
 */
class MainListItemHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            displayData: {}
        }
    }

    componentDidMount () {
    }
    componentWillReceiveProps(newProps) {
        this._updateData(newProps.itemDetail);
    }
    _updateData = (itemDetail) => {
        let displayData = {};
        displayData['userIDStyle'] = [];
        if(itemDetail.admin == 1) {
            displayData['userIDStyle'].push(styles.mainListItemUserCookieNameBigVIP);
        }
        else {
            displayData['userIDStyle'].push(styles.mainListItemUserCookieName);
            displayData['userIDStyle'].push({color: UISetting.colors.globalColor});
        }
        if(itemDetail.userid == this.props.po){
            displayData['userIDStyle'].push(styles.mainListItemUserCookieNamePO);
            displayData['userIDStyle'].push({borderColor: UISetting.colors.globalColor});
            displayData['userIDStyle'].push({backgroundColor: UISetting.colors.lightColor});
        }
        displayData['fName'] = itemDetail.fname;
        displayData['userID'] = getHTMLDom(itemDetail.userid);
        displayData['displayTime'] = converDateTime(itemDetail.now);
        this.setState({
            displayData: displayData
        });
    }
    render() {
        let { itemDetail } = this.props;
        let { displayData } = this.state;
        return (
            <View style={{padding: 8}}>
                <View style={styles.mainListItemHeader}>
                    <View style={styles.mainListItemHeaderL1}>
                        <Text style={displayData['userIDStyle']}>
                            {displayData['userID']}
                        </Text>

                        <Text style={[styles.mainListItemTid, {color: UISetting.colors.globalColor}]}>
                            No.{itemDetail.id}
                        </Text>

                        <Text style={[styles.mainListItemTime, {color: UISetting.colors.globalColor}]}>
                            {displayData['displayTime']}
                        </Text>
                    </View>
                </View>
                <View style={styles.mainListItemHeaderL2}>
                    <View style={styles.mainListItemHeaderL2L}>
                        <Text style={itemDetail.title == '无标题' ? styles.displayNone : [styles.mainListItemTitle, {color: UISetting.colors.lightFontColor}]}>{itemDetail.title}</Text>
                        <Text style={itemDetail.name == '无名氏' ? styles.displayNone : [styles.mainListItemName, {color: UISetting.colors.lightFontColor}]}>{itemDetail.name}</Text>
                    </View>

                    <View style={styles.mainListItemHeaderL2R}>
                        <Text style={displayData['fName'] ?styles.mainListItemForumName: styles.displayNone }>{displayData['fName']}</Text>
                        <Text style={itemDetail.sage === '1' ? styles.mainListItemSAGE : styles.displayNone}>SAGE</Text>
                    </View>
                </View>
            </View>
        );
    }
}

export { MainListItemHeader }