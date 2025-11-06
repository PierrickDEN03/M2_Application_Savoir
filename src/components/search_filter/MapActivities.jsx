// MapActivities.jsx — version corrigée
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
    const scrollContainerRef = useRef(null)

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
        }
    }, [activities, selectedIndex])

    /** Synchronisation : clic sur un marker => scroll vers la carte correspondante **/
    useEffect(() => {
        if (selectedIndex !== null && scrollContainerRef.current && activities.length > 0) {
            const container = scrollContainerRef.current
            const card = container.children[selectedIndex]
            if (!card) return

            container.scrollTo({
                left: card.offsetLeft,
                behavior: 'smooth',
            })

            // Centrer la map sur la position de l’activité sélectionnée
            if (map && activities[selectedIndex]) {
                map.panTo(activities[selectedIndex].position)
                map.setZoom(14)
            }
        }
    }, [selectedIndex, map, activities])

    /** Détection du scroll manuel pour changer la carte sélectionnée **/
    const handleScroll = () => {
        if (!scrollContainerRef.current || activities.length === 0) return
        const container = scrollContainerRef.current
        const scrollLeft = container.scrollLeft
        const cardWidth = container.clientWidth
        const newIndex = Math.round(scrollLeft / cardWidth)

        if (newIndex !== selectedIndex && newIndex >= 0 && newIndex < activities.length) {
            setSelectedIndex(newIndex)
        }
    }

    /** Clic sur un marker **/
    const handleMarkerClick = (index) => {
        setSelectedIndex(index)
    }

    /** Fermer le carrousel **/
    const handleCloseCarousel = () => {
        setSelectedIndex(null)
    }

    /** Génération d’une icône personnalisée pour le marker **/
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
                    const icon = getCustomIcon(activity, selectedIndex === index)
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
