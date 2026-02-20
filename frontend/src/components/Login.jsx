import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import API_BASE_URL from '../config'

function Login({ onLogin }) {
    const [user, setUser] = useState('')
    const [pwd, setPwd] = useState('')
    const [err, setErr] = useState('')
    const nav = useNavigate()

    // try to login
    const submit = async (e) => {
        e.preventDefault()
        setErr('')
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, { username: user, password: pwd })
            if (res.status === 200) {
                onLogin(res.data.user_id)
                toast.success('Welcome back!')
                nav('/dashboard')
            }
        } catch (error) {
            setErr(error.response?.data?.error || 'Login failed')
            toast.error('Login failed')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 relative">
            <div className="absolute inset-0 z-0">
                <div className="absolute -top-10 -left-10 w-2/5 h-2/5 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 w-full max-w-md p-8 bg-white/5 rounded-2xl border border-white/10">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">Welcome Back</h1>
                    <p className="text-gray-400 text-sm">Sign in to continue</p>
                </div>

                {err && <div className="bg-red-600/10 text-red-200 p-3 rounded mb-4 text-center text-sm">{err}</div>}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-400">Username</label>
                        <input value={user} onChange={e => setUser(e.target.value)} required placeholder="username" className="w-full bg-neutral-900/50 border border-neutral-700 rounded px-3 py-2 text-gray-100" />
                    </div>

                    <div>
                        <label className="text-xs text-gray-400">Password</label>
                        <input type="password" value={pwd} onChange={e => setPwd(e.target.value)} required placeholder="password" className="w-full bg-neutral-900/50 border border-neutral-700 rounded px-3 py-2 text-gray-100" />
                    </div>

                    <motion.button whileHover={{ scale: 1.02 }} type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 rounded">Sign In</motion.button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-400">
                    Don't have an account? <Link to="/register" className="text-violet-400">Register</Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
