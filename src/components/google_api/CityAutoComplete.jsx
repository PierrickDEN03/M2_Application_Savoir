import React, { useState, useEffect, useMemo } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import useLoadGooglePlaces from './useLoadGooglePlaces'

export default function CityAutocomplete({ value, onCitySelected, sx }) {
    const [inputValue, setInputValue] = useState('')
    const [options, setOptions] = useState([])
    const loaded = useLoadGooglePlaces()

    const autocompleteService = useMemo(() => {
        if (loaded && window.google) {
            return new window.google.maps.places.AutocompleteService()
        }
        return null
    }, [loaded])

    // 🔹 Suggestions Google
    useEffect(() => {
        if (!autocompleteService || !inputValue) {
            setOptions([])
            return
        }

        const fetchSuggestions = async () => {
            autocompleteService.getPlacePredictions(
                {
                    input: inputValue,
                    types: ['(cities)'],
                    componentRestrictions: { country: 'fr' },
                },
                (predictions, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setOptions(
                            predictions.map((p) => ({
                                label: p.description,
                                placeId: p.place_id,
                            }))
                        )
                    } else {
                        setOptions([])
                    }
                }
            )
        }

        const debounce = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(debounce)
    }, [inputValue, autocompleteService])

    // 🔹 Sélection
    const handleSelect = (event, newValue) => {
        if (!newValue) return

        // Si l'utilisateur choisit une ville de la liste
        if (typeof newValue === 'object' && newValue.placeId) {
            const placesService = new window.google.maps.places.PlacesService(document.createElement('div'))
            placesService.getDetails({ placeId: newValue.placeId }, (place, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK) {
                    const city = place.address_components.find((c) => c.types.includes('locality'))?.long_name || place.name
                    // 🔹 On ne garde QUE le nom de la ville
                    onCitySelected?.(city)
                }
            })
        }
        // Si l'utilisateur tape manuellement
        else if (typeof newValue === 'string') {
            onCitySelected?.(newValue)
        }
    }

    return (
        <Autocomplete
            freeSolo
            options={options}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || '')}
            value={value || ''}
            onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
            onChange={handleSelect}
            noOptionsText="Aucune ville trouvée"
            loadingText="Chargement..."
            sx={{ width: '100%', ...sx }}
            slotProps={{
                popper: {
                    sx: { zIndex: 2000000 },
                },
                paper: {
                    sx: {
                        borderRadius: 2,
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
                    },
                },
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    placeholder="Ex: Lyon, Marseille..."
                    InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                            <>
                                <MuiIcons.Search sx={{ mr: 1, color: '#999' }} />
                                {params.InputProps.startAdornment}
                            </>
                        ),
                    }}
                />
            )}
        />
    )
}
