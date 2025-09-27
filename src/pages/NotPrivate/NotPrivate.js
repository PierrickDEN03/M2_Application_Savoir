import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { Outlet, Navigate } from 'react-router-dom'

export default function NotPrivate() {
    const { currentUser } = useContext(UserContext)

    // Si déjà connecté, redirige vers le dashboard
    if (currentUser) {
        return <Navigate to="/user/dashboard" />
    }

    // Sinon, autorise la navigation (ex: /login, /signup)
    return <Outlet />
}
