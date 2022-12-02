import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Keyboard } from 'react-native';
import Login from './src/components/Login';
import TaskList from './src/components/TaskList';
import Feather from 'react-native-vector-icons/Feather';

import { db } from './src/services/firebaseConfig';
import { set, ref, push, child, onValue, remove, update } from 'firebase/database';

export default function App() {

  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState('');
  const inputRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [key, setKey] = useState('');

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

    //Usuário quer editar uma tarefa
    if (key !== '') {
      update(ref(db, 'tarefas/' + user + '/' + key), {
        nome: newTask
      })
        .then(() => {
          const taskIndex = tasks.findIndex(item => item.key === key);
          let taskClone = tasks;
          taskClone[taskIndex].nome = newTask;

          setTasks([...taskClone]);

        })
        .catch((error) => {
          console.log(error.message);
        })

      Keyboard.dismiss();
      setNewTask('');
      setKey('');

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
    const deleteTask = ref(db, 'tarefas/' + user + '/' + keyTask);

    remove(deleteTask)
      .then(() => {
        //console.log(keyTask)
        const findTask = tasks.filter(item => item.key !== keyTask)
        setTasks(findTask);

      })
      .catch((error) => {
        alert(error.message);
      });

  }

  function handleEdit(data) {
    setNewTask(data.nome);
    setKey(data.key);
    inputRef.current.focus();
  }

  function cancelEdit() {
    setNewTask('');
    setKey('');
    Keyboard.dismiss();
  }

  if (!user) {
    return <Login changeStatus={(user) => setUser(user)} />
  }

  return (
    <SafeAreaView style={styles.container}>

      {key.length > 0 &&

        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={cancelEdit}
          >
            <Feather name="x-circle" size={20} color="#FF0000" />
          </TouchableOpacity>
          <Text style={{ marginLeft: 5, color: "#FF0000" }}>Você está editando uma tarefa</Text>
        </View>
      }

      <View style={styles.containerTask}>
        <TextInput
          style={styles.input}
          placeholder="O que vai fazer hoje?"
          value={newTask}
          onChangeText={(text) => setNewTask(text)}
          ref={inputRef}
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