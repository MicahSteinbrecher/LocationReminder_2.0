/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {AppState, Platform, StyleSheet, Text, View, FlatList, TouchableHighligh, TouchableOpacity} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SearchBar, ListItem, List } from 'react-native-elements'
import Realm from 'realm';
import {NavigationEvents} from "react-navigation";
import {PlaceSchema} from "../schemas";
import {addPlace, removePlace, getNearbyPlaces, getPlaceInfo, getPlaces, compareLocations, doesExist, getDistance} from "../utilities";
import InfoPanel from './infoPanel';
import MainDisplay from './mainDisplay';
import InfoModal from './infoModal';
import PushController from "../PushController";
import PushNotification from 'react-native-push-notification';
import BackgroundGeolocation from "react-native-background-geolocation";


function Search(props) {
    return (
        <SearchBar
            containerStyle={{flex: 1, paddingTop: '13%'}}
            round
            onChangeText={(text)=> props.onChangeText(text)}
            // onClearText={someMethod}
            value={props.searchInput}
            placeholder='Type Here...' />
    );
}

export default class App extends Component<Props> {
    constructor(props) {
        super(props);

            this.state = {
            searchInput: '',
            places: [],
            marker: null,
            activePlace: null,
            location: {
                latitude: 50,
                longitude: 50,
            },
            nearbyPlaces: [],
            userLocation: {
                latitude: 50,
                longitude: 50,
            },
            isModalActive: false,
            isMapReady: false,
            doesExist: null,
        };
    }

    /**
     * CONFIGURES PUSH NOTIFICATIONS
     */
    onRegister(token) {
        Alert.alert("Registered !", JSON.stringify(token));
        console.log(token);
        this.setState({ registerToken: token.token, gcmRegistered: true });
    }

    onNotif(notif) {
        console.log(notif);
        Alert.alert(notif.title, notif.message);
    }

    handlePerm(perms) {
        Alert.alert("Permissions", JSON.stringify(perms));
    }
    /**
     * END
     */

