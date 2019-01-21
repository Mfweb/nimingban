import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList,SafeAreaView,StatusBar, TouchableHighlight, Dimensions, Animated } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator } from 'react-navigation'
import { getForumList } from './modules/network'
import { getHTMLDom } from './modules/html-decoder'
import { ListProcessView } from './component/list-process-view'

const globalColor = '#f45a8d';

const styles = StyleSheet.create({
  mainList: {
    flex: 1,
    backgroundColor: '#DCDCDC'
  },
  mainListItem: {
    backgroundColor: '#FFF',
    marginTop: 10,
    padding: 8,
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowColor: '#696969',
  },
  mainListItemContent: {
    color: '#000',
    fontSize: 20
  },
  mainListItemHeader: {

  },
  mainListItemHeaderL1: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 8
  },
  mainListItemHeaderL2: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  mainListItemHeaderL2L: {
    marginLeft: 5,
  },
  mainListItemHeaderL2R: {
    marginRight: 5,
  },
  mainListItemUserCookieName: {
    fontSize: 18,
    color: globalColor
  },
  mainListItemUserCookieNameBigVIP: {
    fontSize: 18,
    color: 'red'
  },
  mainListItemTid: {
    fontSize: 18,
    color: globalColor
  },
  mainListItemTime: {
    fontSize: 18,
    color: globalColor
  },
  mainListItemTitle: {
    fontSize: 16,
    color: '#696969'
  },
  mainListItemName: {
    fontSize: 16,
    color: '#696969'
  },
  mainListItemSAGE: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 22
  },
  displayNone: {
    display: 'none'
  },
  mainListItemBottom: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 3,
    paddingRight: 5
  },
  mainListReplayCountIcon: {
    width: 24,
    height: 24,
    marginRight: 3
  },
  mainListReplayCountText: {
    color: '#696969',
    fontSize: 18
  },
  leftMenuIcon: {
    width: 32,
    height: 32
  },
  icon: {
    width: 24,
    height: 24,
  },
});


