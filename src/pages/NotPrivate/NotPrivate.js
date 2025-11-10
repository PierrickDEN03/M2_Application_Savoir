import React, { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { getAuthenticatedUser } from '../../services/userService'

export default function NotPrivate() {
    const navigate = useNavigate()
    const [checkingUser, setCheckingUser] = useState(true)
    const [authUser, setAuthUser] = useState(null)

    // Hook pour charger l'utilisateur
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

    // Hook pour rediriger si profil enregistré
    useEffect(() => {
        if (!checkingUser && authUser?.registered) {
            // Marquer que l'utilisateur vient d'une page publique
            sessionStorage.setItem('checkActivitiesOnDashboard', 'true')
            navigate('/user/dashboard', { replace: true })
        }
    }, [checkingUser, authUser, navigate])

    if (checkingUser) {
        return (
            <Box
                sx={{
                    height: '100vh',
                    bgcolor: '#e4eff6',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    // Sinon accès autorisé à la page NotPrivate
    return <Outlet />
}
