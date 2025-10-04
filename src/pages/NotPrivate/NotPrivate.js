// src/pages/NotPrivate/NotPrivate.js
import React, { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { getAuthenticatedUser } from '../../services/userService'

export default function NotPrivate() {
    const [checkingUser, setCheckingUser] = useState(true)
    const [authUser, setAuthUser] = useState(null)

    useEffect(() => {
        let mounted = true

        async function checkUser() {
            try {
                const user = await getAuthenticatedUser()
                if (!mounted) return
                setAuthUser(user)
            } catch (err) {
                console.error('Erreur NotPrivate:', err)
            } finally {
                if (mounted) setCheckingUser(false)
            }
        }

        checkUser()
        return () => {
            mounted = false
        }
    }, [])

    if (checkingUser) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    bgcolor: '#3454D1',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress sx={{ color: '#FFD166' }} />
            </Box>
        )
    }

    // Si connecté ET profil enregistré → redirige vers dashboard
    if (authUser && authUser.registered) {
        return <Navigate to="/user/dashboard" replace />
    }

    // Sinon, autorise l'accès aux pages non privées
    return <Outlet />
}
