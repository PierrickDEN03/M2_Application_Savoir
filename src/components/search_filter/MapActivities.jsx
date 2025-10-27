import React, { useCallback, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { Box, Alert, CircularProgress, Typography } from '@mui/material'
import ActivityItem from '../google_api/ActivityItem'

const containerStyle = { width: '100%', height: '100vh' }
const center = { lat: 45.75, lng: 4.85 }
const libraries = ['places', 'geometry']

export default function MapActivities({ activities = [] }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const [map, setMap] = useState(null)

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

    if (loadError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Alert severity="error" variant="filled">
                    Erreur de chargement de Google Maps
                </Alert>
            </Box>
        )
    }

    if (!isLoaded) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: 2,
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
                <Typography variant="body1" sx={{ color: '#3454D1', fontWeight: 500 }}>
                    Chargement de la carte...
                </Typography>
            </Box>
        )
    }

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false, // (optionnel) enlève le bouton plein écran
                zoomControl: true, // (optionnel) garde ou enlève le zoom +
            }}
        >
            {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
            ))}
        </GoogleMap>
    )
}
