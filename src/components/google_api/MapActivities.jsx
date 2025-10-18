import React, { useCallback, useEffect, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { verifyAddressWithId } from './verifyAddressWithGoogle'
import ActivityItem from './ActivityItem'
import { fetchActivitiesFromDB } from '../../services/activitiesService'
import FiltreMap from '../search_filter/FiltreMap'
import useActivitiesFilter from '../search_filter/useActivitiesFilter'
import { auth } from '../../firebase-config'

// --- Map style ---
const containerStyle = { width: '100%', height: '100vh' }
const center = { lat: 45.75, lng: 4.85 }
const libraries = ['places', 'geometry']

export default function MapActivities() {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const [map, setMap] = useState(null)
    const [activities, setActivities] = useState([])
    const [filters, setFilters] = useState({
        location: '',
        distance: null,
        startDate: null,
        endDate: null,
        categories: [],
        userPosition: null,
        date: null,
    })

    const [loadingActivities, setLoadingActivities] = useState(true)
    const [error, setError] = useState(null)

    // 🔹 Fonction de chargement — PAS de dépendances dynamiques
    const loadActivities = async (user) => {
        try {
            console.log('Fetching activities...')
            setLoadingActivities(true)
            setError(null)

            const docs = await fetchActivitiesFromDB()
            const now = new Date()

            const filteredDocs = user
                ? docs.filter((doc) => doc.createdBy !== user.uid && doc.userId !== user.uid && new Date(doc.date) > now)
                : docs.filter((doc) => new Date(doc.date) > now)

            const verified = []
            for (const doc of filteredDocs) {
                if (!doc.placeId) continue
                try {
                    const pos = await verifyAddressWithId(doc.placeId)
                    if (!pos?.position) continue
                    verified.push({
                        ...doc,
                        position: pos.position,
                        address: pos.address,
                    })
                } catch (e) {
                    console.warn('Impossible de géocoder', doc.title, e)
                }
            }

            setActivities(verified)
        } catch (err) {
            console.error(err)
            setError('Impossible de charger les activités. Réessayez plus tard.')
        } finally {
            setLoadingActivities(false)
        }
    }

    // 🔹 Chargement initial (une seule fois)
    useEffect(() => {
        if (!isLoaded) return
        const user = auth?.currentUser || null
        loadActivities(user)
    }, [isLoaded])

    // 🔹 Application des filtres
    const filteredActivities = useActivitiesFilter(activities, filters)

    // 🔹 Gestion des filtres enfants
    const handleFilterChange = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }))
    }, [])

    // 🔹 Gestion de la carte
    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

    // --- RENDER ---
    if (loadError)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Alert severity="error" variant="filled">
                    Erreur de chargement de Google Maps
                </Alert>
            </Box>
        )

    if (!isLoaded || loadingActivities)
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
                    Chargement des activités...
                </Typography>
            </Box>
        )

    return (
        <>
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad} onUnmount={onUnmount}>
                {filteredActivities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </GoogleMap>

            <FiltreMap onFilterChange={handleFilterChange} />
        </>
    )
}
