import React, {Component} from 'react';
import {ScrollView, Button, Platform, StyleSheet, View, Text, FlatList, TouchableHighlight, TouchableOpacity} from 'react-native';

export default class InfoModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.activePlace.opening_hours !== undefined) {
            return (

                <FlatList
                    data={this.props.activePlace.opening_hours.weekday_text}
                    renderItem={({item}) => <Text style={styles.schedule}> {item} </Text>}
                    keyExtractor={(item, index) => index.toString()}
                />

            );
        } else {

            return (
                <Text> No schedule found</Text>
            );

        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    schedule: {
        paddingTop: 5,
    },
});
