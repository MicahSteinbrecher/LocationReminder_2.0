import React from "react";
import { compareLocations }  from '../utilities';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icon, Button} from 'react-native-elements';

export default function RedoSearch(props) {
    if (!props.newView) {
        return (
            <View/>
        )
    }
    return (
        <Button
            containerStyle={{
                type: 'outline',
                position: 'absolute',//use absolute position to show button on top of the map
                top: '3%', //for vertical align
                alignSelf: 'center' //for align to right
            }}
            title='Search This Area'
            onPress={()=>props.handleSearch()}
        />
    )
}


















