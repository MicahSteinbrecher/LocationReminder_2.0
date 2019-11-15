import React, {Component} from 'react';
import Realm from "realm";
import {PlaceSchema, EstablishmentSchema} from "./schemas";
import geolib from 'geolib'

export function getPlaces() {
    return Realm.open({schema: [PlaceSchema]})
        .then(realm => {
            return (realm.objects('Place').slice());
        })
        .catch(error => {
            console.log(error);
            return error;
        });
}

export function compareLocations(loc1, loc2){

    loc1 = {
        latitude: +loc1.latitude.toFixed(3),
        longitude: +loc1.longitude.toFixed(3)
    };

    loc2 = {
        latitude: +loc2.latitude.toFixed(3),
        longitude: +loc2.longitude.toFixed(3)
    };

    //console.log('prev loc: ' + JSON.stringify(loc1) + 'current loc: ' + JSON.stringify(loc2));

    return (JSON.stringify(loc1) === JSON.stringify(loc2))
}


/*
 * Queries foursquare venues based on section.
 * Helpeer function for GetSuggestions
 */
async function getPlacesByType(type, location) {
    //'https://api.foursquare.com/v2/venues/explore?client_id=MB0WW2OJNKZ3KAMVMGDRAC1KWOIPPIJQMYT0PSZUAMAGDRRV&client_secret=TH5GX4CM5TI2BQV020Q0IH0EK1D2SEEVEZW2BHQNUT1G0X5T&v=20180323&limit=1&ll='+ location.latitude + ',' + location.longitude
    //	'https://places.api.here.com/places/v1/discover/explore?app_id=x8vu33tuh4Lb0amRPB27&app_code=6IGSuBHopMd1cxLfA5Qqs&in='+ location.latitude + ',' + location.longitude + ';r=5000'
    return fetch('https://places.api.here.com/places/v1/discover/explore?app_id=x8vu33tuh4Lb0amRPB27&app_code=6IGSuBHopMd1cxLfA5Qqsg&in='+ location.latitude + ',' + location.longitude + ';r=5000&cat='+type)
        .then((response) => response.json())
        .then((responseJson) => {
            return responseJson.results.items;
        })
        .catch((error) => {
            console.error(error);
        });

}

export async function getSuggestions(establishments, location) {

    let suggestions = [];
    let categories = [];

    //gets venues based on users prefered categories
    for (let i = 0; i < establishments.length; i++) {
        console.log('establishment  ' + i + ' ' + JSON.stringify(establishments[i]));
        if (establishments[i].isPreferred) {
            categories.push(establishments[i].type);
        }
    }

    console.log('utilities ln 71: ' + JSON.stringify(categories));
    if (categories.length !== 0) {
        let response = await getPlacesByType(categories.toString(), location);
        console.log('utilities ln 72 get places response: ' + JSON.stringify(response, null, 2));
        for (let i = 0; i < response.length; i++) {
                suggestions.push({
                    name: response[i].title,
                    latlng: {
                        latitude: response[i].position[0],
                        longitude: response[i].position[1]
                    },
                    category: response[i].category.id,
                    isSelected: false,
            })
        }
    }
    console.log('suggestion results ' + JSON.stringify(suggestions,null,2));

    return suggestions;
}


//if using HERE API then use this function
//(HERE can only get one category at a time)
// export async function getSuggestions(establishments, location) {
//
//     let toFilter = [];
//
//     //gets venues based on users prefered categories
//     for (let i = 0; i < establishments.length; i++) {
//         console.log('establishment  ' + i + ' ' + JSON.stringify(establishments[i]));
//         if (establishments[i].isPreferred) {
//             let type = establishments[i].type;
//
//             let suggestions = await getPlacesByType(type, location);
//             console.log('SUGGESTION ' + i + ' ' + JSON.stringify(suggestions, null, 2));
//
//             if (suggestions.length !== 0) {
//                 Array.prototype.push.apply(toFilter, suggestions);
//             }
//         }
//     }
//     console.log('suggestion results ' + JSON.stringify(toFilter));
//
//
//     let results = [];
//     //removes duplicates from results list
//     for (let i = 0; i < toFilter.length; i++) {
//         console.log('name: ' + toFilter[i].id + ' at index ' + i);
//         let isDuplicate = false;
//         for (let j = i+1; j < toFilter.length; j++) {
//             console.log('i: ' + i + ', j: ' + j);
//             console.log('name: ' + toFilter[j].id)
//             if (toFilter[i].id === toFilter[j].id) {
//                 isDuplicate = true;
//                 break;
//             }
//         }
//         if (!isDuplicate) {
//             results.push(toFilter[i]);
//         }
//     }
//     return results;
// }