    /**
     * BACKGROUND LOCATION TRACKING
     */
    componentWillMount() {
        ////
        // 1.  Wire up event-listeners
        //

        // This handler fires whenever bgGeo receives a location update.
        BackgroundGeolocation.onLocation((location)=>this.onLocation(location), this.onError);
        //BackgroundGeolocation.onLocation(this.onLocation, this.onError);

        // This handler fires when movement states changes (stationary->moving; moving->stationary)
        BackgroundGeolocation.onMotionChange(this.onMotionChange);

        // This event fires when a change in motion activity is detected
        BackgroundGeolocation.onActivityChange(this.onActivityChange);

        // This event fires when the user toggles location-services authorization
        BackgroundGeolocation.onProviderChange(this.onProviderChange);

        ////
        // 2.  Execute #ready method (required)
        //
        BackgroundGeolocation.ready({
            reset: true,  // <-- true to always apply the supplied config
            // Geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 10,
            // Activity Recognition
            stopTimeout: 1,
            // Application config
            debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
            // HTTP / SQLite config
            url: 'http://yourserver.com/locations',
            batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: true,         // <-- [Default: true] Set true to sync each location to server as it arrives.
            headers: {              // <-- Optional HTTP headers
                "X-FOO": "bar"
            },
            params: {               // <-- Optional HTTP params
                "auth_token": "maybe_your_server_authenticates_via_token_YES?"
            }
        }, (state) => {
            console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);

            if (!state.enabled) {
                ////
                // 3. Start tracking!
                //
                BackgroundGeolocation.start(function() {
                    console.log("- Start success");
                });
            }
        });
    }

    // You must remove listeners when your component unmounts
    componentWillUnmount() {
        BackgroundGeolocation.removeListeners();
    }

    onLocation(location) {
        console.log('on location fired, push notification expected');
        // PushNotification.localNotification({
        //     /* iOS and Android properties */
        //     title: "Location Update", // (optional)
        //     message: JSON.stringify(location.coords), // (required)
        //     playSound: true, // (optional) default: true
        // });

        location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        }
        //alert("on location fire: " + JSON.stringify(location));
        //console.log('user location: ' + JSON.stringify(this.state.userLocation));
            if (this.state.location.latitude === 50 && this.state.location.longitude === 50) {
                console.log("FOUND USER'S LOCATION: " + JSON.stringify(location));
                this.setState({
                    location: location,
                    userLocation: location
                });
            } else {
                this.setState({
                    userLocation: location,
                })
            }

        console.log('[location] -', location);
    }

    onError(error) {
        console.warn('[location] ERROR -', error);
    }
    onActivityChange(event) {
        console.log('[activitychange] -', event);  // eg: 'on_foot', 'still', 'in_vehicle'
    }
    onProviderChange(provider) {
        console.log('[providerchange] -', provider.enabled, provider.status);
    }
    onMotionChange(event) {
        console.log('[motionchange] -', event.isMoving, event.location);
    }

    /**
     * END
     */

    handleMapReady(){
        console.log('map is ready');
        this.setState({isMapReady: true});
    }

    handleMapDrag(location, isMapReady){
        this.setState({location: {
                latitude: location.latitude,
                longitude: location.longitude
            }
        });
    }

    toggleModal(isModalActive){
        this.setState({
            isModalActive: !isModalActive,
        });
    }

    //DON'T USE ANYMORE
    // handleLocationChange(location){
    //     location = {
    //         latitude: location.coords.latitude,
    //         longitude: location.coords.longitude
    //     };
    //     if (JSON.stringify(this.state.location) === JSON.stringify({latitude: 50, longitude: 50})){
    //         this.setState({
    //             location: location,
    //             userLocation: location
    //         });
    //     } else {
    //         this.setState({
    //             userLocation: location,
    //         })
    //     }
    //
    // }

    async componentDidMount() {
        let places = await getPlaces();
        console.log(places);
        this.setState({
            places: places,
        });
    }

    async componentDidUpdate(prevProps, prevState) {
        // only update chart if the data has changed
        if (prevState.searchInput !== this.state.searchInput) {
            await this.fetchPlaces(this.state.searchInput, this.state.location);
        }
        /**
         * Checks if user's location has changed
         * if true, checks if saved locations are nearby
         */

        if (!compareLocations(prevState.userLocation, this.state.userLocation)) {
            console.log('user location was: ' + JSON.stringify(prevState.userLocation));
            console.log('user location changed to: ' + JSON.stringify(this.state.userLocation));


            if (this.state.places.length != 0) {
                let nearbyPlaces = await getNearbyPlaces(this.state.userLocation, this.state.places);
                if (nearbyPlaces) {
                    if (nearbyPlaces.result.length > prevState.nearbyPlaces.length){
                        if (AppState.currentState === 'active') {
                            alert('you are within 5 kilometers of: ' + nearbyPlaces.str);
                        }
                        PushNotification.localNotification({
                            /* iOS and Android properties */
                            title: "PLACE UPDATE", // (optional)
                            message: "you are within 5 kilometers of: " + nearbyPlaces.str,
                            playSound: true, // (optional) default: true
                        });
                        this.setState({
                            nearbyPlaces: nearbyPlaces.result,
                            location: this.state.userLocation,
                        })
                    }
                } else this.setState({
                    nearbyPlaces: []
                })
            }
        }

        if (this.state.searchInput == '' && this.state.searchInput !== prevState.searchInput) {
            this.setState({marker: null, activePlace: null, isModalActive: false, doesExist: null});
        }

        if (this.state.activePlace !== null){
            if (this.state.activePlace !== prevState.activePlace || this.state.places !== prevState.places) {
                if (await doesExist(this.state.activePlace.place_id)) {
                    this.setState({
                        doesExist: true
                    });
                } else {
                    this.setState({
                        doesExist: false
                    });
                }
            }
        }
    }

    async fetchPlaces(query,location) {
        return fetch('https://maps.googleapis.com/maps/api/place/autocomplete/json?key=AIzaSyA_Oc3xSUiALGBetQGkQ0wuzfrP05G7JCY&input='+query+'&location='+location.latitude+','+location.longitude+'&radius=1000&types=establishment')
            .then((response) => response.json())
            .then(async (responseJson) => {
                let predictions = await getDistance(responseJson.predictions, this.state.location);
                console.log(predictions);
                this.setState({predictions: predictions});
            })
            .catch((error) => {
                console.error(error);
            });
    }

    handleChangeText(searchInput) {
        this.setState({
            searchInput: searchInput,
        });
    }

    clearSearch() {
        this.setState({
            searchInput: '',
        })
    }

    async handlePressList(place) {
        place = await getPlaceInfo(place.id);

        this.props.navigation.navigate('Details');
        this.setState({
            activePlace: place,
            marker: {
                coordinate: {
                    latitude: place.geometry.location.lat,
                    longitude: place.geometry.location.lng
                }
            },
            searchInput: place.name,
        })
        //Add info panel
    }


    async handlePressAddPlace(place) {
        let places = [];
        if (this.state.doesExist) {
            places = await removePlace(place);
        } else {
            places = await addPlace(place);
        }
        this.setState({
            places: places
        });
        return places;
    }

    handleScreenFocus(){
        this.clearSearch();
    }

    render() {

        if (!this.state.isModalActive) {
            return (
                <View style={styles.container}>
                    <PushController />
                    <NavigationEvents
                        onWillFocus={payload => {
                            this.handleScreenFocus();
                        }}
                    />
                    <View style={{flex: 1}}>
                        <Search
                            searchInput={this.state.searchInput}
                            onChangeText={(searchInput) => this.handleChangeText(searchInput)}
                        />
                    </View>

                    <View style={{flex: 7}}>

                        <View style={{flex: 7}}>
                            <MainDisplay
                                searchInput={this.state.searchInput}
                                location={this.state.location}
                                predictions={this.state.predictions}
                                marker={this.state.marker}
                                toggleModal={() => this.toggleModal(true)}
                                onPress={(i) => this.handlePressList({
                                        id: this.state.predictions[i].place_id
                                    }
                                )}
                                handleLocationChange={(location) => this.handleLocationChange(location)}
                                handleMapDrag={(location, isMapReady) => this.handleMapDrag(location, isMapReady)}
                                //handleMapReady={()=>this.handleMapReady()}
                            />
                        </View>

                        <InfoPanel
                            doesExist={this.state.doesExist}
                            activePlace={this.state.activePlace}
                            isModalActive={this.state.isModalActive}
                            onPressPanel={() => this.toggleModal(this.state.isModalActive)}
                            onPressAddPlace={() => this.handlePressAddPlace({
                                    id: this.state.activePlace.place_id,
                                    name: this.state.activePlace.name,
                                    address: this.state.activePlace.formatted_address,
                                    latitude: this.state.activePlace.geometry.location.lat,
                                    longitude: this.state.activePlace.geometry.location.lng,
                                }
                            )}
                        />
                    </View>

                </View>

            );
        } else return (
            <View style={styles.container}>
                <PushController />
                <NavigationEvents
                    onWillFocus={payload => {
                        this.handleScreenFocus();
                    }}
                />
                <InfoModal
                    doesExist={this.state.doesExist}
                    onPressHome={() => this.toggleModal(this.state.isModalActive)}
                    activePlace={this.state.activePlace}
                    onPressAddPlace={() => this.handlePressAddPlace({
                        id: this.state.activePlace.place_id,
                        name: this.state.activePlace.name,
                        address: this.state.activePlace.formatted_address,
                        latitude: this.state.activePlace.geometry.location.lat,
                        longitude: this.state.activePlace.geometry.location.lng,
                    })}
                />
            </View>

        );

    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },

    firstItem: {
        padding: 10,
        height: 44,
        borderWidth: 1,
        borderColor: 'black',
    },
    item: {
        padding: 10,
        height: 44,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
});
