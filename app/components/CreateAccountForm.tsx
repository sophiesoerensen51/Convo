import React from 'react';
import TextInputField from '../components/TextInputFields';

// Props: email, password og navn + deres respektive set-funktioner
const CreateAccountForm = ({ email, setEmail, password, setPassword, name, setName }) => (
  <>
    {/* Inputfelt til navn – med automatisk stort begyndelsesbogstav i hvert ord */}
    <TextInputField
      placeholder="Name"
      value={name}
      onChangeText={setName}
      autoCapitalize="words"
    />

    {/* Inputfelt til email – uden auto-capitalization og med korrekt tastaturtype */}
    <TextInputField
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      keyboardType="email-address"
      autoCapitalize="none"
    />

    {/* Inputfelt til adgangskode – skjuler indtastning og tillader ikke auto-capitalization */}
    <TextInputField
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      secureTextEntry
      autoCapitalize="none"
    />
  </>
);

export default CreateAccountForm;
