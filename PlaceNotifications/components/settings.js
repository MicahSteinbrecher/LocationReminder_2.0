import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch,
    TextInput,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import {Header} from "react-native-elements";
import Realm from "realm";
import {PlaceSchema, EstablishmentSchema, RadiusSchema} from "../schemas";
import Error from "./error"

export default class Places extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            establishments: [],
            radius: 5,
            editRadius: false,
            isNaN: false
        };
    }

    componentWillMount() {
        console.log('initializing settings...');
        Realm.open({schema: [PlaceSchema, EstablishmentSchema, RadiusSchema]})
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
                let radius  = realm.objects('Radius').slice(0,1);
                if (radius.length === 1) {
                    radius = radius[0].radius;
                } else {
                    radius = 5
                }
                this.setState({
                    establishments: realm.objects('Establishment').sorted('type').slice(),
                    radius: radius
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
        Realm.open({schema: [PlaceSchema, EstablishmentSchema, RadiusSchema]})
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

    handleRadiusUpdate(radius) {
        if (!radius) {
            this.setState({
                isNaN: false
            })
            return;
        }

        radius = parseFloat(radius);

        if (isNaN(radius)){
            this.setState({
                isNaN: true
            })
            return;
        }

        this.setState({
            isNaN: false
        })

        Realm.open({schema: [PlaceSchema, EstablishmentSchema, RadiusSchema]})
            .then(realm => {
                realm.write(() => {
                    realm.delete(realm.objects('Radius'));
                    realm.create('Radius', {radius: radius});
                });

                this.setState({
                    radius: radius
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
                <View style={{flexDirection:'row', flex: 1}} behavior="padding" enabled>
                        <Text style={{
                            fontWeight: 'bold',
                            padding: 10,
                            fontSize: 16,
                            flex: 5}}
                        >
                            Radius of search (miles): </Text>
                        <TextInput style={{
                            fontWeight: 'bold',
                            fontSize: 16,
                            flex: 1,
                            borderColor: 'black',
                            borderWidth: 1,
                            height: 40}}
                            onChangeText={(radius)=>{this.handleRadiusUpdate(radius)}}
                        >
                            {this.state.radius}
                        </TextInput>
                        {/*<Switch style={{flex: 1}}*/}
                                {/*value={this.state.editRadius}*/}
                                {/*onValueChange={(value) => {*/}
                                    {/*console.log('value ' + value);*/}
                                    {/*this.setState({*/}
                                        {/*editRadius: value*/}
                                    {/*})*/}
                                {/*}}*/}
                        {/*/>*/}
                </View>
                <Error isNaN={this.state.isNaN}/>
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
