'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth'
import { getFirestore, collection, addDoc, query, where, onSnapshot, updateDoc, deleteDoc, doc, Timestamp, writeBatch } from 'firebase/firestore'
import { format } from 'date-fns'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Plus, Trash2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Menu, Edit, MoreVertical } from "lucide-react"

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
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
  category: string
  userId: string
  order: number
}

const categories = [
  { name: 'Work', icon: '💼' },
  { name: 'Personal', icon: '🏠' },
  { name: 'Shopping', icon: '🛒' },
  { name: 'Health', icon: '💪' },
  { name: 'Hobbies', icon: '🎨' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Groceries', icon: '🍎' },
  { name: 'Other', icon: '📝' },
]

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
}

export default function EnhancedTodoApp() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'userId' | 'order'>>({
    title: '',
    description: '',
    completed: false,
    priority: 'medium',
    dueDate: null,
    category: 'Other'
  })
  const [darkMode, setDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        const q = query(collection(db, 'tasks'), where('userId', '==', user.uid))
        onSnapshot(q, (snapshot) => {
          const tasksData = snapshot.docs.map(doc => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              dueDate: data.dueDate ? (data.dueDate as Timestamp).toDate() : null
            } as Task
          })
          setTasks(tasksData.sort((a, b) => a.order - b.order))
        })
      } else {
        setTasks([])
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  const addOrUpdateTask = async () => {
    if (!user) return

    if (newTask.title.trim()) {
      const taskData = {
        ...newTask,
        userId: user.uid,
        dueDate: newTask.dueDate ? Timestamp.fromDate(newTask.dueDate) : null,
        order: editingTask ? editingTask.order : tasks.length
      }

      try {
        if (editingTask) {
          await updateDoc(doc(db, 'tasks', editingTask.id), taskData)
        } else {
          await addDoc(collection(db, 'tasks'), taskData)
        }

        setNewTask({
          title: '',
          description: '',
          completed: false,
          priority: 'medium',
          dueDate: null,
          category: 'Other'
        })
        setIsAddingTask(false)
        setEditingTask(null)
      } catch (error) {
        console.error("Error adding/updating task:", error)
      }
    }
  }

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    try {
      await updateDoc(doc(db, 'tasks', taskId), { completed: !completed })
    } catch (error) {
      console.error("Error toggling task completion:", error)
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId))
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const reorderTasks = async (reorderedTasks: Task[]) => {
    setTasks(reorderedTasks)
    const batch = writeBatch(db)
    reorderedTasks.forEach((task, index) => {
      const taskRef = doc(db, 'tasks', task.id)
      batch.update(taskRef, { order: index })
    })
    try {
      await batch.commit()
    } catch (error) {
      console.error("Error updating task order:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-gray-800 dark:text-white"
        >
          Loading...
        </motion.div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Button onClick={signIn} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white">
            Sign in with Google
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-darkcustom ${darkMode ? 'dark' : ''}`}>
      <motion.aside
        initial={{ x: sidebarOpen ? 0 : -250 }}
        animate={{ x: sidebarOpen ? 0 : -250 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-64 h-full bg-white dark:bg-traki p-4 flex flex-col shadow-lg"
      >
        <div className="flex items-center space-x-2 mb-6">
          <Dialog open={showProfileSettings} onOpenChange={setShowProfileSettings}>
            <DialogTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Profile Settings</DialogTitle>
                <DialogDescription>
                  Manage your profile settings here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="name" className="text-right">Name</label>
                  <Input id="name" value={user.displayName || ''} className="col-span-3" readOnly />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="email" className="text-right">Email</label>
                  <Input id="email" value={user.email || ''} className="col-span-3" readOnly />
                </div>
              </div>
              <Button onClick={() => auth.signOut()} variant="outline" className="w-full">
                Sign Out
              </Button>
            </DialogContent>
          </Dialog>
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">{user.displayName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
        <nav className="space-y-2">
          <Button variant="ghost" className="w-full justify-start">
            <CalendarIcon className="mr-2 h-4 w-4" /> Today
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <ChevronRight className="mr-2 h-4 w-4" /> Upcoming
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <Menu className="mr-2 h-4 w-4" /> Projects
          </Button>
        </nav>
        <div style={{display: 'none'}} className="mt-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Categories</h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.name} className="flex items-center text-gray-600 dark:text-gray-300">
                <span className="text-xl mr-2">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.aside>
      <main className={`flex-1 p-8 overflow-auto transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 dark:text-white"
          >
            To-Do List
          </motion.h1>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={toggleDarkMode} variant="outline" size="icon">
                    {darkMode ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</p>
                </TooltipContent>
              </Tooltip>
            
            </TooltipProvider>
            <Button onClick={toggleSidebar} variant="outline" size="icon">
              {sidebarOpen ? <ChevronLeft className="h-[1.2rem] w-[1.2rem]" /> : <ChevronRight className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          </div>
        </div>
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <Dialog open={isAddingTask} onOpenChange={(open) => {
          setIsAddingTask(open)
          if (!open) {
            setEditingTask(null)
            setNewTask({
              title: '',
              description: '',
              completed: false,
              priority: 'medium',
              dueDate: null,
              category: 'Other'
            })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="mb-4">
              <Plus className="mr-2 h-4 w-4" /> Add New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
              <DialogDescription>
                {editingTask ? 'Edit your task here. Click save when you\'re done.' : 'Create a new task here. Click add when you\'re done.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="title" className="text-right">
                  Title
                </label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="description" className="text-right">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="priority" className="text-right">
                  Priority
                </label>
                <Select
                  value={newTask.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="dueDate" className="text-right">
                  Due Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`col-span-3 justify-start text-left font-normal ${
                        !newTask.dueDate && "text-muted-foreground"
                      }`}
                    >
                      {newTask.dueDate ? format(newTask.dueDate, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate || undefined}
                      onSelect={(date) => setNewTask({ ...newTask, dueDate: date || null })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right">
                  Category
                </label>
                <Select
                  value={newTask.category}
                  onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={addOrUpdateTask}>{editingTask ? 'Save Changes' : 'Add Task'}</Button>
          </DialogContent>
        </Dialog>
        <Reorder.Group axis="y" values={filteredTasks} onReorder={reorderTasks}>
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <Reorder.Item key={task.id} value={task}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 mb-4 rounded-lg shadow-lg ${
                    task.completed ? 'bg-gray-100 dark:bg-kutu' : 'bg-white dark:bg-traki'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Checkbox
                          checked={task.completed}
                          onCheckedChange={() => toggleTaskCompletion(task.id, task.completed)}
                          className="w-5 h-5 border-2 border-gray-300 rounded-full transition-all duration-200 ease-in-out
                                     checked:bg-green-500 checked:border-green-500
                                     hover:border-green-400 focus:ring-2 focus:ring-green-400 focus:ring-opacity-50"
                        />
                      </motion.div>
                      <h2
                        className={`text-lg font-semibold ${
                          task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h2>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => {
                          setNewTask(task);
                          setEditingTask(task);
                          setIsAddingTask(true);
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault(); // Prevent the dropdown from closing
                                setDeleteDialogOpen(true); // Open the delete dialog
                              }}
                              className="text-red-600 flex items-center w-full"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your task.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => {
                                if (task.id) {
                                  deleteTask(task.id); // Use task.id here
                                  setDeleteDialogOpen(false); // Close the dialog after deletion
                                }
                              }}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{task.description}</p>
                  <div className="flex items-center space-x-2 text-sm">
                    <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority} priority
                    </span>
                    {task.dueDate && (
                      <span className="text-gray-500 dark:text-gray-400">
                        Due: {format(task.dueDate, 'PPP')}
                      </span>
                    )}
                    <span className="text-gray-500 dark:text-gray-400">
                      {categories.find(c => c.name === task.category)?.icon} {task.category}
                    </span>
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      </main>
    </div>
  )
}
