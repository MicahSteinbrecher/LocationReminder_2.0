import React from "react";
import {Text, TouchableOpacity} from "react-native";
import {Icon} from "react-native-elements";

export default function RouteButton(props) {

    return (
        <TouchableOpacity
            style={props.style}
            onPress={() => props.handlePress()}
        >
            <Icon
                name='directions-car'
                color={'blue'}
                size={26}
            />
            <Text style={{marginTop: 5, color: 'blue'}}>ROUTE</Text>

        </TouchableOpacity>

    )

}
