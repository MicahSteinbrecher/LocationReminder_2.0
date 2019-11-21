import React from "react";
import {Text, View} from "react-native";

export default function Hours(props) {
    if (!props.hours){
        return <View/>
    }
    return (
        <View
            style={{flexDirection: 'row'}}
        >
            <Text style={{fontSize: 20, color: (props.hours.isOpen) ? '#2ECC71' : '#ED5A40', marginTop: 10, marginLeft: 10}}>{props.hours.isOpenTxt}</Text>
            <Text style={{fontSize: 20, color: 'white', marginTop: 10, marginLeft: 10}}>{props.hours.statusChange}</Text>

        </View>
    )
}
//T090000
//PT06H00M
