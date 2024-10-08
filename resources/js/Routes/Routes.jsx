import React from 'react'
import { Routes, Route, } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import PrivateRoute from './PrivateRoute'
import AuthRoute from './AuthRoute'

export default () => {
    return (
        <>
            <Routes>
                <Route element={<AuthRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>
                <Route element={<PrivateRoute />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>
        </>
    )
}