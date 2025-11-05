// FILE: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import { auth } from '../../../firebase-config'
import { fetchUserById } from '../../../services/userService'
import BottomNav from '../../../components/utils/NavbarBottom'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'
import MyActivities from '../../../components/dashboard/MyActivities/MyActivities'
import MyInscriptions from '../../../components/dashboard/MyInscriptions/MyInscriptions'
import MyFavorites from '../../../components/dashboard/MyFavorites/MyFavorites'

export default function Dashboard() {
    const navigate = useNavigate()
    const currentUser = auth.currentUser

    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('Utilisateur')
    const [currentTab, setCurrentTab] = useState('activities') // 'activities', 'inscriptions', 'favorites'

    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUser) {
                navigate('/login')
                return
            }

            try {
                const userData = await fetchUserById(currentUser.uid)
                if (userData?.firstName) setUserName(userData.firstName)
            } catch (error) {
                console.error('Erreur lors du chargement du dashboard:', error)
            } finally {
                setLoading(false)
            }
        }

        loadUserData()
    }, [currentUser, navigate])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#e4eff6',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#e4eff6', pb: 10 }}>
            <AvatarPlaceholder />

            {/* Header */}
            <Box sx={{ p: 3, pt: 4, pb: 2 }}>
                <Typography
                    variant="h3"
                    sx={{ color: '#3454D1', fontWeight: 700, fontFamily: '"All Round Gothic Semi", sans-serif', mb: 1 }}
                >
                    Hello
                </Typography>
                <Typography variant="h3" sx={{ color: '#3454D1', fontFamily: '"All Round Gothic Semi", sans-serif', fontWeight: 700 }}>
                    {userName}
                </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ px: 3, mb: 3 }}>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        bgcolor: 'rgba(255, 255, 255, 0.15)',
                        p: 0.5,
                        borderRadius: 3,
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <Box
                        onClick={() => setCurrentTab('activities')}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 1.2,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            bgcolor: currentTab === 'activities' ? '#FFD168' : 'transparent',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            fontFamily: '"All Round Gothic Semi", sans-serif',
                            fontSize: '0.8rem',
                            transition: 'all 0.3s ease',
                            boxShadow: currentTab === 'activities' ? '0 4px 8px rgba(255, 209, 104, 0.3)' : 'none',
                            '&:hover': {
                                bgcolor: currentTab === 'activities' ? '#FFD168' : 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Mes activités
                    </Box>
                    <Box
                        onClick={() => setCurrentTab('inscriptions')}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 1.2,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            bgcolor: currentTab === 'inscriptions' ? '#FFD168' : 'transparent',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            fontFamily: '"All Round Gothic Semi", sans-serif',
                            fontSize: '0.8rem',
                            transition: 'all 0.3s ease',
                            boxShadow: currentTab === 'inscriptions' ? '0 4px 8px rgba(130, 208, 247, 0.3)' : 'none',
                            '&:hover': {
                                bgcolor: currentTab === 'inscriptions' ? '#FFD168' : 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Mes inscriptions
                    </Box>
                    <Box
                        onClick={() => setCurrentTab('favorites')}
                        sx={{
                            flex: 1,
                            textAlign: 'center',
                            py: 1.2,
                            borderRadius: 2.5,
                            cursor: 'pointer',
                            bgcolor: currentTab === 'favorites' ? '#FFD168' : 'transparent',
                            color: '#1a1a1a',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            fontFamily: '"All Round Gothic Semi", sans-serif',
                            transition: 'all 0.3s ease',
                            boxShadow: currentTab === 'favorites' ? '0 4px 8px rgba(237, 138, 138, 0.3)' : 'none',
                            '&:hover': {
                                bgcolor: currentTab === 'favorites' ? '#FFD168' : 'rgba(255, 255, 255, 0.1)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        Mes envies
                    </Box>
                </Box>
            </Box>

            {/* Content */}
            <Box sx={{ px: 3 }}>
                {currentTab === 'activities' && <MyActivities userId={currentUser.uid} />}
                {currentTab === 'inscriptions' && <MyInscriptions userId={currentUser.uid} />}
                {currentTab === 'favorites' && <MyFavorites userId={currentUser.uid} />}
            </Box>

            <BottomNav />
        </Box>
    )
}
