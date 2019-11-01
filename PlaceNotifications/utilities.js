import React, {Component} from 'react';
import Realm from "realm";
import {PlaceSchema} from "./schemas";
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
    return Realm.open({schema: [PlaceSchema]}, id)
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
    return Realm.open({schema: [PlaceSchema]}, place)
        .then(realm => {
            //check if place already exists
            let places = realm.objects('Place').slice();
            for (var i = 0; i < places.length; i++){
                if (places[i].id == place.id){
                    alert('this place is already in your places you foolish mortal');
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
    return Realm.open({schema: [PlaceSchema]}, place)
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