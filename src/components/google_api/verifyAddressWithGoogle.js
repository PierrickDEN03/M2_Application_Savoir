// FILE: src/utils/verifyAddressWithGoogle.js
export const verifyAddressWithGoogle = (formData) => {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error('Google Maps API non chargée'))
            return
        }

        const query = formData.address?.full?.trim()
        if (!query) {
            reject(new Error('Adresse vide'))
            return
        }

        const service = new window.google.maps.places.PlacesService(document.createElement('div'))
        service.findPlaceFromQuery(
            {
                query,
                fields: ['formatted_address', 'geometry', 'place_id'],
            },
            (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                    resolve(results[0]) // ✅ correspond toujours à l’adresse choisie
                } else {
                    reject(new Error('Adresse introuvable via Google Places'))
                }
            }
        )
    })
}

export const verifyAddressWithId = (placeId) => {
    return new Promise((resolve, reject) => {
        if (!window.google) {
            reject(new Error('Google Maps API non chargée'))
            return
        }

        if (!placeId) {
            reject(new Error('placeId vide'))
            return
        }

        const service = new window.google.maps.places.PlacesService(document.createElement('div'))

        service.getDetails(
            {
                placeId,
                fields: ['name', 'formatted_address', 'geometry', 'place_id', 'address_components'],
            },
            (result, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && result?.geometry?.location) {
                    // ✅ Extraire la ville
                    const cityComponent = result.address_components?.find(
                        (c) => c.types.includes('locality') || c.types.includes('administrative_area_level_2')
                    )

                    resolve({
                        placeId: result.place_id,
                        address: {
                            full: result.formatted_address,
                            city: cityComponent?.long_name || '',
                            name: result.name,
                        },
                        position: {
                            lat: result.geometry.location.lat(),
                            lng: result.geometry.location.lng(),
                        },
                    })
                } else {
                    reject(new Error(`Impossible de récupérer le lieu pour ${placeId}`))
                }
            }
        )
    })
}
