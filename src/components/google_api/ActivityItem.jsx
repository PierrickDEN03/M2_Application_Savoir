import React, { useEffect, useState } from 'react'
import { Marker, InfoWindow } from '@react-google-maps/api'
import { fetchUserById } from '../../services/userService.js'
import { fetchCategoryById } from '../../services/categoriesService.js'
import { formatActivityDate } from '../utils/formatDate.js'
import * as MuiIcons from '@mui/icons-material'
import ReactDOMServer from 'react-dom/server'

export default function ActivityItem({ activity }) {
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

        // On clone le composant pour forcer le fill en blanc
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
            {open && (
                <InfoWindow position={activity.position} onCloseClick={() => setOpen(false)}>
                    <div
                        style={{
                            background: '#fefce8',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            fontFamily: 'sans-serif',
                            maxWidth: '220px',
                        }}
                    >
                        <h4 style={{ margin: '0 0 6px', fontWeight: '600' }}>{activity.title}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                                src={user?.photoUrl || 'https://randomuser.me/api/portraits/women/44.jpg'}
                                alt={user?.firstName || 'User'}
                                style={{
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                }}
                            />
                            <div>
                                <div style={{ fontWeight: '500' }}>{user?.firstName || 'Utilisateur'}</div>
                                <div style={{ fontSize: '0.85rem', color: '#444' }}>{formatActivityDate(activity.date)}</div>
                            </div>
                        </div>
                    </div>
                </InfoWindow>
            )}
        </>
    )
}
