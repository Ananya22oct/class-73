import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View ,Image} from 'react-native';
import {createAppContainer} from 'react-navigation'
import {createBottomTabNavigator} from 'react-navigation-tabs'
import TransactionScreen from './Screens/BookTransation';
import SearchScreen from './Screens/SearchScreen';

export default class App extends React.Component{
  render(){
    return(
      <AppContainer/>
    )
  }
}

const TabNavigator=createBottomTabNavigator({
   Transaction:{screen:TransactionScreen},
   Search:{screen:SearchScreen},
   },
   {
     defaultNavigationOptions:({navigation})=>({
       tabBarIcon:({})=>{
         const routeName= navigation.state.routeName
         if(routeName==="Transaction"){
           return(
             <Image style={{width:40,height:40}}
                    source={require('./assets/book.png')}
             ></Image>
           )
         }
         else if(routeName==="Search"){
           return(
             <Image style={{width:40,height:40}}
             source={require('./assets/searchingbook.png')}
             ></Image>
           )
         }
       }
     })
   }
   )
const AppContainer=createAppContainer(TabNavigator)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
