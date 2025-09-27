import React, { useContext } from 'react'
import { UserContext } from '../../context/userContext'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import BottomNav from '../../components/NavbarBottom'

export default function Private() {
    const { currentUser } = useContext(UserContext)
    const location = useLocation()

    if (!currentUser) {
        return <Navigate to="/login" />
    }

    // Liste des pages où tu veux cacher la BottomNav
    const hiddenNavRoutes = ['/user/interest']

    return (
        <div>
            {!hiddenNavRoutes.includes(location.pathname) && <BottomNav />}
            <Outlet />
        </div>
    )
}
