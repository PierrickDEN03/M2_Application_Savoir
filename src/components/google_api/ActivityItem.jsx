// FILE: src/components/google_api/ActivityItem.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Marker, InfoWindow } from '@react-google-maps/api'
import { fetchUserById } from '../../services/userService.js'
import { fetchCategoryById } from '../../services/categoriesService.js'
import { formatActivityDate } from '../utils/formatDate.js'
import * as MuiIcons from '@mui/icons-material'
import ReactDOMServer from 'react-dom/server'

export default function ActivityItem({ activity }) {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [category, setCategory] = useState(null)

    useEffect(() => {
        async function loadUserAndCategory() {
            if (activity.userId) {
                const u = await fetchUserById(activity.userId)
                setUser(u)
            }
            if (activity.categoryId) {
                const c = await fetchCategoryById(activity.categoryId)
                setCategory(c)
            }
        }
        loadUserAndCategory()
    }, [activity.userId, activity.categoryId])

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

    const handleClick = () => {
        navigate(`/user/activity/${activity.id}`)
    }

    const customIcon = getCustomIcon()

    return (
        <>
            <Marker position={activity.position} title={activity.title} icon={customIcon} onClick={() => setOpen(true)} />
            {open && (
                <InfoWindow
                    position={activity.position}
                    onCloseClick={() => setOpen(false)}
                    options={{
                        pixelOffset: new window.google.maps.Size(0, -40),
                        disableAutoPan: false,
                    }}
                >
                    <div
                        onClick={handleClick}
                        style={{
                            background: '#fefce8',
                            padding: '12px',
                            borderRadius: '12px',
                            fontFamily: 'sans-serif',
                            maxWidth: '200px',
                            border: '2px dashed #cbd5e0',
                            cursor: 'pointer',
                            margin: 0,
                        }}
                    >
                        <h4
                            style={{
                                margin: '0 0 8px',
                                fontWeight: '600',
                                fontSize: '14px',
                                color: '#1a1a1a',
                            }}
                        >
                            {activity.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img
                                src={user?.photoUrl || '/avatar_default.jpg'}
                                alt={user?.firstName || 'User'}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#1a1a1a' }}>
                                    {user?.firstName || 'Utilisateur'}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>{formatActivityDate(activity.date)}</div>
                            </div>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}
