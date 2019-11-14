import React, {Component} from 'react';
import {compareLocations} from "../utilities";
import {FlatList, StyleSheet, Text, TouchableOpacity, View, Dimensions} from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE} from "react-native-maps";
import { Icon, Card,  ListItem } from 'react-native-elements'
import InfoPanel from './infoPanel';


export default class MainDisplay extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isMapReady: false,
            predictionsDistance: null,
            showLegend: false,
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
                        mapPadding={{
                            top: 0,
                            right: 0,
                            bottom: .18*Dimensions.get('window').height,
                            left: 0
                        }}                        ref={ map => { this.map = map }}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        initialRegion={{
                            latitude: this.props.marker.coordinate.latitude,
                            longitude: this.props.marker.coordinate.longitude,
                            latitudeDelta: 0.1844,
                            longitudeDelta: 0.0842
                        }}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        //showsMyLocationButton={true}
                        onPress={() => this.props.toggleModal()}
                    >
                        <Marker coordinate={this.props.marker.coordinate}/>
                    </MapView>
                    <InfoPanel
                        doesExist={this.props.doesExist}
                        activePlace={this.props.activePlace}
                        isModalActive={this.props.isModalActive}
                        onPressPanel={() => this.toggleModal(this.props.isModalActive)}
                        onPressAddPlace={() => this.props.onPressAddPlace()
                        }
                    />
                </View>
            );
        } else if (this.state.showLegend) {
            return (
                <View style={{flex: 1}}>

                    <MapView
                        ref={ map => { this.map = map }}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        initialRegion={{
                            latitude: this.props.location.latitude,
                            longitude: this.props.location.longitude,
                            latitudeDelta: 0.1844,
                            longitudeDelta: 0.0842,
                        }}

                        showsUserLocation={true}
                        followsUserLocation={true}
                        showsMyLocationButton={true}
                        // onUserLocationChange={(event) => (
                        //     this.props.handleLocationChange(event.nativeEvent.coordinate)
                        // )}
                        onMapReady={() => this.handleMapReady()}

                    >
                        {this.props.suggestions.map(suggestion => (
                            <Marker
                                coordinate={suggestion.latlng}
                                title={suggestion.name}
                                description={suggestion.category}
                                pinColor='#3F84E6'
                            />
                        ))}
                    </MapView>

                    {/* LEGEND */}
                    <View
                        style={{
                            opacity: .7,
                            backgroundColor: 'white',
                            position: 'absolute',//use absolute position to show legend on top of the map
                            top: '0%', //for vertical align
                            alignSelf: 'flex-end', //for align to right
                            width: Dimensions.get('window').width,
                            height: .1*Dimensions.get('window').height,
                        }}
                    >
                        <ListItem
                            containerStyle= {{
                                backgroundColor: '#393e42',
                            }}
                            roundAvatar
                            titleStyle={{ color: 'white' }}
                            title={'suggestions'}
                            leftIcon={{ name:'room',
                                type:'material',
                                color:'#3F84E6'
                            }}
                        />
                        <ListItem
                            containerStyle= {{
                                backgroundColor: '#393e42',
                            }}
                            roundAvatar
                            titleStyle={{ color: 'white' }}
                            title={'selected'}
                            leftIcon={{ name:'room',
                                type:'material',
                                color:'#D85040'
                            }}
                        />
                        {/* LEGEND END*/}



                    </View>

                    <View
                        style={{
                            position: 'absolute',//use absolute position to show button on top of the map
                            top: '70%', //for vertical align
                            alignSelf: 'flex-end' //for align to right
                        }}
                    >
                        <Icon
                            reverse
                            onPress={() => this.setState({
                                showLegend: !this.state.showLegend
                            })}
                            name="info"
                            type='antdesign'
                            //color='#517fa4'
                            color='#393e42'
                        />
                    </View>
                </View>

            );
        }

        else return (
                <View style={{flex: 1}}>

                    <MapView
                        ref={ map => { this.map = map }}
                        provider={PROVIDER_GOOGLE}
                        style={{flex: 1}}
                        initialRegion={{
                            latitude: this.props.location.latitude,
                            longitude: this.props.location.longitude,
                            latitudeDelta: 0.1844,
                            longitudeDelta: 0.0842,
                        }}

                        showsUserLocation={true}
                        followsUserLocation={true}
                        showsMyLocationButton={true}
                        // onUserLocationChange={(event) => (
                        //     this.props.handleLocationChange(event.nativeEvent.coordinate)
                        // )}
                        onMapReady={() => this.handleMapReady()}

                    >
                        {this.props.suggestions.map(suggestion => (
                            <Marker
                                coordinate={suggestion.latlng}
                                title={suggestion.name}
                                description={suggestion.category}
                                pinColor='#3F84E6'
                            />
                        ))}
                    </MapView>

                    <View
                        style={{
                            position: 'absolute',//use absolute position to show button on top of the map
                            top: '70%', //for vertical align
                            alignSelf: 'flex-end' //for align to right
                        }}
                    >
                        <Icon
                            reverse
                            onPress={() => this.setState({
                                showLegend: !this.state.showLegend
                            })}
                            name="info"
                            type='antdesign'
                            color='#393e42'
                        />
                    </View>
                </View>
            )
    }

}

const styles = StyleSheet.create({
    icon: {

    },
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
