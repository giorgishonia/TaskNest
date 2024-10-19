'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export function TodoListComponent() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'todos'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const todosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Todo[];
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, []);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const user = auth.currentUser;
    if (!user) return;

    await addDoc(collection(db, 'todos'), {
      text: newTodo,
      completed: false,
      userId: user.uid
    });
    setNewTodo('');
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await updateDoc(doc(db, 'todos', id), { completed: !completed });
  };

  const deleteTodo = async (id: string) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Todo List</CardTitle>
        <CardDescription>Manage your tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={addTodo} className="flex space-x-2 mb-4">
          <Input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new todo"
          />
          <Button type="submit">Add</Button>
        </form>
        <ul className="space-y-2">
          {todos.map((todo) => (
            <li key={todo.id} className="flex items-center space-x-2">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id, todo.completed)}
              />
              <span className={todo.completed ? 'line-through' : ''}>{todo.text}</span>
              <Button variant="destructive" size="sm" onClick={() => deleteTodo(todo.id)}>Delete</Button>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={() => auth.signOut()} className="w-full">Logout</Button>
      </CardFooter>
    </Card>
  );
}