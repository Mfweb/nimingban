import React, { Component } from 'react'
import { Text, Button, View, Image, StyleSheet, FlatList,SafeAreaView,StatusBar, TouchableHighlight } from 'react-native'
import { createAppContainer, createStackNavigator, StackActions, NavigationActions, createDrawerNavigator, DrawerActions } from 'react-navigation'
import { parseDOM } from 'htmlparser2'
import { getForumList } from './network'

const styles = StyleSheet.create({
  leftMenuIcon: {
    width: 32,
    height: 32
  },
  mainList: {
    flex: 1,
    backgroundColor: '#DCDCDC'
  },
  icon: {
    width: 24,
    height: 24,
  },
});

const htmlConstStyles = StyleSheet.create({
  defaultStyle: {
    fontSize: 20
  },
  a: {
    color: '#4169E1',
    textDecorationLine: 'underline'
  },
  strong: {
    fontWeight: 'bold'
  }
});


function getHTMLDom(htmlJSONIn, countKey = 0, tagName = null, tagAttribs = null) {
  let outPut = [];
  htmlJSONIn.forEach(htmlTag => {
    switch (htmlTag.type) {
      case 'text':
        switch (tagName) {
          case 'a':
            outPut.push(<Text style={htmlConstStyles.a} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
            break;
          case 'strong':
            outPut.push(<Text style={htmlConstStyles.strong} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
            break;
          case 'br':
            outPut.push(<Text key={htmlTag.data+countKey++}>\r\n</Text>);
            break;
          case 'font':
            //let style = createStyleSheetByAttribs(tagAttribs);
            outPut.push(<Text style={tagAttribs} key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
            break;
          default:
            outPut.push(<Text key={htmlTag.data+countKey++}>{htmlTag.data}</Text>);
            break;
        }
        break;
      case 'tag':
        outPut = outPut.concat(getHTMLDom(htmlTag.children, countKey, htmlTag.name, htmlTag.attribs))
        break;
      default:
        break;
    }
  });
  return outPut;
}

class MainListItem extends React.Component {
  render() {
    //转JSON
    let htmlJSON = parseDOM(this.props.itemDetail.content);
    console.log(htmlJSON);
    let outPut = getHTMLDom(htmlJSON);
    return (
      <Text style={htmlConstStyles.defaultStyle}>{outPut}</Text>
    );
  }
}

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
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
        loading: true
      });
      getForumList(4, page).then((res) => {
        if(res.status == 'ok') {
          this.setState({
            threadList: res.res,
            page: 1,
            loading: false
          });
        }
        else {
          alert('请求数据失败:' + res.errmsg);
        }
        this.setState( {loading: false} );
      });
    }
    this.props.navigation.setParams({ openLDrawer: this.props.navigation.openDrawer })
  }
  _renderItem = ({item}) => (
    <MainListItem itemDetail={item}/>
  );

  render() {
    return (
      <FlatList 
        data={this.state.threadList}
        extraData={this.state}
        style={styles.mainList} 
        onRefresh={this._pullDownRefresh} 
        refreshing={this.state.loading}
        keyExtractor={(item, index) => item.id}
        renderItem={this._renderItem}
        />
    );
  }

  _pullDownRefresh = async () => {
      this.setState({loading: true});
      console.log('pullDown');
      /*page = 1;
      let listText = await getForumList(4, page);
      console.log(listText);
      try{
        let listJSON = JSON.parse(listText);
        console.log(listJSON);
      }catch(error){
        alert('请求数据失败,' + error);
      }*/
      this.setState({loading: false});
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
        backgroundColor: '#ffafc9'
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
