// FILE: src/components/AroundYou.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, Card, CardContent, Button, CircularProgress } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import useLoadGooglePlaces from '../google_api/useLoadGooglePlaces'

export default function AroundYou({ activities }) {
    console.log({ activities })
    const navigate = useNavigate()
    const googleLoaded = useLoadGooglePlaces()
    const [userLocation, setUserLocation] = useState(null)
    const [distances, setDistances] = useState({})
    const [nearbyActivities, setNearbyActivities] = useState([])
    const [loadingDistances, setLoadingDistances] = useState(true)

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = new Date(dateString)
        return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }

    const getIconComponent = (iconName) => MuiIcons[iconName] || MuiIcons.ShoppingCart

    // 🔹 Récupération de la position réelle
    useEffect(() => {
        if (!navigator.geolocation) {
            console.error('Géolocalisation non supportée')
            setLoadingDistances(false)
            return
        }
        console.log('Demande de géolocalisation...')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                console.log('Position récupérée:', latitude, longitude)
                setUserLocation(new window.google.maps.LatLng(latitude, longitude))
            },
            (error) => {
                console.error('Erreur géolocalisation:', error)
                setLoadingDistances(false)
            },
            { enableHighAccuracy: true }
        )
    }, [])

    // 🔹 Calcul des distances et filtrage des activités à moins de 5 km
    useEffect(() => {
        if (!googleLoaded) return
        if (!userLocation) return
        if (!activities.length) {
            console.log('Aucune activité à traiter')
            setLoadingDistances(false)
            return
        }

        console.log('Calcul des distances pour', activities.length, 'activités')
        const service = new window.google.maps.DistanceMatrixService()
        const destinations = activities.map((act) => ({ placeId: act.address?.placeId }))

        service.getDistanceMatrix(
            {
                origins: [userLocation],
                destinations,
                travelMode: window.google.maps.TravelMode.WALKING,
            },
            (response, status) => {
                console.log('DistanceMatrix status:', status)
                if (status === 'OK') {
                    const newDistances = {}
                    let filteredActivities = []

                    response.rows[0].elements.forEach((el, idx) => {
                        const activity = activities[idx]
                        newDistances[activity.id] = el.distance?.text || ''
                        console.log(`Distance vers ${activity.title}:`, el.distance?.text)

                        // 🔹 Filtrage à moins de 50 km
                        if (el.distance?.value <= 5000) {
                            filteredActivities.push(activity)
                        }
                    })

                    // 🔹 Limiter à 3 activités pour le dashboard
                    filteredActivities = filteredActivities.slice(0, 3)

                    setDistances(newDistances)
                    setNearbyActivities(filteredActivities)
                } else {
                    console.error('Erreur DistanceMatrix:', status)
                }
                setLoadingDistances(false)
            }
        )
    }, [googleLoaded, userLocation, activities])

    return (
        <Box sx={{ px: 3, mb: 3 }}>
            <Card sx={{ bgcolor: 'white', borderRadius: 3 }}>
                <CardContent sx={{ p: 2.5 }}>
                    <Typography variant="h6" sx={{ color: '#3454D1', fontWeight: 600, mb: 2 }}>
                        Activités autour de toi
                    </Typography>

                    {loadingDistances ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress sx={{ color: '#3454D1' }} />
                        </Box>
                    ) : nearbyActivities.length === 0 ? (
                        <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', py: 2 }}>
                            Aucune activité à proximité pour le moment
                        </Typography>
                    ) : (
                        nearbyActivities.map((activity, index) => {
                            const distance = distances[activity.id] || ''
                            return (
                                <Box
                                    key={activity.id}
                                    onClick={() => navigate(`/user/activity/${activity.id}`)}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: index < nearbyActivities.length - 1 ? 2 : 0,
                                        cursor: 'pointer',
                                        '&:hover': { opacity: 0.7 },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        {activity.category && (
                                            <Box
                                                sx={{
                                                    width: 24,
                                                    height: 24,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                {React.createElement(getIconComponent(activity.category.iconName), {
                                                    sx: { fontSize: 24, color: '#3454D1' },
                                                })}
                                            </Box>
                                        )}
                                        <Box>
                                            <Typography sx={{ fontWeight: 600, color: '#1a1a1a' }}>{activity.title}</Typography>
                                            <Typography variant="caption" sx={{ color: '#666' }}>
                                                {activity.address?.city} {distance}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <MuiIcons.Schedule sx={{ color: '#666', fontSize: 18 }} />
                                        <Typography sx={{ color: '#1a1a1a', fontWeight: 500 }}>{formatTime(activity.date)}</Typography>
                                    </Box>
                                </Box>
                            )
                        })
                    )}

                    <Button
                        fullWidth
                        endIcon={<MuiIcons.ArrowForward />}
                        onClick={() => navigate('/user/search-activity')}
                        sx={{
                            mt: 2,
                            color: '#3454D1',
                            textTransform: 'none',
                            fontWeight: 600,
                            justifyContent: 'flex-end',
                        }}
                    >
                        Plus d'activités
                    </Button>
                </CardContent>
            </Card>
        </Box>
    )
}
