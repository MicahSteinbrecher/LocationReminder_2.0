/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

//get user location when user starts up app

import React, {Component} from 'react';
import {AppState, Platform, StyleSheet, Text, View, FlatList, TouchableHighligh, TouchableOpacity} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { SearchBar, ListItem, List, Button } from 'react-native-elements'
import Realm from 'realm';
import {NavigationEvents} from "react-navigation";
import {PlaceSchema, EstablishmentSchema, RadiusSchema} from '../schemas';
import {
    addPlace,
    removePlace,
    getNearbyPlaces,
    getPlaceInfo,
    getPlaces,
    compareLocations,
    doesExist,
    getDistance,
    getSuggestions,
} from '../utilities';
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
                    latitude: 32.90,
                    longitude: -96.77,
                },
                nearbyPlaces: [],
                suggestions: [],
                userLocation: {
                    latitude: 32.90,
                    longitude: -96.77,
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
    async componentWillMount() {

        /**
         * check if establishments have been configured for recommending
         * 1) check if establishments exist
         * 2) if no: instantiate establishments as false
         * 3) else: get existing ones
         * 4) set component state
         */
        Realm.open({schema: [PlaceSchema, EstablishmentSchema, RadiusSchema]})
            .then(realm => {
                let establishments = realm.objects('Establishment').slice();
                let radius = realm.objects('Radius').slice();
                if (radius.length!==0){
                    radius = radius[0].radius
                } else
                    radius  = 5
                if (establishments.length != 0) {
                    this.setState({
                        establishments: establishments,
                        radius: radius
                    });
                }

            })
            .catch(error => {
                console.log(error);
                return error;
            });
        /**
         * end
         */

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
            if (this.state.location.latitude === 32.90 && this.state.location.longitude === -96.77) {
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

    // handleMapDrag(location, isMapReady){
    //     this.setState({location: {
    //             latitude: location.latitude,
    //             longitude: location.longitude
    //         }
    //     });
    // }

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

    async updateSuggestions(location) {

        let suggestions = await getSuggestions(this.state.establishments, location, this.state.radius, this.state.userLocation);
        console.log('home ln 283' + JSON.stringify(suggestions, null, 2))

        if (suggestions){
            this.setState({
                suggestions: suggestions,
                activePlace: null
            })
        }
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

            //TODO get places based off users preferences
            let suggestions = await getSuggestions(this.state.establishments, this.state.userLocation, this.state.radius, this.state.userLocation);
            if (suggestions){
                this.setState({
                    suggestions: suggestions
                })
            }


            //gets users nearby saved places
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
                if (await doesExist(this.state.activePlace)) {
                    this.setState({
                        doesExist: true
                    });
                } else {
                    this.setState({
                        doesExist: false
                    });
                }
            }
            console.log('set doesExist to: ' + this.state.doesExist);
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

    selectVenue(id) {
        let suggestions = this.state.suggestions.slice();
        let index = -1;
        for (var i = 0; i < suggestions.length; i++) {
            suggestions[i].isSelected = false;
            if (suggestions[i].id === id){
                suggestions[i].isSelected = true;
                index=i;
            }
        }
        console.log('SUGGESTIONS (HOME LN 369): ' + JSON.stringify(suggestions, null, 2));

        this.setState({
            suggestions: suggestions,
            activePlace: {
                type: 'preference',
                place: suggestions[index]
            },
        })
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
            activePlace: {
                place: place,
                type: 'search',
            },
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

        /*
         * update suggestions incase user changed preferences while on settings screen
         * TODO: possible bug user will be realereteed to places that were already in their preferences
         * TODO: see if user deleted any places
         *
         */

        Realm.open({schema: [PlaceSchema, EstablishmentSchema, RadiusSchema]})
            .then(async realm => {

                let establishments = JSON.parse(JSON.stringify(realm.objects('Establishment')));
                establishments = Object.values(establishments);

                let radius = realm.objects('Radius').slice();
                if (radius.length!==0){
                    radius = radius[0].radius
                } else {
                    radius = 5
                }

                let suggestions = await getSuggestions(establishments, this.state.location, radius, this.state.userLocation);
                //let places = await getPlaces();
                //places = Object.values(places);
                //let nearbyPlaces = await getNearbyPlaces(this.state.userLocation, places);


                console.log('new establishments ' + JSON.stringify(establishments));
                console.log('new suggestions: ' + JSON.stringify(suggestions));
                //console.log('new places: ' + JSON.stringify(places));
                //console.log('new nearby places ' + JSON.stringify(nearbyPlaces));



                this.setState({
                    suggestions: suggestions,
                    establishments: establishments,
                    activePlace: null,
                    //places: places,
                    //nearbyPlaces: (nearbyPlaces === undefined) ? [] : nearbyPlaces.result,
                    radius: radius,
                });
            })
            .catch(error => {
                console.log(error);
            });
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
                                updateSuggestions={(location)=>this.updateSuggestions(location)}
                                suggestions={this.state.suggestions}
                                searchInput={this.state.searchInput}
                                location={this.state.location}
                                predictions={this.state.predictions}
                                marker={this.state.marker}
                                toggleModal={() => this.toggleModal(true)}
                                onPress={(i) => this.handlePressList({
                                        id: this.state.predictions[i].place_id
                                    }
                                )}
                                // handleLocationChange={(location) => this.handleLocationChange(location)}
                                //handleMapDrag={(location, isMapReady) => this.handleMapDrag(location, isMapReady)}
                                //handleMapReady={()=>this.handleMapReady()}
                                selectVenue={(id) => this.selectVenue(id)}
                                doesExist={this.state.doesExist}
                                activePlace={this.state.activePlace}
                                isModalActive={this.state.isModalActive}
                                onPressPanel={() => this.toggleModal(this.state.isModalActive)}
                                onPressAddPlace={() => this.handlePressAddPlace({
                                        id: (this.state.activePlace.type==='preference') ? this.state.activePlace.place.id : this.state.activePlace.place.place_id,
                                        name: this.state.activePlace.place.name,
                                        address: (this.state.activePlace.type==='preference') ? this.state.activePlace.place.address : this.state.activePlace.place.formatted_address,
                                        latitude:  (this.state.activePlace.type==='preference') ? this.state.activePlace.place.latlng.latitude : this.state.activePlace.place.geometry.location.lat,
                                        longitude: (this.state.activePlace.type==='preference') ? this.state.activePlace.place.latlng.longitude : this.state.activePlace.place.geometry.location.lng,
                                    }
                                )}
                            />
                        </View>

                        {/*<InfoPanel*/}
                            {/*doesExist={this.state.doesExist}*/}
                            {/*activePlace={this.state.activePlace}*/}
                            {/*isModalActive={this.state.isModalActive}*/}
                            {/*onPressPanel={() => this.toggleModal(this.state.isModalActive)}*/}
                            {/*onPressAddPlace={() => this.handlePressAddPlace({*/}
                                    {/*id: this.state.activePlace.place_id,*/}
                                    {/*name: this.state.activePlace.name,*/}
                                    {/*address: this.state.activePlace.formatted_address,*/}
                                    {/*latitude: this.state.activePlace.geometry.location.lat,*/}
                                    {/*longitude: this.state.activePlace.geometry.location.lng,*/}
                                {/*}*/}
                            {/*)}*/}
                        {/*/>*/}
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