class MainListItem extends React.Component {
  render() {
    //console.log(this.props.itemDetail);
    let userID = getHTMLDom(this.props.itemDetail.userid);
    let threadContent = getHTMLDom(this.props.itemDetail.content);
    let replayCountText = this.props.itemDetail.remainReplys ? (this.props.itemDetail.remainReplys.toString() + "(" + this.props.itemDetail.replyCount + ")" ):this.props.itemDetail.replyCount;
    return (
      <View style={styles.mainListItem}>
        <View style={styles.mainListItemHeader}>
          <View style={styles.mainListItemHeaderL1}>
            <Text style={ this.props.itemDetail.admin == 1 ? styles.mainListItemUserCookieNameBigVIP : styles.mainListItemUserCookieName }>
              {userID}
            </Text>

            <Text style={styles.mainListItemTid}>
              No.{this.props.itemDetail.id}
            </Text>

            <Text style={styles.mainListItemTime}>
              {this.props.itemDetail.now}
            </Text>
          </View>
        </View>
        <View style={styles.mainListItemHeaderL2}>
          <View style={styles.mainListItemHeaderL2L}>
            <Text style={this.props.itemDetail.title=='无标题' ? styles.displayNone :styles.mainListItemTitle}>{this.props.itemDetail.title}</Text>
            <Text style={this.props.itemDetail.name=='无名氏' ? styles.displayNone :styles.mainListItemName}>{this.props.itemDetail.name}</Text>
          </View>

          <View style={styles.mainListItemHeaderL2R}>
            <Text style={this.props.itemDetail.sage=='0'? styles.displayNone:styles.mainListItemSAGE}>SAGE</Text>
          </View>

        </View>

        <Text style={styles.mainListItemContent}>
        {threadContent}
        </Text>

        <View style={styles.mainListItemBottom}>
          <Image style={styles.mainListReplayCountIcon} source={require('./imgs/replay-count.png')}></Image>
          <Text style={styles.mainListReplayCountText}>{replayCountText}</Text>
        </View>
      </View>
    );
  }
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerLoading: true,
      footerLoading: 0,
      threadList: Array(), 
      page: 1
    };
  }

  static navigationOptions = ({ navigation }) => {
    const { params= {} } = navigation.state;
    return {
      title: 'A岛-黎明版',
      headerLeft: (
        <TouchableHighlight style={{marginLeft:5}} onPress={params.openLDrawer} underlayColor={'#ffafc9'} activeOpacity={0.5} >
          <Image
            style={styles.leftMenuIcon}
            source={require('./imgs/menu.png')}
          />
        </TouchableHighlight>
      )
    }
  }

  componentDidMount () {
    if(this.state.threadList.length == 0) {
      page = 1;
      this.setState({
        headerLoading: true
      });
      getForumList(4, page).then((res) => {
        if(res.status == 'ok') {
          this.setState({
            threadList: res.res,
            page: 1,
            headerLoading: false
          });
        }
        else {
          alert('请求数据失败:' + res.errmsg);
        }
        this.setState( {headerLoading: false} );
      });
    }
    this.props.navigation.setParams({ openLDrawer: this.props.navigation.openDrawer })
  }

  _renderItem = ({item}) => (
    <MainListItem itemDetail={item}/>
  )
  
  _footerComponent = () => {
    let windowWidth = Dimensions.get('window').width;
    return (
      <ListProcessView mode={this.state.footerLoading} toMax={windowWidth} height={8} />
    );
  }

  render() {
    return (
      <FlatList 
        data={this.state.threadList}
        extraData={this.state}
        style={styles.mainList} 
        onRefresh={this._pullDownRefresh} 
        refreshing={this.state.headerLoading}
        keyExtractor={(item, index) => item.id}
        renderItem={this._renderItem}
        ListFooterComponent={this._footerComponent}
        onEndReachedThreshold={0.1}
        onEndReached={this._pullUpLoading}
        />
    );
  }

  _pullUpLoading = async() => {
    if(this.state.footerLoading != 0) {
      return;
    }
    this.setState({footerLoading: 1});
    page ++;
    getForumList(4, page).then((res) => {
      if(res.status == 'ok') {
        var tempList = this.state.threadList.slice()
        tempList = tempList.concat(res.res);
        this.setState({
          threadList: tempList,
          page: 1,
          footerLoading: 0
        });
      }
      else {
        this.setState( {footerLoading: 0} );
        alert('请求数据失败:' + res.errmsg);
      }
    });
  }

  _pullDownRefresh = async () => {
      this.setState({headerLoading: true});
      page = 1;
      getForumList(4, page).then((res) => {
        if(res.status == 'ok') {
          this.setState({
            threadList: res.res,
            page: 1,
            headerLoading: false
          });
        }
        else {
          alert('请求数据失败:' + res.errmsg);
        }
        this.setState( {headerLoading: false} );
      });
  }
}

class DetailsScreen extends React.Component {
  static navigationOptions = {
    title: '串详细'
  };
  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Details Screen</Text>
      </View>
    );
  }  
}

class MyNotificationsScreen extends React.Component {
  static navigationOptions = {
    drawerLabel: 'Notifications',
    drawerIcon: ({ tintColor }) => (
      <Image
        source={require('./imgs/menu.png')}
        style={[styles.icon, {tintColor: tintColor}]}
      />
    ),
  };

  render() {
    return (
      <Button
        onPress={() => this.props.navigation.goBack()}
        title="Go back home"
      />
    );
  }
}



const MainStackNavigator = createStackNavigator({
  //主页
  Home: {
    screen: HomeScreen,
  },
  //串内容
  Details: {
    screen: DetailsScreen,
    headerBackTitle: '返回'
  },
}, {
    initialRouteName: 'Home',
    //顶栏配置
    defaultNavigationOptions: {
      headerStyle: {
        backgroundColor: globalColor
      },
      headerTintColor: '#ffffff'
    }
});

const AppNavigator = createDrawerNavigator({
  Home: {
    screen: MainStackNavigator,
  },
  Notifications: {
    screen: MyNotificationsScreen,
  },
},{
  drawerPosition: 'left',
});

export default createAppContainer(AppNavigator);
