import { useEffect } from 'react'

export default function useLoadGooglePlaces() {
    useEffect(() => {
        if (window.google && window.google.maps) {
            console.log('Google Maps déjà chargé')
            return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&region=FR&language=fr`
        script.async = true
        script.onload = () => console.log('Google Maps chargé avec succès')
        script.onerror = () => console.error('Erreur lors du chargement de Google Maps')
        document.body.appendChild(script)

        return () => {
            document.body.removeChild(script)
            console.log('Script Google Maps retiré')
        }
    }, [])
}
