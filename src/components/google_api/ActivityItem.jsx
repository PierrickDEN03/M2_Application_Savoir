import React, { useEffect, useState } from 'react'
import { Marker } from '@react-google-maps/api'
import { Box, Slide } from '@mui/material'
import { fetchCategoryById } from '../../services/categoriesService.js'
import * as MuiIcons from '@mui/icons-material'
import ReactDOMServer from 'react-dom/server'
import ActivityCard from '../utils/ActivityCard'

export default function ActivityItem({ activity }) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState(null)

    useEffect(() => {
        async function loadCategory() {
            if (activity.categoryId) {
                const c = await fetchCategoryById(activity.categoryId)
                setCategory(c)
            }
        }
        loadCategory()
    }, [activity.categoryId])

    const getCustomIcon = () => {
        if (!category) return null
        const IconComponent = MuiIcons[category.iconName]
        if (!IconComponent) return null

        const IconWithWhiteFill = React.cloneElement(<IconComponent />, { style: { fill: 'white' } })

        const svgString = ReactDOMServer.renderToStaticMarkup(
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="20" fill={category.color} />
                <g transform="translate(8,8) scale(0.55)">{IconWithWhiteFill}</g>
            </svg>
        )

        return {
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgString)}`,
            scaledSize: new window.google.maps.Size(40, 40),
        }
    }

    const customIcon = getCustomIcon()

    return (
        <>
            <Marker position={activity.position} title={activity.title} icon={customIcon} onClick={() => setOpen(true)} />

            {/* --- CARD EN BAS DE L'ÉCRAN --- */}
            <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                <Box
                    sx={{
                        position: 'fixed',
                        bottom: 180,
                        left: 0,
                        right: 0,
                        zIndex: 1500,
                        bgcolor: 'transparent',
                        p: 2,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                    }}
                >
                    {/* ActivityCard */}
                    <Box sx={{ mt: 3 }}>
                        <ActivityCard activity={activity} />
                    </Box>
                </Box>
            </Slide>

            {/* --- OVERLAY --- */}
            {open && (
                <Box
                    onClick={() => setOpen(false)}
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        bgcolor: 'rgba(0,0,0,0.3)',
                        zIndex: 1400,
                    }}
                />
            )}
        </>
    )
}
