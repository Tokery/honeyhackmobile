import React from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default class LoginComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      id: "",
      manager: "",
      title: ""
    }
  }

  submitInfo() {
    console.log('Info sent');
    this.props.submitInfo(this.state);
  }

  render() {
    return (
      <View style={styles.container} >
        <TextInput
          style={styles.textStyle}
          onChangeText={(username) => this.setState({username})}
          value={this.state.username}
          placeholder="Username"
        />
        <TextInput
          style={styles.textStyle}
          onChangeText={(id) => this.setState({id})}
          value={this.state.id}
          placeholder="EID"
        />
        <TextInput
          style={styles.textStyle}
          onChangeText={(manager) => this.setState({manager})}
          value={this.state.manager}
          placeholder="Manager"
        />
        <TextInput
          style={styles.textStyle}
          onChangeText={(title) => this.setState({title})}
          value={this.state.title}
          placeholder="Title"
        />
        <Button title="Submit Info" onPress={this.submitInfo.bind(this)}/>
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
  textStyle: {
    height: 40, 
    borderColor: 'gray', 
    borderWidth: 1, 
    width: 300,
    marginBottom: 20,
  }
});
