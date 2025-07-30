import React from 'react';
import TextInputField from '../components/TextInputFields';

const CreateAccountForm = ({ email, setEmail, password, setPassword, name, setName }) => (
  <>
    <TextInputField
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
    />
    <TextInputField
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      autoCapitalize="none"
    />
    <TextInputField
      placeholder="Name"
      value={name}
      onChangeText={setName}
    />
  </>
);

export default CreateAccountForm;
