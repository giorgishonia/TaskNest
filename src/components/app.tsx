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

// ... (Firebase configuration and other imports remain the same)

export function App() {
  // ... (state declarations and other functions remain the same)

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 ${darkMode ? 'dark' : ''}`}>
      {/* ... (sidebar and main container remain the same) */}
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
                  task.completed ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white dark:bg-gray-700'
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
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => {
                        setNewTask(task);
                        setEditingTask(task);
                        setIsAddingTask(true);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <AlertDialog>
                          <AlertDialogTrigger className="flex items-center w-full">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your task.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTask(task.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuItem>
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
      {/* ... (rest of the component remains the same) */}
    </div>
  )
}