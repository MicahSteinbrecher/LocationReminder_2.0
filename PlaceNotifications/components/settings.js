import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View, Switch} from 'react-native';
import {Header} from "react-native-elements";
import Realm from "realm";
import {PlaceSchema, EstablishmentSchema} from "../schemas";

export default class Places extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            establishments: []
        };
    }

    componentWillMount() {
        console.log('initializing settings...')
        Realm.open({schema: [PlaceSchema, EstablishmentSchema]})
            .then(realm => {
                console.log('opened realm...');

                let establishments = realm.objects('Establishment').slice();
                console.log('got establishments');
                if (establishments.length === 0) {
                    console.log('initializing establishments...');

                    realm.write(() => {
                        let establishments = [
                            'restaurant',
                            'coffee-tea',
                            'going-out',
                            'sights-museums',
                            'leisure-outdoor',
                            'shopping',
                            'natural-geographical'
                        ];
                        console.log('writing to establishments...');
                        for (let i = 0; i < establishments.length; i++) {
                            console.log('starting step: ' + i);
                            try {
                                realm.create('Establishment', {type: establishments[i], isPreferred: false});
                            } catch (e) {
                                console.log(e)
                            }
                            console.log('ending step: ' + i);
                        }
                    });
                    console.log('done initializing establishments...');
                }
                this.setState({
                    establishments: realm.objects('Establishment').sorted('type').slice()
                });

            })
            .catch(error => {
                console.log(error);
                return error;
            });
    }

    componentDidUpdate(prevProps) {
        console.log(JSON.stringify(this.state.establishments));
    }

    handleValueChange(value, type) {
        console.log('value change: ' + type + ': ' + value);
        let establishments = this.state.establishments.slice();
        Realm.open({schema: [PlaceSchema, EstablishmentSchema]})
            .then(realm => {
                for (var i = 0; i < establishments.length; i++) {
                    if (establishments[i].type === type) {
                        realm.write(() => {
                            realm.delete(establishments[i]);
                            realm.create('Establishment', {type: type, isPreferred: value});
                        });
                        break;
                    }
                }
                this.setState({
                    establishments: realm.objects('Establishment').sorted('type').slice()
                })
            })
            .catch(error => {
                console.log(error);
                return error;
            });
    }

    render(){
        return(
            <View style={styles.container}>
                <Header
                    backgroundColor={'#393e42'}
                    centerComponent={ {text: 'Settings', style: { color: '#fff', fontSize: 20 }}}
                />
                <View>
                    <Text style={styles.text}> What type of venues would you like data on in your vicinity: </Text>
                </View>
                <FlatList
                    data={this.state.establishments}
                    renderItem={({item}) => (
                        <View style={styles.item}>
                            <Text style={styles.listText}>{item.type}</Text>
                            <Switch style={styles.switch}
                                    value={item.isPreferred}
                                    onValueChange={(value)=>this.handleValueChange(value, item.type)}
                            />

                        </View>
                    )
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    item: {
        flexDirection: 'row',
        padding: 10,
        height: 50,
        borderBottomWidth: 1,
        borderColor: 'black',
        alignItems: 'center'
    },
    text: {
        fontWeight: 'bold',
        padding: 10,
        fontSize: 16,
    },
    listText: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 5
    },
    switch: {
        flex: 1
    }
});
