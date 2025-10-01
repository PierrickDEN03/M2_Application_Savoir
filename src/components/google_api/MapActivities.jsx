// FILE: src/components/google_api/MapActivities.jsx
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { verifyAddressWithId } from './verifyAddressWithGoogle.js'
import ActivityItem from './ActivityItem'
import { fetchActivitiesFromDB } from '../../services/activitiesService.js'
import { fetchCategoryById } from '../../services/categoriesService.js'
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

    // Chargement des activités
    async function loadActivities() {
        try {
            const docs = await fetchActivitiesFromDB()
            const verified = []

            for (const doc of docs) {
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
        }
    }

    useEffect(() => {
        if (!isLoaded) return
        loadActivities()
    }, [isLoaded])

    // Appliquer les filtres
    useEffect(() => {
        let filtered = [...activities]

        // Filtre par localisation
        if (filters.location) {
            const searchTerm = filters.location.toLowerCase()
            filtered = filtered.filter((activity) => {
                const city = activity.address?.city?.toLowerCase() || ''
                const fullAddress = activity.address?.full?.toLowerCase() || ''
                return city.includes(searchTerm) || fullAddress.includes(searchTerm)
            })
        }

        // Filtre par horaire
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

        // Filtre par catégories
        if (filters.categories.length > 0) {
            filtered = filtered.filter((activity) => filters.categories.includes(activity.categoryId))
        }

        setFilteredActivities(filtered)
    }, [filters, activities])

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters)
    }

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

    if (loadError) return <p>Erreur de chargement de Google Maps</p>
    if (!isLoaded) return <p>Chargement de la carte...</p>

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
