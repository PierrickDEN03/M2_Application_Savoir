import React, { useEffect, useState, useContext } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import ActivityCard from '../../utils/ActivityCard'
import { getUserFavorites } from '../../../services/favorisService'
import { fetchActivityById } from '../../../services/activitiesService'
import { UserContext } from '../../../context/userContext'

export default function MyFavorites() {
    const { currentUser } = useContext(UserContext)
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (currentUser) loadFavorites()
    }, [currentUser])

    const loadFavorites = async () => {
        try {
            setLoading(true)
            const userFavorites = await getUserFavorites(currentUser.uid)
            const now = new Date()

            // Charger les activités favorites encore valides
            const activities = []
            for (const fav of userFavorites) {
                const activity = await fetchActivityById(fav.activityId)
                if (activity && new Date(activity.date) >= now) {
                    activities.push(activity)
                }
            }

            setFavorites(activities)
        } catch (error) {
            console.error('Erreur lors du chargement des favoris:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    if (favorites.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 5 }}>
                <Typography sx={{ color: '#1a1a1a', fontSize: '0.95rem', fontFamily: '"Nunito", sans-serif' }}>
                    Aucune activité enregistrée dans vos favoris
                </Typography>
            </Box>
        )
    }

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                width: '100%',
            }}
        >
            {favorites.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
            ))}
        </Box>
    )
}
