// FILE: src/components/AddressAutocomplete.jsx
import React, { useState } from 'react'
import { TextField, Autocomplete } from '@mui/material'

export default function AddressAutocomplete({ value, onAddressSelected, error, helperText }) {
    const [addressSuggestions, setAddressSuggestions] = useState([])

    // Cherche des suggestions d'adresses
    const fetchAddressSuggestions = (input) => {
        if (!window.google) return
        const service = new window.google.maps.places.AutocompleteService()
        service.getPlacePredictions({ input, types: ['address'], componentRestrictions: { country: 'fr' } }, (predictions, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                setAddressSuggestions(predictions)
            } else {
                setAddressSuggestions([])
            }
        })
    }

    // Récupère les détails exacts d'une adresse sélectionnée
    const fetchPlaceDetails = (placeId) => {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'))
        service.getDetails({ placeId }, (place, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                const components = place.address_components
                const street = components.find((c) => c.types.includes('route'))?.long_name || ''
                const streetNumber = components.find((c) => c.types.includes('street_number'))?.long_name || ''
                const city = components.find((c) => c.types.includes('locality'))?.long_name || ''
                const postalCode = components.find((c) => c.types.includes('postal_code'))?.long_name || ''

                onAddressSelected({
                    street: streetNumber ? `${streetNumber} ${street}` : street,
                    city,
                    postalCode,
                })
            }
        })
    }

    return (
        <Autocomplete
            freeSolo
            options={addressSuggestions.map((a) => ({ label: a.description, placeId: a.place_id }))}
            value={value}
            onInputChange={(e, newValue) => fetchAddressSuggestions(newValue)}
            onChange={(e, newValue) => newValue && fetchPlaceDetails(newValue.placeId)}
            renderInput={(params) => (
                <TextField {...params} label="Adresse complète" fullWidth required sx={{ mb: 2 }} error={!!error} helperText={helperText} />
            )}
        />
    )
}
