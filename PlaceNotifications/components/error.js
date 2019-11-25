import React from "react";
import { compareLocations }  from '../utilities';
import {Text, TouchableOpacity, View} from 'react-native';
import {Icon, Button} from 'react-native-elements';

export default function RedoSearch(props) {
    if (!props.isNaN) {
        return (
            <View/>
        )
    }
    return (
        <Text
            style={{
                fontSize: 16,
                paddingLeft: 10,
                paddingBottom: 10,
                color: '#E74C3C'
            }}
        >
        Search radius must be a number
        </Text>
    )
}


















