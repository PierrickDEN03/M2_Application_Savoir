import React, { useCallback, useState } from 'react'
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api'

const containerStyle = {
    width: '100%',
    height: '100vh', // adapte à ton design mobile-first
}

// Coordonnées de Lyon comme point de départ
const center = {
    lat: 45.75,
    lng: 4.85,
}

export default function MapActivities({ activities = [] }) {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    })

    const [map, setMap] = useState(null)

    const onLoad = useCallback((mapInstance) => {
        setMap(mapInstance)
    }, [])

    const onUnmount = useCallback(() => {
        setMap(null)
    }, [])

    if (loadError) return <p>Erreur de chargement de Google Maps</p>
    if (!isLoaded) return <p>Chargement de la carte...</p>

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={12} // niveau de zoom pour Lyon
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {activities.map((activity, index) => (
                <Marker key={index} position={activity.position} title={activity.title} />
            ))}
        </GoogleMap>
    )
}
