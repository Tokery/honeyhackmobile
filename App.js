import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, PermissionsAndroid, Switch, Image, TouchableOpacity } from 'react-native';
import LoginComponent from './LoginComponent';
import moment from 'moment';
import MapView from 'react-native-maps';

let markerId = 0;

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
      isDeveloper: false,
      previousLocations: [],
      showHistory: false
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

  saveDataLocally(data){
    const previousLocations = this.state.previousLocations;
    previousLocations.push(data);
    this.setState({previousLocations: previousLocations});
  }

  sendDataToAPI(data) {
    console.log('Pushing...');
    console.log(data);
    this.saveDataLocally(data);
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
    return new Date().getTime()
  }

  componentDidMount() {
    this.interval = setInterval(() => this.updateCoarseLocation(), 3000);
    this.pushDataInterval = setInterval(() => this.pushData(), 1000);
    this.preciseLocationInterval = setInterval(() => this.fineLocation(), 60000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.pushDataInterval);
    clearInterval(this.preciseLocationInterval);
  }

  updateCoarseLocation() {
    var canGetLocation = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
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
    if (this.state.employeeData && this.state.longitude) {
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
  }

  submitInfo(employeeData) {
    this.setState({
      loggedIn: true,
      employeeData: employeeData
    })
  }

  toggleShowHistory() {
    console.log('Current previous locations');
    console.log(this.state.previousLocations);
    this.setState({showHistory: !this.state.showHistory})
  }

  render() {
    return (
      <View style={styles.container}>
        {!this.state.loggedIn ? 
          <LoginComponent submitInfo={this.submitInfo.bind(this)}/> :
          <View style={styles.mapContainer}>
                <MapView
                style={styles.map}
                initialRegion={{
                  latitude: 33.773846,
                  longitude: -84.384577,
                  latitudeDelta: 0.0025,
                  longitudeDelta: 0.0025,
                }}
                >
                { this.state.latitude &&
                  <MapView.Marker
                    coordinate={{latitude: Number(this.state.latitude), longitude: Number(this.state.longitude)}}
                    title={'Your location'}
                  />
                }
                { this.state.showHistory && 
                  this.state.previousLocations.map((location) => 
                    (
                      <MapView.Marker
                      key={markerId++}
                      coordinate={{latitude: Number(location.lat), longitude: Number(location.lng)}}
                      title={'Previous location'}
                      pinColor={'green'}
                      description={location.timestamp}/>
                    )
                  )

                }
              </MapView> 
            <View style={styles.loggedInContainer}> 
              <View style={styles.row}>
                <Text style={{fontSize: 25, fontWeight: 'bold'}}>Welcome {this.state.employeeData.username}!</Text>
                <Switch value={this.state.isDeveloper} onValueChange={() => this.setState({isDeveloper: !this.state.isDeveloper})}/>
              </View>
              <View style={styles.row}>
                <View>
                  <Text style={{fontSize: 20, marginBottom: 5}}>Your Location:</Text>
                  <Text>Longitude: {this.state.longitude}</Text>
                  <Text>Latitude: {this.state.latitude}</Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={() => this.toggleShowHistory()}
                    style={[styles.bubble, styles.button]}
                  >
                    <Text>Show History</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {this.state.isDeveloper &&
                <View>
                  <Button title="Push Data" onPress={this.pushData.bind(this)} style={styles.buttonStyle}/>
                <Button title="Force Update" onPress={this.fineLocation.bind(this)} style={styles.buttonStyle}/>
                <Text>{this.state.message}</Text>
              </View>
              }         
            </View>
            
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
    justifyContent: 'flex-start',
  },
  loggedInContainer: {
    alignSelf: 'stretch',
    padding: 20,
    backgroundColor: 'transparent',    
  },
  buttonStyle: {
    marginTop: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
  },
  blackText: {
    color: 'black'
  },
  button: {
    width: 130,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginVertical: 0,
    backgroundColor: 'transparent',
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  row: {
    marginBottom: 15, 
    flexDirection: 'row', 
    justifyContent: 'space-between'
  }
});
