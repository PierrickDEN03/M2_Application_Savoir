import React, { useCallback, useEffect, useState } from 'react'
import { GoogleMap, useLoadScript } from '@react-google-maps/api'
import { verifyAddressWithId } from './verifyAddressWithGoogle.js'
import ActivityItem from './ActivityItem'
import { fetchActivitiesFromDB } from '../../services/activitiesService.js'

// Constantes globales (évite le rechargement de l'API Google Maps)
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

    // 🔽 Fonction asynchrone pour charger les activités
    async function loadActivities() {
        try {
            const docs = await fetchActivitiesFromDB()
            const verified = []

            for (const doc of docs) {
                try {
                    const pos = await verifyAddressWithId(doc.placeId)
                    verified.push({ ...doc, position: pos.position })
                } catch (e) {
                    console.warn(`Impossible de géocoder ${doc.title}`, e)
                }
            }

            setActivities(verified)
        } catch (err) {
            console.error('Erreur chargement des activités depuis Firestore', err)
        }
    }

    // Chargement des activités après que Google Maps soit prêt
    useEffect(() => {
        if (!isLoaded) return
        loadActivities()
    }, [isLoaded])

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

    if (loadError) return <p>Erreur de chargement de Google Maps</p>
    if (!isLoaded) return <p>Chargement de la carte...</p>

    return (
        <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={12} onLoad={onLoad} onUnmount={onUnmount}>
            {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
            ))}
        </GoogleMap>
    )
}
