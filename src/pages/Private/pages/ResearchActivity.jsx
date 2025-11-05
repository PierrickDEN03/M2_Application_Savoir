import React, { useCallback, useEffect, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { Box, CircularProgress, Typography, Alert } from '@mui/material'
import * as MuiIcons from '@mui/icons-material'
import MapActivities from '../../../components/search_filter/MapActivities'
import ListActivities from '../../../components/search_filter/ListActivities'
import Filtre from '../../../components/search_filter/Filtre'
import useActivitiesFilter from '../../../components/search_filter/useActivitiesFilter'
import { fetchActivitiesFromDB } from '../../../services/activitiesService'
import { verifyAddressWithId } from '../../../components/google_api/verifyAddressWithGoogle'
import { auth } from '../../../firebase-config'

const libraries = ['places', 'geometry']

export default function ResearchActivity() {
    // 🔹 Charger Google Maps d'abord
    const { isLoaded: googleMapsLoaded, loadError: googleMapsError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        libraries,
    })

    const [activities, setActivities] = useState([])
    const [filters, setFilters] = useState({
        location: '',
        distance: null,
        startDate: null,
        endDate: null,
        categories: [],
        userPosition: null,
    })

    const [loadingActivities, setLoadingActivities] = useState(true)
    const [error, setError] = useState(null)
    const [viewMode, setViewMode] = useState('map')

    // 🔹 Charger les activités une fois Google Maps prêt
    useEffect(() => {
        if (!googleMapsLoaded) return

        const loadActivities = async () => {
            try {
                console.log('Fetching activities...')
                setLoadingActivities(true)
                setError(null)

                const docs = await fetchActivitiesFromDB()
                const now = new Date()
                const user = auth?.currentUser

                const filteredDocs = user
                    ? docs.filter((doc) => doc.createdBy !== user.uid && doc.userId !== user.uid && new Date(doc.date) > now)
                    : docs.filter((doc) => new Date(doc.date) > now)

                const verified = []
                for (const doc of filteredDocs) {
                    if (!doc.placeId) continue
                    try {
                        const pos = await verifyAddressWithId(doc.placeId)
                        if (!pos?.position) continue
                        verified.push({
                            ...doc,
                            position: pos.position,
                            address: pos.address,
                        })
                    } catch (e) {
                        console.warn('Impossible de géocoder', doc.title, e)
                    }
                }

                setActivities(verified)
            } catch (err) {
                console.error(err)
                setError('Impossible de charger les activités. Réessayez plus tard.')
            } finally {
                setLoadingActivities(false)
            }
        }

        loadActivities()
    }, [googleMapsLoaded])

    // 🔹 Appliquer les filtres
    const filteredActivities = useActivitiesFilter(activities, filters)

    // 🔹 Gestion des filtres
    const handleFilterChange = useCallback((newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }))
    }, [])

    // --- RENDER ---
    if (googleMapsError) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', p: 2 }}>
                <Alert severity="error" variant="filled">
                    Erreur de chargement de Google Maps
                </Alert>
            </Box>
        )
    }

    if (!googleMapsLoaded || loadingActivities) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    gap: 2,
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
                <Typography variant="body1" sx={{ color: '#3454D1', fontWeight: 500 }}>
                    Chargement des activités...
                </Typography>
            </Box>
        )
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
            <Filtre onFilterChange={handleFilterChange} viewMode={viewMode} />
            {/* --- VUE CARTE --- */}
            {viewMode === 'map' && <MapActivities activities={filteredActivities} />}

            {/* --- VUE LISTE --- */}
            {viewMode === 'list' && <ListActivities activities={filteredActivities} />}

            {/* --- TOGGLE CARTE/LISTE --- */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 30,
                    left: 20,
                    zIndex: 100,
                    display: 'flex',
                    gap: 2,
                }}
            >
                {/* Bouton Carte/Liste */}
                <Box
                    onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
                    sx={{
                        position: 'fixed',
                        bottom: 130,
                        left: '50%',
                        bgcolor: '#FFD166',
                        borderRadius: '50px',
                        transform: 'translateX(-50%)',
                        boxShadow: 4,
                        px: 2.5,
                        py: 1.2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                >
                    {viewMode === 'map' ? (
                        <>
                            <Typography sx={{ fontWeight: 600, color: '#000000', fontSize: 14, fontFamily: '"Nunito", sans-serif' }}>
                                Voir la liste
                            </Typography>
                            <MuiIcons.ViewList sx={{ fontSize: 20, color: '#000000' }} />
                        </>
                    ) : (
                        <>
                            <Typography sx={{ fontWeight: 600, color: '#000000', fontSize: 14, fontFamily: '"Nunito", sans-serif' }}>
                                Voir la carte
                            </Typography>
                            <MuiIcons.Map sx={{ fontSize: 20, color: '#000000' }} />
                        </>
                    )}
                </Box>
            </Box>

            {/* --- FILTRE (sur les deux vues) --- */}
            {error && (
                <Alert severity="error" sx={{ position: 'fixed', top: 20, right: 20, zIndex: 2000 }}>
                    {error}
                </Alert>
            )}
        </Box>
    )
}
