import React from "react";
import Slideshow from 'react-native-slideshow';

export default class Pictures extends React.Component {
     constructor(props){
        super(props);
        this.state = {
            dataSource: []
        }
    }

    async componentDidMount() {

         let dataSource = [];

        for (var i = 0; i < this.props.pictures.length; i++) {
             let img = await this.getPictures(this.props.pictures[i]);
             dataSource.push({url: img});
             console.log('img: ' + img);
         }
         this.setState({
             dataSource: dataSource
         })

    }

    getPictures(photo) {
        return fetch('https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyA_Oc3xSUiALGBetQGkQ0wuzfrP05G7JCY&photoreference=' + photo.photo_reference + '&maxwidth=400')
            .then((response) => {
                return response.url
            })
            .catch((error) => {
                console.error(error);
            });
    }

    render() {
        return (
            <Slideshow
                dataSource={
                    this.state.dataSource
                }/>
        );
    }
}


















