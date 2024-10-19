'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/components-sidebar'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Timestamp } from 'firebase/firestore'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Moon, Sun, Plus, Trash2, Calendar as CalendarIcon, Search, X } from "lucide-react"
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth'
import { getFirestore, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const firebaseConfig = {
  apiKey: "AIzaSyBnER-YtHNLuoHRHUk9sYG2LJQf7RGfFeM",
  authDomain: "tasknest-97ab9.firebaseapp.com",
  projectId: "tasknest-97ab9",
  storageBucket: "tasknest-97ab9.appspot.com",
  messagingSenderId: "643674545565",
  appId: "1:643674545565:web:5490956a77e8609bade374",
  measurementId: "G-05DY064YSX"
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

type Task = {
  id: string
  title: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
  category: string
}

export function Page() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [selectedCategory, setSelectedCategory] = useState('default')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      if (user) {
        const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
        onSnapshot(q, (snapshot) => {
          setTasks(snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              title: data.title,
              completed: data.completed,
              priority: data.priority,
              dueDate: data.dueDate ? 
                (data.dueDate instanceof Timestamp ? data.dueDate.toDate() : new Date(data.dueDate)) 
                : null,
              category: data.category
            } as Task
          }))
        })
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const signIn = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }

  const addTask = async () => {
    if (newTask.trim() && user) {
      await addDoc(collection(db, 'tasks'), {
        title: newTask,
        completed: false,
        priority: selectedPriority,
        dueDate: selectedDate || null,
        category: selectedCategory,
        userId: user.uid
      })
      setNewTask('')
      setIsAddTaskDialogOpen(false)
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    await updateDoc(doc(db, 'tasks', taskId), { completed: !completed })
  }

  const deleteTask = async (taskId: string) => {
    await deleteDoc(doc(db, 'tasks', taskId))
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-400 to-purple-500">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Welcome to TaskNest</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={signIn} className="w-full">Sign in with Google</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      <Sidebar isOpen={sidebarOpen} />
      <main className="flex-1 p-8 ml-64 bg-background transition-all duration-300 ease-in-out">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">TaskNest</h1>
          <div className="flex space-x-2">
            <Button onClick={toggleSidebar} variant="outline" size="icon">
              {sidebarOpen ? '←' : '→'}
            </Button>
            <Button onClick={toggleDarkMode} variant="outline" size="icon">
              {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-1/2">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input
                  type="text"
                  placeholder="Task title"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
                <Select onValueChange={(value: 'low' | 'medium' | 'high') => setSelectedPriority(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  placeholder="Category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                />
                <Button onClick={addTask} className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-start justify-between space-y-0">
                <div className="flex-1 pr-2">
                  <CardTitle className={`text-lg ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </CardTitle>
                </div>
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id, task.completed)}
                />
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
                    {task.priority}
                  </Badge>
                  {task.dueDate && (
                    <span className="text-sm text-gray-500">
                      Due: {isNaN(task.dueDate.getTime()) ? 'Invalid Date' : format(task.dueDate, 'PPP')}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{task.category}</Badge>
                  <Button onClick={() => deleteTask(task.id)} variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}