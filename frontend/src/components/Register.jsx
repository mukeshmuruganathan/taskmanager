import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import API_BASE_URL from '../config'

function Register() {
    const [name, setName] = useState('')
    const [pass, setPass] = useState('')
    const [err, setErr] = useState('')
    const nav = useNavigate()

    const submit = async (e) => {
        e.preventDefault()
        setErr('')
        try {
            const res = await axios.post(`${API_BASE_URL}/register`, { username: name, password: pass })
            if (res.status === 201) {
                toast.success('Registration successful!')
                nav('/login')
            }
        } catch (error) {
            setErr(error.response?.data?.error || 'Registration failed')
            toast.error('Registration failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Create Account</h1>
                    <p className="text-gray-400 text-sm">Join the app</p>
                </div>

                {err && <div className="bg-red-600/10 text-red-200 p-3 rounded mb-4 text-center text-sm">{err}</div>}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Username</label>
                        <input value={name} onChange={e => setName(e.target.value)} required placeholder="username" className="w-full bg-neutral-900/50 border border-neutral-700 rounded px-3 py-2 text-gray-100" />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">Password</label>
                        <input type="password" value={pass} onChange={e => setPass(e.target.value)} required placeholder="password" className="w-full bg-neutral-900/50 border border-neutral-700 rounded px-3 py-2 text-gray-100" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 rounded">Sign Up</motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-violet-400">Login</Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Register
