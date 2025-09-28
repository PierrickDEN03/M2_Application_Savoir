// FILE: src/hooks/useLoadGooglePlaces.js
import { useState, useEffect } from 'react'

export default function useLoadGooglePlaces() {
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
            console.log('Google Maps déjà chargé')
            setLoaded(true)
            return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&region=FR&language=fr`
        script.async = true
        script.onload = () => {
            console.log('Google Maps chargé avec succès')
            setLoaded(true)
        }
        script.onerror = () => console.error('Erreur lors du chargement de Google Maps')
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
            console.log('Script Google Maps retiré')
        }
    }, [])

    return loaded
}
