import { useEffect, useState } from 'react'

export default function useActivitiesFilter(activities, filters) {
    const [filtered, setFiltered] = useState([])

    useEffect(() => {
        if (!activities?.length) {
            setFiltered([])
            return
        }

        let base = [...activities]

        // 🔹 FILTRE : recherche textuelle
        if (filters.searchQuery && typeof filters.searchQuery === 'string') {
            const query = filters.searchQuery.toLowerCase()
            base = base.filter((a) => {
                const title = a.title?.toLowerCase() || ''
                const description = a.description?.toLowerCase() || ''
                const city = a.address?.city?.toLowerCase() || ''
                const fullAddress = a.address?.full?.toLowerCase() || ''
                const street = a.address?.street?.toLowerCase() || ''
                const postalCode = a.address?.postalCode?.toLowerCase() || ''

                return (
                    title.includes(query) ||
                    description.includes(query) ||
                    city.includes(query) ||
                    fullAddress.includes(query) ||
                    street.includes(query) ||
                    postalCode.includes(query)
                )
            })
        }

        // 🔹 FILTRE : recherche par lieu (texte)
        if (filters.location && typeof filters.location === 'string') {
            const term = filters.location.toLowerCase()
            base = base.filter((a) => {
                const city = a.address?.city?.toLowerCase() || ''
                const full = a.address?.full?.toLowerCase() || ''
                return city.includes(term) || full.includes(term)
            })
        }

        // 🔹 FILTRE : intervalle de dates
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate)
            const end = new Date(filters.endDate)
            base = base.filter((a) => {
                if (!a.date) return false
                const d = new Date(a.date)
                return d >= start && d <= end
            })
        }

        // 🔹 FILTRE : catégories sélectionnées
        if (filters.categories?.length > 0) {
            base = base.filter((a) => filters.categories.includes(a.categoryId))
        }

        // 🔹 FILTRE : distance géographique
        const applyDistance = async () => {
            // aucun filtre de distance => on garde ce qu'on a
            if (!filters.distance) {
                setFiltered(base)
                return
            }

            // si on a une position utilisateur déjà connue dans filters
            if (filters.userPosition && window.google?.maps?.geometry && base.some((a) => a.position)) {
                const userPos = new window.google.maps.LatLng(filters.userPosition.lat, filters.userPosition.lng)

                const nearby = base.filter((a) => {
                    if (!a.position) return false
                    const actPos = new window.google.maps.LatLng(a.position.lat, a.position.lng)
                    const meters = window.google.maps.geometry.spherical.computeDistanceBetween(userPos, actPos)
                    const km = meters / 1000
                    return km <= filters.distance
                })
                setFiltered(nearby)
                return
            }

            // sinon, tenter de géolocaliser une fois (pas à chaque render)
            if (window.google?.maps?.geometry && navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const userPos = new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
                        const nearby = base.filter((a) => {
                            if (!a.position) return false
                            const actPos = new window.google.maps.LatLng(a.position.lat, a.position.lng)
                            const meters = window.google.maps.geometry.spherical.computeDistanceBetween(userPos, actPos)
                            const km = meters / 1000
                            return km <= filters.distance
                        })
                        setFiltered(nearby)
                    },
                    (err) => {
                        console.warn('Geolocation failed, fallback to base:', err)
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
