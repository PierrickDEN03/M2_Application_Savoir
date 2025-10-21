// FILE: src/components/dashboard/MyActivities.jsx
import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress } from '@mui/material'
import { fetchActivitiesByUser } from '../../../services/activitiesService'
import { fetchCategoryById } from '../../../services/categoriesService'
import ActivityCard from './MyActivityCard'

export default function MyActivities({ userId }) {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadActivities = async () => {
            try {
                const userActivities = await fetchActivitiesByUser(userId)

                const activitiesWithCategories = await Promise.all(
                    userActivities.map(async (activity) => {
                        const category = activity.categoryId ? await fetchCategoryById(activity.categoryId) : null
                        return { ...activity, category }
                    })
                )
                setActivities(activitiesWithCategories)
            } catch (error) {
                console.error('Erreur lors du chargement des activités:', error)
            } finally {
                setLoading(false)
            }
        }

        loadActivities()
    }, [userId, activities])

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress sx={{ color: 'white' }} size={35} />
            </Box>
        )
    }

    return (
        <Box>
            <Typography
                sx={{
                    color: 'white',
                    fontSize: '1rem',
                    mb: 3,
                    fontWeight: 600,
                    opacity: 0.9,
                }}
            >
                Mes activités ({activities.length})
            </Typography>

            {activities.length === 0 ? (
                <Typography
                    sx={{
                        color: 'white',
                        textAlign: 'center',
                        py: 6,
                        opacity: 0.7,
                        fontSize: '0.95rem',
                    }}
                >
                    Aucune activité créée pour le moment.
                </Typography>
            ) : (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1, // équivalent du spacing={1}
                        m: 0,
                    }}
                >
                    {activities.map((activity) => (
                        <Box
                            key={activity.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                width: '100%',
                                p: 0,
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    maxWidth: 600,
                                }}
                            >
                                <ActivityCard activity={activity} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}
