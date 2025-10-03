// FILE: src/components/google_api/MapActivities.jsx
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import { verifyAddressWithId } from './verifyAddressWithGoogle.js'
import ActivityItem from './ActivityItem'
import { fetchActivitiesFromDB } from '../../services/activitiesService.js'
import { fetchCategoryById } from '../../services/categoriesService.js'
import { auth } from '../../firebase-config'
import FiltreMap from './FiltreMap'

const containerStyle = {
    width: '100%',
    height: '100vh',
}

const center = {
    lat: 45.75,
    lng: 4.85,
}

const libraries = ['places']

export default function MapActivities() {
    const currentUser = auth.currentUser
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const [map, setMap] = useState(null)
    const [activities, setActivities] = useState([])
    const [filteredActivities, setFilteredActivities] = useState([])
    const [filters, setFilters] = useState({
        location: '',
        timeSlot: '',
        categories: [],
    })
    const [loadingActivities, setLoadingActivities] = useState(true)
    const [error, setError] = useState(null)

    // Chargement des activités
    async function loadActivities() {
        try {
            setLoadingActivities(true)
            setError(null)
            const docs = await fetchActivitiesFromDB()
            const now = new Date()

            const filteredDocs = currentUser
                ? docs.filter((doc) => doc.createdBy !== currentUser.uid && doc.userId !== currentUser.uid && new Date(doc.date) > now)
                : docs.filter((doc) => new Date(doc.date) > now)

            const verified = []

            for (const doc of filteredDocs) {
                try {
                    const pos = await verifyAddressWithId(doc.placeId)
                    const category = await fetchCategoryById(doc.categoryId)
                    verified.push({ ...doc, position: pos.position, category })
                } catch (e) {
                    console.warn(`Impossible de géocoder ${doc.title}`, e)
                }
            }

            setActivities(verified)
            setFilteredActivities(verified)
        } catch (err) {
            console.error('Erreur chargement des activités depuis Firestore', err)
            setError('Impossible de charger les activités. Veuillez réessayer plus tard.')
        } finally {
            setLoadingActivities(false)
        }
    }

    useEffect(() => {
        if (!isLoaded) return
        loadActivities()
    }, [isLoaded, currentUser])

    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...activities]

        if (filters.location) {
            const searchTerm = filters.location.toLowerCase()
            filtered = filtered.filter((activity) => {
                const city = activity.address?.city?.toLowerCase() || ''
                const fullAddress = activity.address?.full?.toLowerCase() || ''
                return city.includes(searchTerm) || fullAddress.includes(searchTerm)
            })
        }

        if (filters.timeSlot) {
            filtered = filtered.filter((activity) => {
                if (!activity.date) return false
                const date = new Date(activity.date)
                const hours = date.getHours()

                switch (filters.timeSlot) {
                    case 'morning':
                        return hours >= 6 && hours < 12
                    case 'afternoon':
                        return hours >= 12 && hours < 18
                    case 'evening':
                        return hours >= 18 && hours < 23
                    case 'night':
                        return hours >= 23 || hours < 6
                    default:
                        return true
                }
            })
        }

        if (filters.categories.length > 0) {
            filtered = filtered.filter((activity) => filters.categories.includes(activity.categoryId))
        }

        setFilteredActivities(filtered)
    }, [filters, activities])

    const handleFilterChange = (newFilters) => setFilters(newFilters)
    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

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
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: 2 }}>
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
