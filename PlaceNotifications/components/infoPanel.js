import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    View,
    Text,
    FlatList,
    TouchableHighlight,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
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

            console.log('info panel active...')


            return (
                <View style={styles.panelContainer}>

                    {/*<TouchableOpacity*/}
                        {/*style={styles.panelContent}*/}
                        {/*onPress={()=>this.props.onPressPanel()}*/}
                    {/*>*/}
                    <View
                        style={{
                            // opacity: .7,
                            // backgroundColor: '#393e42',
                            color: 'white',
                            flex: 5,
                        }}
                    >
                        <Text numberOfLines={1} style={{color: 'white', fontSize: 24, marginTop: 5, marginLeft: 5}}> {this.props.activePlace.name} </Text>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={{fontSize: 20, color: 'white', marginTop: 5, marginLeft: 5}}> {this.props.activePlace.rating} </Text>
                            <Rating
                                readonly
                                tintColor={'#393e42'}
                                style={{marginTop: 5, marginLeft: 5}}
                                type='star'
                                fractions={1}
                                startingValue={this.props.activePlace.rating}
                                imageSize={15}
                            />
                        </View>
                        <Text style={{fontSize: 20, color: 'white', marginTop: 5, marginLeft: 5}}> {cleanString(this.props.activePlace.types[0])} </Text>
                    {/*</TouchableOpacity>*/}
                    </View>

                    <AddPlaceButton
                        doesExist={this.props.doesExist}
                        style={styles.panelButton}
                        id={this.props.activePlace.place_id}
                        handlePress={()=>this.props.onPressAddPlace()}
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
        color: 'white',
        //flex: 1,
        opacity: .7,
        backgroundColor: '#393e42',
        flexDirection: 'row',
        position: 'absolute',//use absolute position to show legend on top of the map
        top: '80%', //for vertical align
        alignSelf: 'flex-end', //for align to right
        width: Dimensions.get('window').width,
        height: .2*Dimensions.get('window').height,

    },
    modalContainer: {
        flex: 6,
        backgroundColor: '#fff',
        flexDirection: 'row'
    },
    panelContent: {
        opacity: .7,
        backgroundColor: '#393e42',
        flex: 5,
    },
    panelButton: {
        justifyContent: 'center',
        alignItems: 'center',
        flex: 2,
    }
});
