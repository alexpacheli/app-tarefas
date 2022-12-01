import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import Login from './src/components/Login';
import TaskList from './src/components/TaskList';

import { db } from './src/services/firebaseConfig';
import { set, ref, push, child, onValue, remove } from 'firebase/database';  

export default function App() {

  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {

    function getUser() {
      if (!user) {
        return;
      }

      const refUser = ref(db, 'tarefas/' + user);
      onValue(refUser, (snapshot) => {
        
        setTasks([]);

        snapshot?.forEach((childItem) => {
          let data = {
            key: childItem.key,
            nome: childItem.val().nome
          }

          setTasks(oldTasks => [...oldTasks, data]);
        })
      }, {
        onlyOnce: true
      });

    }

    getUser();

  }, [user]);

  function handleAdd() {
    if (newTask === '') {
      return;
    }

    const newKey = push(child(ref(db), 'tarefas/' + user)).key;

    set(ref(db, 'tarefas/' + user + '/' + newKey), {
      nome: newTask,
    })
      .then(() => {

        const data = {
          key: newKey,
          nome: newTask
        }

        setTasks(oldTasks => [...oldTasks, data]);

      })
      .catch((error) => {
        console.log(error.message);
      });

    Keyboard.dismiss();
    setNewTask('');
  }

  function handleDelete(keyTask) {
    const deleteTask = ref(db, 'tarefas/'+user+'/'+keyTask);
    
    remove(deleteTask)
    .then(() => {
      console.log(keyTask)
      const findTask = tasks.filter(item => item.key !== keyTask)
      setTasks(findTask);

    })
    .catch((error) => {
      alert(error.message);
    });
    
  }

  function handleEdit(data) {
    console.log(data);
  }

  if (!user) {
    return <Login changeStatus={(user) => setUser(user)} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.containerTask}>
        <TextInput
          style={styles.input}
          placeholder="O que vai fazer hoje?"
          value={newTask}
          onChangeText={(text) => setNewTask(text)}
        />

        <TouchableOpacity
          style={styles.buttonAdd}
          onPress={handleAdd}
        >
          <Text style={styles.textButtonAdd}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        keyExtractor={item => item.key}
        data={tasks}
        renderItem={({ item }) => (
          <TaskList data={item} deleteItem={handleDelete} editItem={handleEdit} />
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 10,
    backgroundColor: '#f2f6fc'
  },
  containerTask: {
    flexDirection: "row",
  },
  input: {
    flex: 1,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFF',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#141414',
    height: 45
  },
  buttonAdd: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 5,
    height: 45,
    backgroundColor: '#141414',
    paddingHorizontal: 14,
    borderRadius: 4
  },
  textButtonAdd: {
    color: '#FFF',
    fontSize: 22
  }
})