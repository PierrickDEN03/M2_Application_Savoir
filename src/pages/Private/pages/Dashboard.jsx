// FILE: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, CircularProgress } from '@mui/material'
import { auth } from '../../../firebase-config'
import { getUserReservations } from '../../../services/reservationsService'
import { getUserFavorites } from '../../../services/favorisService'
import { fetchActivityById } from '../../../services/activitiesService'
import { fetchCategoryById } from '../../../services/categoriesService'
import { fetchUserById } from '../../../services/userService'
import BottomNav from '../../../components/utils/NavbarBottom'
import CreateActivityButton from '../../../components/utils/CreateActivityBtn'
import RappelActivity from '../../../components/dashboard/RappelActivity'
import AroundYou from '../../../components/dashboard/AroundYou'
import Favoris from '../../../components/dashboard/Favoris'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

export default function Dashboard() {
    const navigate = useNavigate()
    const currentUser = auth.currentUser
    const [loading, setLoading] = useState(true)
    const [userName, setUserName] = useState('Utilisateur')
    const [nextActivity, setNextActivity] = useState(null)
    const [nearbyActivities, setNearbyActivities] = useState([])
    const [favorites, setFavorites] = useState([])

    useEffect(() => {
        const loadDashboardData = async () => {
            if (!currentUser) {
                navigate('/login')
                return
            }

            try {
                // Récupérer les informations de l'utilisateur
                const userData = await fetchUserById(currentUser.uid)
                if (userData && userData.firstName) {
                    setUserName(userData.firstName)
                }

                // Récupérer les réservations de l'utilisateur
                const reservations = await getUserReservations(currentUser.uid)

                // Trouver la prochaine activité (la plus proche dans le temps)
                if (reservations.length > 0) {
                    const activitiesWithDetails = await Promise.all(
                        reservations.map(async (res) => {
                            const activity = await fetchActivityById(res.activityId)
                            const category = activity ? await fetchCategoryById(activity.categoryId) : null
                            return { ...activity, category }
                        })
                    )

                    // Filtrer les activités futures et trier par date
                    const futureActivities = activitiesWithDetails
                        .filter((act) => act && new Date(act.date) > new Date())
                        .sort((a, b) => new Date(a.date) - new Date(b.date))

                    if (futureActivities.length > 0) {
                        setNextActivity(futureActivities[0])
                    }
                }

                // Récupérer les favoris
                const favoritesData = await getUserFavorites(currentUser.uid)
                const favoritesWithDetails = await Promise.all(
                    favoritesData.slice(0, 3).map(async (fav) => {
                        const activity = await fetchActivityById(fav.activityId)
                        const category = activity ? await fetchCategoryById(activity.categoryId) : null
                        return { ...activity, category }
                    })
                )
                setFavorites(favoritesWithDetails.filter((f) => f !== null))

                // TODO: Pour les activités autour de toi, utiliser la géolocalisation
                // Pour l'instant, on laisse vide
                setNearbyActivities([])
            } catch (error) {
                console.error('Erreur lors du chargement du dashboard:', error)
            } finally {
                setLoading(false)
            }
        }

        loadDashboardData()
    }, [currentUser, navigate])

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#3454D1',
                }}
            >
                <CircularProgress sx={{ color: 'white' }} />
            </Box>
        )
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: '#3454D1',
                pb: 10,
            }}
        >
            <AvatarPlaceholder />
            {/* Header */}
            <Box sx={{ p: 3, pt: 4 }}>
                <Typography
                    variant="h3"
                    sx={{
                        color: 'white',
                        fontWeight: 700,
                        mb: 1,
                    }}
                >
                    Hello
                </Typography>
                <Typography
                    variant="h3"
                    sx={{
                        color: 'white',
                        fontWeight: 700,
                    }}
                >
                    {userName}
                </Typography>
            </Box>

            {/* Composants */}
            <RappelActivity activity={nextActivity} />
            <AroundYou activities={nearbyActivities} />
            <Favoris favorites={favorites} />

            <CreateActivityButton />
            <BottomNav />
        </Box>
    )
}
