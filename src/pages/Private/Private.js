import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../../components/utils/NavbarBottom'
import { Box, CircularProgress } from '@mui/material'
import { getAuthenticatedUser } from '../../services/userService'

export default function Private() {
    const location = useLocation()
    const navigate = useNavigate()
    const [checkingUser, setCheckingUser] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        let mounted = true

        async function checkUser() {
            try {
                const authUser = await getAuthenticatedUser()
                if (!mounted) return

                if (!authUser) {
                    navigate('/login', { replace: true })
                } else if (!authUser.registered) {
                    navigate('/register-profile', { replace: true, state: { email: authUser.email } })
                } else {
                    setUser(authUser)
                }
            } catch (err) {
                console.error(err)
            } finally {
                if (mounted) setCheckingUser(false)
            }
        }

        checkUser()
        return () => {
            mounted = false
        }
    }, [navigate])

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

    // Pages où on cache le BottomNav
    const hiddenNavRoutes = ['/user/interest', '/user/modif-profile']

    return (
        <div>
            {!hiddenNavRoutes.some((route) => location.pathname.startsWith(route)) && <BottomNav />}
            <Outlet context={{ user }} />
        </div>
    )
}
