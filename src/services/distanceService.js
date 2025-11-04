// FILE: src/services/distanceService.js

/**
 * Calcule la distance entre la position de l'utilisateur et un lieu via Google Distance Matrix API
 * @param {string} placeId - ID du lieu Google Places
 * @param {function} onDistanceUpdate - Callback pour mettre à jour la distance (reçoit la distance en string)
 * @returns {void}
 *
 * @example
 * calculateDistance('EilBbGwuIGRlIGxhIFTDqnRlIGQnT3I...', (distance) => {
 *   console.log(distance) // ex: "1.3 km"
 * })
 */
export const calculateDistance = async (placeId, onDistanceUpdate) => {
    if (!navigator.geolocation || !placeId) return

    try {
        // Vérifier que Google Maps est chargé
        if (!window.google?.maps) {
            //console.warn('Google Maps API non chargée')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                const userPos = new window.google.maps.LatLng(latitude, longitude)

                const service = new window.google.maps.DistanceMatrixService()
                service.getDistanceMatrix(
                    {
                        origins: [userPos],
                        destinations: [{ placeId: placeId }],
                        travelMode: window.google.maps.TravelMode.WALKING,
                    },
                    (response, status) => {
                        if (status === 'OK' && response.rows[0].elements[0].distance) {
                            const distance = response.rows[0].elements[0].distance.text
                            onDistanceUpdate(distance)
                        }
                    }
                )
            },
            (error) => console.error('Erreur géolocalisation:', error)
        )
    } catch (error) {
        console.error('Erreur calcul distance:', error)
    }
}
