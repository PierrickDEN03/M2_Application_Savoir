import { useEffect, useState } from 'react'

export default function useActivitiesFilter(activities, filters) {
    const [filtered, setFiltered] = useState([])

    useEffect(() => {
        if (!activities?.length) {
            setFiltered([])
            return
        }

        let base = [...activities]

        // --- Recherche textuelle
        if (filters.searchQuery && typeof filters.searchQuery === 'string') {
            const q = filters.searchQuery.toLowerCase()
            base = base.filter((a) => {
                const fields = [a.title, a.description, a?.address?.city, a?.address?.full, a?.address?.street, a?.address?.postalCode].map(
                    (s) => (s ? s.toLowerCase() : '')
                )

                return fields.some((f) => f.includes(q))
            })
        }

        // --- Recherche par lieu
        if (filters.location && typeof filters.location === 'string') {
            const term = filters.location.toLowerCase()
            base = base.filter((a) => {
                const city = a?.address?.city?.toLowerCase() || ''
                const full = a?.address?.full?.toLowerCase() || ''
                return city.includes(term) || full.includes(term)
            })
        }

        // --- Dates sélectionnées individuellement (prioritaire)
        if (Array.isArray(filters.selectedDates) && filters.selectedDates.length > 0) {
            base = base.filter((a) => {
                if (!a.date) return false

                const itemDate = new Date(a.date)
                itemDate.setHours(0, 0, 0, 0)
                const itemISO = itemDate.toISOString()

                return filters.selectedDates.some((sel) => {
                    const d = new Date(sel)
                    d.setHours(0, 0, 0, 0)
                    return d.toISOString() === itemISO
                })
            })
        } else if (filters.startDate && filters.endDate) {
            // --- Filtre par intervalle de dates (fallback)
            const start = new Date(filters.startDate)
            const end = new Date(filters.endDate)

            base = base.filter((a) => {
                if (!a.date) return false
                const d = new Date(a.date)
                return d >= start && d <= end
            })
        }

        // --- Catégories
        if (filters.categories?.length > 0) {
            base = base.filter((a) => filters.categories.includes(a.categoryId))
        }

        // --- Distance géographique
        const applyDistance = async () => {
            if (!filters.distance) {
                setFiltered(base)
                return
            }

            // Position utilisateur déjà connue
            if (filters.userPosition && window.google?.maps?.geometry && base.some((a) => a.position)) {
                const userPos = new window.google.maps.LatLng(filters.userPosition.lat, filters.userPosition.lng)

                const nearby = base.filter((a) => {
                    if (!a.position) return false
                    const actPos = new window.google.maps.LatLng(a.position.lat, a.position.lng)
                    const meters = window.google.maps.geometry.spherical.computeDistanceBetween(userPos, actPos)
                    return meters / 1000 <= filters.distance
                })

                setFiltered(nearby)
                return
            }

            // Sinon tentative de géolocalisation
            if (window.google?.maps?.geometry && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const userPos = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)

                        const nearby = base.filter((a) => {
                            if (!a.position) return false
                            const actPos = new window.google.maps.LatLng(a.position.lat, a.position.lng)
                            const meters = window.google.maps.geometry.spherical.computeDistanceBetween(userPos, actPos)
                            return meters / 1000 <= filters.distance
                        })

                        setFiltered(nearby)
                    },
                    () => {
                        setFiltered(base)
                    },
                    { enableHighAccuracy: true, timeout: 10000 }
                )
            } else {
                setFiltered(base)
            }
        }

        applyDistance()
    }, [activities, filters])

    return filtered
}
