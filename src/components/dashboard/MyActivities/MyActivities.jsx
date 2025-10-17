// FILE: src/components/dashboard/MyActivities.jsx
import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Grid } from '@mui/material'
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
                console.log({ activities })
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
        <Box sx={{ px: 2 }}>
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
                <Grid
                    container
                    spacing={1}
                    sx={{
                        width: '100%',
                        margin: 0,
                    }}
                >
                    {activities.map((activity) => (
                        <Grid
                            item
                            xs={12}
                            sm={12}
                            md={12}
                            key={activity.id}
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                padding: '0px',
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%', // occupe tout l'espace du Grid item
                                    maxWidth: 600, // largeur maximale identique pour toutes les cartes
                                }}
                            >
                                <ActivityCard activity={activity} />
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    )
}
