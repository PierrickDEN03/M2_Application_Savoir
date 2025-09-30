import React, { useEffect, useState } from 'react'
import { Marker, InfoWindow } from '@react-google-maps/api'
import { fetchUserById } from '../../services/userService.js'
import { formatActivityDate } from '../utils/formatDate.js'

export default function ActivityItem({ activity }) {
    const [open, setOpen] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        async function loadUser() {
            if (activity.userId) {
                const u = await fetchUserById(activity.userId)
                setUser(u)
            }
        }
        loadUser()
    }, [activity.userId])

    // Icône personnalisée
    const customIcon = {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.2l4.2 4.2-2.1 2.1-4.2-4.2c-1.2 2.4-.8 5.4 1.2 7.4 1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.1-2.1c.4-.4.4-1 0-1.4z"/>
      </svg>`
        )}`,
        scaledSize: new window.google.maps.Size(40, 40),
    }

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
                                src={
                                    user?.photoUrl || 'https://randomuser.me/api/portraits/women/44.jpg' // temporaire
                                }
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
