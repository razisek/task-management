import React, { useState } from 'react'
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../Api/api';
import Alert from '../components/Alert';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/login', {
                email,
                password,
            });
            if (response.status === 200) {
                localStorage.setItem('token', response.data.access_token);
                navigate('/');
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                setError('Invalid credentials.');
            } else if (error.response && error.response.status === 422) {
                setError('Check your form inputs.');
            } else {
                setError('An error occurred. Please try again.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <Alert message={error} type="error" />}
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            disabled={loading}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                disabled={loading}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-3 text-gray-500"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <BsEyeSlash size={20} /> : <BsEye size={20} />}
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className={`w-full p-2 font-bold text-white rounded-md focus:outline-none transition duration-300 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg
                                    className="w-5 h-5 mr-3 text-white animate-spin"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2s-.9 2-2 2H6c-1.1 0-2-.9-2-2z"></path>
                                </svg>
                                Loading...
                            </span>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                <p>Don't have an account? <NavLink to="/register" className="text-blue-600" >Register</NavLink></p>
            </div>
        </div>
    )
}

export default Login