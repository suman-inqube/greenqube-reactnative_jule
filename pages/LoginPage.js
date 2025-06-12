import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import DropdownFormTest from './Common/DropdownFormTest';
import ButtonFormBottom from './Common/ButtonFormBottom';
import DropdownForm from './Common/DropdownForm';

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');

  const handleLogin = () => {
    onLogin({ email, password, userType });
  };

  return (
    <View>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        testID="email-input"
      />

      <Text>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        testID="password-input"
      />

      <DropdownForm selectedValue={userType} onValueChange={setUserType} />

      <Button title="Login" onPress={handleLogin} testID="login-button" />
    </View>
  );
};

export default LoginPage;
