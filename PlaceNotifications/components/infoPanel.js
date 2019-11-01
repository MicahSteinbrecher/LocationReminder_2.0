import React, {Component} from 'react';
import { Platform, StyleSheet, View, Text, FlatList, TouchableHighlight, TouchableOpacity} from 'react-native';
import InfoModal from './infoModal'
import { Rating } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ActionSheet from "react-native-actionsheet";
import AddPlaceButton from "./addPlaceButton";
import {cleanString} from "../utilities";

export default class InfoPanel extends React.Component {
    constructor(props){
        super(props);
    }

    componentDidMount() {
        console.log('info panel mounted...')
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.activePlace !== this.props.activePlace) {
            console.log('info panel updated');
        }
    }

    render() {
        if (this.props.isModalActive) {
            return (
                <View style={styles.modalContainer}>
                    <InfoModal
                        activePlace={this.props.activePlace}
                        onPressAddPlace={(place)=>this.props.onPressAddPlace(place)}
                    />
                </View>
            )
        }
        else if (this.props.activePlace) {
            return (
                <View style={styles.panelContainer}>

                    <TouchableOpacity
                        style={styles.panelContent}
                        onPress={()=>this.props.onPressPanel()}
                    >
                        <Text numberOfLines={1} style={{fontSize: 16, marginTop: 5, marginLeft: 5}}> {this.props.activePlace.name} </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{marginTop: 5, marginLeft: 5}}> {this.props.activePlace.rating} </Text>
                            <Rating
                                readonly
                                style={{marginTop: 5, marginLeft: 5}}
                                type='star'
                                fractions={1}
                                startingValue={this.props.activePlace.rating}
                                readonly
                                imageSize={15}
                            />
                        </View>
                        <Text style={{marginTop: 5, marginLeft: 5}}> {cleanString(this.props.activePlace.types[0])} </Text>
                    </TouchableOpacity>

                    <AddPlaceButton
                        doesExist={this.props.doesExist}
                        style={styles.panelButton}
                        id={this.props.activePlace.place_id}
                        handlePress={()=>this.props.onPressAddPlace(this.props.activePlace)}
                    />

                </View>
            );
        }
        else return (
            <View />
        );
    }
}

const styles = StyleSheet.create({
    panelContainer: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    modalContainer: {
        flex: 6,
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    panelContent: {
        flex: 5,
    },
    panelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 2,
    }
});
