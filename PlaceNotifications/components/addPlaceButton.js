import React from "react";
import {Text, TouchableOpacity} from "react-native";
import {Icon} from "react-native-elements";

export default function AddPlaceButton(props) {



    return (
        <TouchableOpacity
            style={props.style}
            onPress={() => props.handlePress()}
        >
            <Icon
                name='add-circle-outline'
                color={ (props.doesExist) ? '#CCCC00' : 'blue'}
                size={26}
            />
            <Text style={{marginTop: 5, color: 'blue'}}> {(props.doesExist) ? 'SAVED' : 'SAVE'} </Text>

        </TouchableOpacity>

    )

}