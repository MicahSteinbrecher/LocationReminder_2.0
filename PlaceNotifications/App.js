
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, FlatList, TouchableHighligh, TouchableOpacity} from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { SearchBar, ListItem, List } from 'react-native-elements'
import Home from './components/home'
import Places from './components/placesSettings'
import Settings from './components/settings'
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';



//Load Map to user location. DONE
//fetch nearby places. DONE
//populate list with nearby places DONE

//YourPlaces screen DONE
//store places in local memory DONE
//add place to your places DONE
//populate places screen with places list DONE

//make search predictions more relevent
//doesnt return streets DONE

//enable removing places from users places DONE
//add check circles and remove button DONE
//change edit button to done in edit mode DONE
//prevent remove button from toggling and add done button DONE

//resolve warnings DONE
//BUG ? places screen doesn't update after adding a place  unless  you touch the screen DONE
//clear search predictions after adding a place DONE
//reset header when navigating away DONE
//BUG only deleting one place at a time ? DONE
//don't display edit option on when there are no places DONE
//prevent screen from flipping DONE
//notify you when you're near on of your places DONE
//don't add a place that already exists in users places DONE

//WHY isn't info panel appearing ?? DONE
//create markers for your places ?
//select item from list opens view with info on place
//can add place to users places for info panel DONE
//select panel open model with more info
//make alignment consistent for all screen states
//reset screens when navigating
//offer to route you to one of your places when close
//alert near place when app is running in background

//enable geolocation in background
//add button changes to saved afater place added.
//pressing saved button removes place

//turn off debugging notifications
//don't let app rotate- portrait only
//add app icon



const TabNavigator = createBottomTabNavigator(
    {
        Home:  Home ,
        Places: Places,
        Settings: Settings,
    },
    {
        tabBarOptions: {
            labelStyle: {
                fontSize: 16,
            },
            style: {
                backgroundColor: '#393e42'
            }
        }
    }
);

export default createAppContainer(TabNavigator);
