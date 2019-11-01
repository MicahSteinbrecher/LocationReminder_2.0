import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import { createBottomTabNavigator, createAppContainer } from 'react-navigation';
import Realm from 'realm';
import { Header, CheckBox } from 'react-native-elements';
import { NavigationEvents } from "react-navigation";
import {PlaceSchema} from "../schemas";


function ListEditor(props) {
    return (
        <FlatList
            style={{flex: 1}}
            data={props.places}
            renderItem={({item, index}) =>
                <View style={ (index === 0) ? styles.firstEditorItem : styles.editorItem }>
                    <View style={styles.itemText}>
                        <Text numberOfLines={1} style={{fontWeight: 'bold'}}> {item.name} {"\n"}</Text>
                        <Text numberOfLines={1}> {item.address}</Text>
                    </View>
                    <CheckBox
                        style={styles.itemCheckbox}
                        containerStyle={styles.checkbox}
                        checkedIcon='dot-circle-o'
                        uncheckedIcon='circle-o'
                        checked={props.isChecked[index]}
                        onPress={()=> props.onPress(index)}
                    />
                </View>
            }
            keyExtractor={(item, index) => index.toString()}
        />
    );
}

function MainDisplay(props) {
    if (props.edit){
        //TODO
        return (
            <ListEditor isChecked={props.isChecked} places={props.places} onPress={(index)=>props.onPress(index)}/>
        );
    } else {
        return (
            <FlatList
                data={props.places}
                renderItem={({item, index}) =>
                    <View style={ (index === 0) ? styles.firstItem : styles.item }>
                        <Text style={{fontWeight:'bold'}} numberOfLines={1}> {item.name} {"\n"}</Text>
                        <Text numberOfLines={1}> {item.address} </Text>
                    </View>
                }
                keyExtractor={(item, index) => index.toString()}
            />
        );
    }
}


export default class Places extends React.Component {

    constructor(props){
        super(props);
        this.state={
            places:null,
            edit: false,
            header: 'edit',
            isChecked: [],
        }
    }

    componentWillMount() {
        Realm.open({
            schema: [PlaceSchema]
        }).then(realm => {
            let places = realm.objects('Place').slice();
            this.setState({
                places: places,
                isChecked: Array(places.length).fill(false),
            });
        }).catch(error => {
            console.log(error);
        });
    }

    componentDidUpdate(prevProps, prevState) {

        //updates header when toggling edit mode
        if (prevState.edit !== this.state.edit) {
            if (this.state.edit) {
                this.setState({
                    header: 'done',
                });
            } else {
                this.setState({
                    header: 'edit',
                });
            }
        }
        console.log(JSON.stringify(this.state));
    }

    toggleEdit(){
        if (this.state.edit) {
            this.setState(
            {
                isChecked: Array(this.state.places.length).fill(false),
            })
        }
        this.setState({
            edit: !this.state.edit,
        });
    }


    handlePress(index){
        console.log('handle press fired at index ' + index);
        const isChecked = this.state.isChecked.slice();
        isChecked[index] = !this.state.isChecked[index];
        this.setState({isChecked: isChecked});
    }

    handleRemove(){

        Realm.open({schema: [PlaceSchema]})
            .then(realm => {
                for (let i = 0; i < this.state.places.length; i++){
                    console.log('places length: ' + this.state.places.length);
                    console.log('iteration ' + i);
                    if (this.state.isChecked[i]){
                        realm.write(() => {
                            console.log('deleting place ' + i +'...')
                            realm.delete(this.state.places[i]);
                        })
                    }
                }
                let places = realm.objects('Place').slice();
                this.setState({
                    places : places,
                    isChecked: Array(places.length).fill(false),
                })
                if (places.length === 0) {
                    this.setState({
                        edit: false,
                    })
                }
            })
            .catch(error => {
                console.log(error);
            });

    }

    handleScreenFocus(){
        Realm.open({schema: [PlaceSchema]})
            .then(realm => {
                let places = realm.objects('Place');
                this.setState({
                    places : realm.objects('Place').slice(),
                    isChecked: Array(places.length).fill(false),
                    edit: false,
                    header: "edit",
                })
            })
            .catch(error => {
                console.log(error);
            });
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationEvents
                    onWillFocus={payload => {
                        this.handleScreenFocus();
                    }}
                />
                <Header
                    backgroundColor={'#393e42'}
                    centerComponent={ {text: 'Your Places', style: { color: '#fff', fontSize: 20 }}}
                    leftComponent={ (this.state.isChecked.length !== 0) ? {text: this.state.header, onPress: ()=>this.toggleEdit(), style: { color: '#fff', fontSize: 16 }} : null }
                    rightComponent={ (this.state.edit) ? {text: 'remove', onPress: ()=>this.handleRemove(), style: { color: '#fff', fontSize: 16 }} : null }
                />
                <MainDisplay
                    places={this.state.places}
                    edit={this.state.edit}
                    isChecked={this.state.isChecked}
                    onPress={(index)=>this.handlePress(index)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    },
    firstItem: {
        flex:1,
        flexDirection: 'column',
        padding: 10,
        height: 80,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    item: {
        flex:1,
        flexDirection: 'column',
        padding: 10,
        height: 80,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    firstEditorItem: {
        flex:1,
        flexDirection: 'row',
        padding: 10,
        height: 80,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    editorItem: {
        flex:1,
        flexDirection: 'row',
        padding: 10,
        height: 80,
        borderBottomWidth: 1,
        borderColor: 'black',
    },
    itemText: {
        flex: 5,
        flexDirection: 'column'
    },
    itemCheckbox: {
        flex: 1,
    }
});
