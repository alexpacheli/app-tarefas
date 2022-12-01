import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

import { auth } from '../../services/firebaseConfig';

export default function Login({changeStatus}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('login');

  function handleLogin() {
    if (type === 'login')
    {
      const user = signInWithEmailAndPassword(auth, email, password)
      .then((user) => {
        changeStatus(user.user.uid);
      })
      .catch((error) => {
        alert(error.message)
      })

    } else {
      const user = createUserWithEmailAndPassword(auth, email, password)
      .then((user) => {
        changeStatus(user.user.uid);
      })
      .catch((error) => {
        alert(error.message)
      })

    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        onChangeText={(value) => setEmail(value)}
        placeholder="Email"
      />

      <TextInput
        style={styles.input}
        onChangeText={(value) => setPassword(value)}
        placeholder="Senha"
      />

      <TouchableOpacity
        style={[styles.handleLogin, { backgroundColor: type === 'login' ? '#3ea6f2' : '#141414' }]}
        onPress={handleLogin}
      >
        <Text style={styles.login}>
          {type === 'login' ? 'Acessar' : 'Cadastrar'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setType(type => type === 'login' ? 'cadastrar' : 'login')}>
        <Text style={{textAlign: 'center'}}>{type === 'login' ? 'Criar uma conta' : 'Já possuo uma conta'}</Text>
      </TouchableOpacity>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#f2f6fc",
    paddingHorizontal: 10
  },
  input: {
    marginBottom: 10,
    backgroundColor: '#FFF',
    borderRadius: 4,
    height: 45,
    padding: 10,
    borderWidth: 1,
    borderColor: '#141414'
  },
  handleLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 45,
    backgroundColor: {},
    marginBottom: 10
  },
  login: {
    color: '#fff'
  }
})