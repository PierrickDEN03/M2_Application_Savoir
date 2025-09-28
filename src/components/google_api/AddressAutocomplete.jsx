// FILE: src/components/AddressAutocomplete.jsx
import React, { useState } from 'react'
import { TextField, Autocomplete } from '@mui/material'

export default function AddressAutocomplete({ value, onAddressSelected, error, helperText, sx }) {
    const [addressSuggestions, setAddressSuggestions] = useState([])

    const fetchAddressSuggestions = (input) => {
        if (!window.google) return
        const service = new window.google.maps.places.AutocompleteService()
        service.getPlacePredictions(
            {
                input,
                types: ['address'],
                componentRestrictions: { country: 'fr' },
            },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setAddressSuggestions(predictions)
                } else {
                    setAddressSuggestions([])
                }
            }
        )
    }

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
                    full: place.formatted_address, // ✅ stock l’adresse complète
                    placeId: place.place_id, // ✅ utile si tu veux vérifier avec placeId
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
            sx={{ width: '100%', ...sx }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Adresse complète"
                    required
                    error={!!error}
                    helperText={helperText}
                    sx={{
                        mb: 2,
                        bgcolor: 'white',
                        borderRadius: '8px',
                        '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                        width: '100%',
                    }}
                />
            )}
        />
    )
}
