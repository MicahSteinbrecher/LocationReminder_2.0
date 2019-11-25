import React from 'react';

export const PlaceSchema = {
    name: 'Place',
    properties: {
        name:  'string',
        address: 'string',
        id: 'string',
        latitude: 'float',
        longitude: 'float'
    }
}

export const EstablishmentSchema = {
    name: 'Establishment',
    properties: {
        type: 'string',
        isPreferred: 'bool'
    }
}

export const RadiusSchema = {
    name: 'Radius',
    properties: {
        radius: 'float',
    }
}
