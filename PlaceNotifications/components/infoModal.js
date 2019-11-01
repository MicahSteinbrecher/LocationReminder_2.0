import React, {Component} from 'react';
import {ScrollView, Button, Platform, StyleSheet, View, Text, FlatList, TouchableHighlight, TouchableOpacity} from 'react-native';
import OpeningHours from './openingHours'
import {Header, Rating} from "react-native-elements";
import Pictures from "./pictures";
import ActionSheet from 'react-native-actionsheet'
import AddPlaceButton from "./addPlaceButton";
import {cleanString} from "../utilities";


export default class InfoModal extends React.Component {
    constructor(props) {
        super(props);
    }

    showActionSheet() {
        console.log('show action sheet fired');
        this.ActionSheet.show();
    }

    render() {
        return(
            <View style={styles.container}>
                <Header
                    backgroundColor={'#393e42'}
                    leftComponent={{ icon: 'arrow-back', color: '#fff', onPress: ()=>this.props.onPressHome() }}
                    // rightComponent={{ icon: 'more-vert', color: '#fff', onPress: ()=>this.showActionSheet() }}
                />
                <Pictures pictures={this.props.activePlace.photos}/>
                <ScrollView>
                    <View style={styles.panelContainer}>

                        <View
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
                            <Text style={{margin: 5}}> {cleanString(this.props.activePlace.types[0])} </Text>
                        </View>

                        <AddPlaceButton
                            doesExist={this.props.doesExist}
                            style={styles.panelButton}
                            id={this.props.activePlace.place_id}
                            handlePress={()=>this.props.onPressAddPlace(this.props.activePlace)}
                        />

                    </View>
                    <Text style={styles.hours}> Hours: </Text>
                    <OpeningHours activePlace={this.props.activePlace}/>
                    <Text style={styles.listItem}> Website: {this.props.activePlace.website}</Text>
                    <Text style={styles.listItem}> {this.props.activePlace.formatted_address}</Text>
                    <Text style={styles.listItem}> {this.props.activePlace.formatted_phone_number}</Text>
                    {/*<View style={styles.button}>*/}
                        {/*<Button  title={'Add Place'} onPress={()=>this.props.onPressAddPlace(this.props.activePlace)}/>*/}
                    {/*</View>*/}
                </ScrollView>
                <ActionSheet
                    ref={o => this.ActionSheet = o}
                    title={'Which one do you like ?'}
                    options={['Add Place', 'cancel']}
                    cancelButtonIndex={1}
                    //destructiveButtonIndex={1}
                    onPress={(index) => {
                        if (index == 0){
                            this.props.onPressAddPlace(this.props.activePlace)
                        }
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    hours: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    listItem: {
        paddingTop: 5,
    },
    button: {
        backgroundColor: 'black',
        width: '25%',
        left: 0,
    },
    panelContainer: {
        flex: 1,
        backgroundColor: '#fff',
        flexDirection: 'row',
        borderBottomWidth: 1,
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