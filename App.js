import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import LoginComponent from './LoginComponent';
// import { lchmod } from 'fs';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      loggedIn: false,
      employeeData: null
    }
  }
  sendDataToAPI(data) {
    console.log('Pushing...');
    console.log(data);
    fetch('https://honeyhack.herokuapp.com/api/postUserLocation', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).then(response => {
      console.log('Sent data');
      console.log(response);
    });
  }

  getCurrentTime(){
    return new Date().getTime();
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateAndSendLocation(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateAndSendLocation() {
    console.log('Updating location');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('geoloc');
        console.log(position);
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
    )
  }

  pushData() {
    var data = {
      hid: this.state.employeeData.id,
      title: this.state.employeeData.title,
      manager: this.state.employeeData.manager,
      username: this.state.employeeData.username,
      lng: this.state.longitude,
      lat: this.state.latitude,
      timestamp: this.getCurrentTime()
    }
    this.sendDataToAPI(data);
  }

  submitInfo(employeeData) {
    this.setState({
      loggedIn: true,
      employeeData: employeeData
    })
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.loggedIn ? 
          <LoginComponent submitInfo={this.submitInfo.bind(this)}/> :
          <View>
            <Text>You are logged in</Text>
            <Text>Longitude: {this.state.longitude}</Text>
            <Text>Latitude: {this.state.latitude}</Text>
            <Button title="Push Data" onPress={this.pushData.bind(this)}/>
          </View>
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
