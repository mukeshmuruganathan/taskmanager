import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'

function Dashboard({ onLogout }) {
  const [items, setItems] = useState([])
  const [text, setText] = useState('')
  const [prio, setPrio] = useState('Medium')
  const [due, setDue] = useState('')
  const [q, setQ] = useState('')
  const [mode, setMode] = useState('all')

  const userId = localStorage.getItem('user_id')

  useEffect(() => { fetchTasks() }, [])

  async function fetchTasks() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/tasks?user_id=${userId}`)
      setItems(res.data)
    } catch (e) {
      console.error(e)
      toast.error('Could not load tasks')
    }
  }

  async function addTask(e) {
    e.preventDefault()
    if (!text.trim()) return
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/tasks`, { title: text, user_id: userId, priority: prio, due_date: due })
      setItems(prev => [...prev, { ...res.data, _id: res.data.task_id }])
      setText('')
      setPrio('Medium')
      setDue('')
      toast.success('Task added')
    } catch (e) {
      toast.error('Error adding task')
    }
  }

  async function delTask(id) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/tasks/${id}`)
      setItems(prev => prev.filter(t => t._id !== id))
      toast.success('Task deleted')
    } catch (e) {
      toast.error('Error deleting')
    }
  }

  async function toggle(task) {
    try {
      const newStatus = !task.completed
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/tasks/${task._id}`, { completed: newStatus })
      setItems(prev => prev.map(t => t._id === task._id ? { ...t, completed: newStatus } : t))
      if (newStatus) toast.success('Great!')
    } catch (e) {
      toast.error('Error updating')
    }
  }

  const list = items.filter(t => {
    if (mode === 'completed') return t.completed
    if (mode === 'pending') return !t.completed
    return true
  }).filter(t => t.title.toLowerCase().includes(q.toLowerCase()))

  const count = items.filter(t => !t.completed).length

  const priorityClass = (p) => {
    if (p === 'High') return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (p === 'Medium') return 'text-orange-400 bg-orange-400/10 border-orange-400/20'
    return 'text-green-400 bg-green-400/10 border-green-400/20'
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-gray-200">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto p-6">
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Task Command Center</h1>
            <p className="text-gray-400 text-sm">{count} tasks remaining</p>
          </div>
          <button onClick={onLogout} className="px-3 py-2 bg-neutral-800 rounded">Sign Out</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
          <div className="md:col-span-8 relative">
            <input placeholder="Search tasks..." value={q} onChange={e => setQ(e.target.value)} className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl py-3 pl-3 pr-4" />
          </div>
          <div className="md:col-span-4 flex gap-2">
            {['all','pending','completed'].map(f => (
              <button key={f} onClick={() => setMode(f)} className={`flex-1 py-2 rounded ${mode===f ? 'bg-violet-600 text-white' : 'text-gray-400'}`}>{f}</button>
            ))}
          </div>
        </div>

        <form onSubmit={addTask} className="bg-neutral-800/40 p-4 rounded mb-6">
          <div className="flex gap-3">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What needs to be done?" className="flex-1 bg-transparent text-white" />
            <select value={prio} onChange={e => setPrio(e.target.value)} className="bg-neutral-900 border rounded px-2 py-1">
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
            <input type="date" value={due} onChange={e => setDue(e.target.value)} className="bg-neutral-900 border rounded px-2 py-1" />
            <button type="submit" className="bg-violet-600 px-4 py-2 rounded">Add Task</button>
          </div>
        </form>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {list.length > 0 ? (
              list.map(task => (
                <motion.div key={task._id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-neutral-800/40 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={task.completed} onChange={() => toggle(task)} className="w-5 h-5" />
                    <div>
                      <div className={`${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</div>
                      <div className="text-xs text-gray-400">{task.due_date ? `Due ${task.due_date}` : ''}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-md border ${priorityClass(task.priority)}`}>{task.priority || 'Medium'}</span>
                    <button onClick={() => delTask(task._id)} className="text-red-400">Delete</button>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-gray-500">{items.length === 0 ? 'No tasks yet. Start by adding one!' : 'No tasks for this filter.'}</motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
