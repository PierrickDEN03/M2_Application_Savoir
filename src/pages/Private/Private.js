import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { Outlet, Navigate } from 'react-router-dom'

//Si connecté, redirige sur la page en question, sinon sur SignIn
export default function Private() {
    const { currentUser } = useContext(UserContext)
    if (!currentUser) {
        return <Navigate to="/login" />
    }

    return (
        <div>
            <Outlet />
        </div>
    )
}