//check if user is near any of their places
//can optionally specify distance parameter
export async function getNearbyPlaces(location, places, distance) {
    let result = [];

    if (places.length == 0 || places === undefined) {
        return;
    }
    try {

        for (var i = 0; i < places.length; i++) {
            if (isNearby(location, places[i])) {
                result.push(places[i].name);
            }
        }
        if (result.length === 0){
            return;
        }
        console.log(JSON.stringify(result));

        if (result.length === 1) {
            return {
                result: result,
                str: result[0]
            }
        }

        console.log('found neaerby places: ' + result.join(', '));

        let str = result.slice(0,result.length-1);
        return {
            result: result,
            str: str.join(', ') + " and " + result[result.length-1]
        }

        // if (result.length === 0){
        //     console.log('***************************');
        //     console.log('found 1 nearby place');
        //     console.log('***************************');
        //     return places[0].name;
        // }
        // else {
        //     console.log('***************************');
        //     console.log('found many nearby places');
        //     console.log('***************************');
        //     return result.join(', ') + " and " + places[i].name;
        // }
    } catch(e){
        console.log(e)
        return e;
    }
}

//distance is optional
function isNearby(location, place, distanceLimit) {
    //units in meters
    let accuracy = 100;
    place = {longitude: place.longitude, latitude: place.latitude}
    return geolib.getDistance(location, place, accuracy) < 5000;
}

export function doesExist(id){
    return Realm.open({schema: [PlaceSchema, EstablishmentSchema]}, id)
        .then(realm => {
            //check if place already exists
            let places = realm.objects('Place').slice();
            for (var i = 0; i < places.length; i++){
                if (places[i].id === id){
                    return true;
                }
            }
            return false;
        });
}

//don't add if place already exists
//updates places and returns new list
export function addPlace(place) {
    return Realm.open({schema: [PlaceSchema, EstablishmentSchema]}, place)
        .then(realm => {
            //check if place already exists
            let places = realm.objects('Place').slice();
            for (var i = 0; i < places.length; i++){
                if (places[i].id == place.id){
                    alert('this venue is already in your places foolish mortal');
                    return places;
                }
            }

            // Create Realm objects and write to local storage
            console.log('creating new place...');

            realm.write(() => {
                realm.create('Place', {
                    name: place.name,
                    address: place.address,
                    id: place.id,
                    latitude: place.latitude,
                    longitude: place.longitude,
                });
               // alert('place added');
            });
            return realm.objects('Place').slice();
        })
        .catch(error => {
            console.log('failed while adding new place');
            console.log(error);
            return error;
        });
}

export function getPlaceInfo(id){

    return fetch('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyA_Oc3xSUiALGBetQGkQ0wuzfrP05G7JCY&placeid='+id)
        .then((response) => response.json())
        .then((responseJson) => {
            console.log(responseJson);
            return responseJson.result;
        })
        .catch((error) => {
            console.error(error);
        });
}

function getPlaceLocation(id){

    return fetch('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyA_Oc3xSUiALGBetQGkQ0wuzfrP05G7JCY&placeid='+id)
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson);
                return {latitude: responseJson.result.geometry.location.lat,
                        longitude: responseJson.result.geometry.location.lng}
            })
            .catch((error) => {
                console.error(error);
            });
}

export function removePlace(place) {
    console.log('removing place...')
    return Realm.open({schema: [PlaceSchema, EstablishmentSchema]}, place)
        .then(realm => {
            realm.write(() => {
                let places = realm.objects('Place').slice();

                for (let i = 0; i < places.length; i++){
                    if (places[i].id === place.id){
                            realm.delete(places[i]);

                    }
                }
            });
            return realm.objects('Place').slice();
        })
        .catch(error => {
            console.log(error);
            return error;
        });

}

export async function getDistance(places, location){
    for (var i = 0; i < places.length; i++) {
        let placeLocation = await getPlaceLocation(places[i].place_id);
        let distance =  await geolib.getDistance(
            location,
            placeLocation
        )
        places[i].distance = metersToMiles(distance);
    }
    return places;
}

export function cleanString(str){
    return str.replace(/_/g,' ');
}

function metersToMiles(m){
    return (m*0.000621371).toFixed(2);
}
