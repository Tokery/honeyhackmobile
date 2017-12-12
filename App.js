import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, PermissionsAndroid, Switch, Image } from 'react-native';
import LoginComponent from './LoginComponent';
// import { lchmod } from 'fs';

async function requestLocationPermission() {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        'title': 'Employee App Permission',
        'message': 'Cool Photo App needs access to your camera ' +
                   'so you can take awesome pictures.'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use the camera")
    } else {
      console.log("Camera permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      latitude: null,
      longitude: null,
      error: null,
      loggedIn: false,
      employeeData: null,
      message: "",
      isDeveloper: false
    }
  }

  convertObjectToQueryString(object) {
    var str = [];
    for(var p in object)
      if (object.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(object[p]));
      }
    return str.join("&");
  }

  sendDataToAPI(data) {
    console.log('Pushing...');
    console.log(data);
    fetch('http://honeyhack.herokuapp.com/api/postUserLocation?' + this.convertObjectToQueryString(data), {
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
    this.interval = setInterval(() => this.updateAndSendLocation(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  updateAndSendLocation() {
    var canGetLocation = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (canGetLocation) {
      console.log('Updating location');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('geoloc');
          console.log(position);
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: 'Successful'
          });
        },
        (error) => this.setState({message: error.message}),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000}
      )
    }
    else {
      console.log('ACCESS DENIED');
    }
  }

  fineLocation() {
    var canGetLocation = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    if (canGetLocation) {
      console.log('Updating location');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            message: 'Successful'
          });
        },
        (error) => this.setState({message: error.message}),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000}
      )
    }
    else {
      console.log('ACCESS DENIED');
    }
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
          <View style={styles.loggedInContainer}> 
            <View style={{marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 25, fontWeight: 'bold'}}>Welcome {this.state.employeeData.username}!</Text>
              <Switch value={this.state.isDeveloper} onValueChange={() => this.setState({isDeveloper: !this.state.isDeveloper})}/>
            </View>
            <Text style={{fontSize: 20, marginBottom: 5}}>Your Location:</Text>
            <Text>Longitude: {this.state.longitude}</Text>
            <Text>Latitude: {this.state.latitude}</Text>
            {this.state.isDeveloper &&
            <View>
              <Button title="Push Data" onPress={this.pushData.bind(this)} style={styles.buttonStyle}/>
              <Button title="Force Update" onPress={this.fineLocation.bind(this)} style={styles.buttonStyle}/>
              <Text>{this.state.message}</Text>
            </View>
            }
          <Image style={styles.mapStyle} source={require('./floorplan.jpeg')} resizeMethod='resize'/>  
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
  loggedInContainer: {
    flexGrow: 1, 
    alignSelf: 'stretch', 
    padding: 50
  },
  buttonStyle: {
    marginTop: 10
  },
  mapStyle: {
    marginTop: 30,
    width: 300,
    height: 300
  }
});
