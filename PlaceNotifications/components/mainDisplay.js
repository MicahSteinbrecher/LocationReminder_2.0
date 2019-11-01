import React, {Component} from 'react';
import {compareLocations} from "../utilities";
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import { Icon } from 'react-native-elements'


export default class MainDisplay extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isMapReady: false,
            predictionsDistance: null
        }
    }
    componentDidUpdate(prevProps){

        if (JSON.stringify(this.props.location) !== JSON.stringify({latitude:50,longitude:50})) {

            if (!compareLocations(prevProps.location, this.props.location)) {

                console.log('preparing to change location...');
                try {
                    setTimeout(() => this.map.animateToRegion(this.props.location), 10);
                } catch (e) {
                    console.log(e);
                }
            }
        }
    }

    handleMapReady(){
        this.setState({
            isMapReady: true,
        });
    }

    render() {
        if (this.props.searchInput && this.props.marker === null) {
            //PLACE RESULTS LIST
            return (
                <FlatList
                    data={this.props.predictions}
                    renderItem={({item, index}) =>
                        <TouchableOpacity
                            style={(index === 0) ? styles.firstItem : styles.item}
                            onPress={() => this.props.onPress(index)}
                        >
                            <View style={{flexDirection:'column', flex: 5}}>
                                <Text numberOfLines={1} style={{paddingLeft: 10, paddingBottom: 10, fontWeight: 'bold'}}>{item.structured_formatting.main_text}</Text>
                                <Text numberOfLines={1} style={{paddingLeft: 10, paddingRight: 10}}>{item.structured_formatting.secondary_text}</Text>
                            </View>
                            <View style={styles.info}>
                                {/*<Icon*/}
                                {/*containerStyle={{paddingRight: 20, paddingBottom: 10}}*/}
                                {/*size={25}*/}
                                {/*name='location-on' />*/}
                                <Text style={{marginLeft: 10}}> {item.distance} mi </Text>
                            </View>
                        </TouchableOpacity>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            );
        } else if (this.props.marker !== null) {
            return (
                <View style={{flex: 1}}>
                    <MapView
                        ref={ map => { this.map = map }}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        initialRegion={{
                            latitude: this.props.marker.coordinate.latitude,
                            longitude: this.props.marker.coordinate.longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        showsMyLocationButton={true}
                        onPress={() => this.props.toggleModal()}
                    >
                        <Marker coordinate={this.props.marker.coordinate}/>
                    </MapView>
                </View>
            );
        } else return (
            <MapView
                ref={ map => { this.map = map }}
                provider={PROVIDER_GOOGLE}
                style={{flex: 1}}
                initialRegion={{
                    latitude: this.props.location.latitude,
                    longitude: this.props.location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                followsUserLocation={true}
                showsMyLocationButton={true}
                // onUserLocationChange={(event) => (
                //     this.props.handleLocationChange(event.nativeEvent.coordinate)
                // )}
                onMapReady={() => this.handleMapReady()}

            />
        );
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    firstItem: {

        padding: 10,
        height: 70,
        borderWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
    item: {
        padding: 10,
        height: 70,
        borderBottomWidth: 1,
        borderColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
    },
    info: {
        flex: 1,
        borderLeftWidth: 1,
        flexDirection: 'column',
    }
});
