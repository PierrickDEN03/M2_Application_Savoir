// MapActivities.jsx — version corrigée avec selectedIndexRef
import React, { useCallback, useState, useRef, useEffect } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { Box, Fade } from '@mui/material'
import ActivityCard from '../utils/ActivityCard'
import { fetchCategoryById } from '../../services/categoriesService.js'
import * as MuiIcons from '@mui/icons-material'
import ReactDOMServer from 'react-dom/server'

const containerStyle = { width: '100%', height: '100vh' }
const center = { lat: 45.75, lng: 4.85 }

export default function MapActivities({ activities = [] }) {
    const [map, setMap] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [categories, setCategories] = useState({})
    const [, forceUpdate] = useState({})
    const scrollContainerRef = useRef(null)
    const isScrollingProgrammatically = useRef(false)
    const selectedIndexRef = useRef(null)

    const onLoad = useCallback((mapInstance) => setMap(mapInstance), [])
    const onUnmount = useCallback(() => setMap(null), [])

    /** Chargement des catégories **/
    useEffect(() => {
        async function loadCategories() {
            const cats = {}
            for (const activity of activities) {
                if (activity.categoryId && !cats[activity.categoryId]) {
                    const cat = await fetchCategoryById(activity.categoryId)
                    if (cat) cats[activity.categoryId] = cat
                }
            }
            setCategories(cats)
        }
        if (activities.length > 0) loadCategories()
    }, [activities])

    /** Sélection de la première activité par défaut **/
    useEffect(() => {
        if (activities.length > 0 && selectedIndex === null) {
            setSelectedIndex(0)
            selectedIndexRef.current = 0
        }
    }, [activities, selectedIndex])

    /** Synchroniser le ref avec le state **/
    useEffect(() => {
        selectedIndexRef.current = selectedIndex
    }, [selectedIndex])

    /** Fonction pour scroller vers une activité et centrer la map **/
    const scrollToActivity = useCallback(
        (index) => {
            if (!scrollContainerRef.current || !activities[index]) return

            const container = scrollContainerRef.current
            const card = container.children[index]
            if (!card) return

            // Scroll vers la carte (instant pour éviter les événements intermédiaires)
            container.scrollTo({
                left: card.offsetLeft,
                behavior: 'auto', // Changé de 'smooth' à 'auto'
            })

            // Centrer la map
            if (map) {
                map.panTo(activities[index].position)
                map.setZoom(14)
            }

            // Réinitialiser le flag immédiatement car le scroll est instantané
            setTimeout(() => {
                isScrollingProgrammatically.current = false
            }, 100)
        },
        [activities, map]
    )

    /** Détection du scroll manuel pour changer la carte sélectionnée **/
    const handleScroll = useCallback(() => {
        // Ignorer si on scrolle programmatiquement
        if (isScrollingProgrammatically.current) return

        if (!scrollContainerRef.current || activities.length === 0) return

        const container = scrollContainerRef.current
        const scrollLeft = container.scrollLeft
        const cardWidth = container.clientWidth
        const newIndex = Math.round(scrollLeft / cardWidth)

        if (newIndex !== selectedIndexRef.current && newIndex >= 0 && newIndex < activities.length) {
            selectedIndexRef.current = newIndex
            setSelectedIndex(newIndex)
            forceUpdate({}) // Force le re-render des markers

            // Centrer la map sur la nouvelle activité
            if (map && activities[newIndex]) {
                map.panTo(activities[newIndex].position)
                map.setZoom(14)
            }
        }
    }, [activities, map])

    /** Clic sur un marker **/
    const handleMarkerClick = useCallback(
        (index) => {
            console.log({ selectedIndex: index })
            // IMPORTANT : activer le flag et mettre à jour TOUT immédiatement
            isScrollingProgrammatically.current = true
            selectedIndexRef.current = index
            setSelectedIndex(index)

            // Scroll immédiatement
            scrollToActivity(index)
        },
        [scrollToActivity]
    )

    /** Fermer le carrousel **/
    const handleCloseCarousel = useCallback(() => {
        setSelectedIndex(null)
        selectedIndexRef.current = null
    }, [])

    /** Génération d'une icône personnalisée pour le marker **/
    const getCustomIcon = (activity, isSelected) => {
        const category = categories[activity.categoryId]
        if (!category) {
            const size = isSelected ? 50 : 40
            return {
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                        <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#3454D1"/>
                        ${
                            isSelected
                                ? `<circle cx="${size / 2}" cy="${size / 2}" r="${
                                      size / 2 - 3
                                  }" fill="none" stroke="white" stroke-width="2"/>`
                                : ''
                        }
                    </svg>
                `)}`,
                scaledSize: new window.google.maps.Size(size, size),
            }
        }

        const IconComponent = MuiIcons[category.iconName]
        if (!IconComponent) return null

        const size = isSelected ? 50 : 40
        const iconScale = isSelected ? 0.65 : 0.55
        const circleRadius = size / 2

        const IconWithWhiteFill = React.cloneElement(<IconComponent />, {
            style: { fill: 'white' },
        })

        const svgString = ReactDOMServer.renderToStaticMarkup(
            <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={circleRadius} cy={circleRadius} r={circleRadius} fill={category.color} />
                {isSelected && (
                    <circle cx={circleRadius} cy={circleRadius} r={circleRadius - 3} fill="none" stroke="white" strokeWidth="2" />
                )}
                <g transform={`translate(${size * 0.2},${size * 0.2}) scale(${iconScale})`}>{IconWithWhiteFill}</g>
            </svg>
        )

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
            scaledSize: new window.google.maps.Size(size, size),
        }
    }

    /** Cas sans activité **/
    if (activities.length === 0) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    color: '#666',
                    fontSize: '16px',
                    fontFamily: '"Nunito", sans-serif',
                }}
            >
                Aucune activité à afficher
            </Box>
        )
    }

    return (
        <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                }}
            >
                {activities.map((activity, index) => {
                    const icon = getCustomIcon(activity, selectedIndexRef.current === index)
                    return (
                        <Marker
                            key={activity.id}
                            position={activity.position}
                            title={activity.title}
                            icon={icon}
                            onClick={() => handleMarkerClick(index)}
                        />
                    )
                })}
            </GoogleMap>

            {/* Overlay clickable pour fermer le carrousel */}
            <Fade in={selectedIndex !== null}>
                <Box
                    onClick={handleCloseCarousel}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'transparent',
                        zIndex: 1400,
                        cursor: 'pointer',
                        pointerEvents: 'none',
                    }}
                />
            </Fade>

            {/* Carrousel */}
            {selectedIndex !== null && (
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 190,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1500,
                    }}
                >
                    <Box
                        ref={scrollContainerRef}
                        onScroll={handleScroll}
                        sx={{
                            display: 'flex',
                            gap: 2,
                            overflowX: 'auto',
                            overflowY: 'visible',
                            scrollSnapType: 'x mandatory',
                            width: 'calc(100vw - 32px)',
                            maxWidth: '400px',
                            borderRadius: 2,
                            '&::-webkit-scrollbar': { display: 'none' },
                        }}
                    >
                        {activities.map((activity, index) => (
                            <Box
                                key={activity.id}
                                sx={{
                                    scrollSnapAlign: 'center',
                                    flexShrink: 0,
                                    borderRadius: 2,
                                    width: '100%',
                                    overflow: 'visible',
                                    transform: selectedIndex === index ? 'scale(1.03)' : 'scale(0.95)',
                                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                    boxShadow: selectedIndex === index ? '0 12px 30px rgba(0, 0, 0, 0.45)' : 'none',
                                    border: selectedIndex === index ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(6px)',
                                }}
                            >
                                <ActivityCard activity={activity} />
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    )
}
