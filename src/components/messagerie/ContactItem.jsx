// FILE: src/components/ContactItem.jsx
import React, { useEffect, useState } from 'react'
import { Card, CardActionArea, Avatar, Typography, Box } from '@mui/material'
import { fetchUserById } from '../../services/userService'

function ContactItem({ contactId, onClick }) {
    const [contact, setContact] = useState(null)

    useEffect(() => {
        const loadContact = async () => {
            try {
                const user = await fetchUserById(contactId)
                if (user) {
                    setContact(user)
                } else {
                    setContact({
                        displayName: 'Utilisateur inconnu',
                        photoUrl: null,
                    })
                }
            } catch (error) {
                console.error('Erreur lors du chargement du contact :', error)
                setContact({
                    displayName: 'Erreur de chargement',
                    photoUrl: null,
                })
            }
        }

        loadContact()
    }, [contactId])

    return (
        <Card
            sx={{
                backgroundColor: '#ffffff',
                color: 'black',
                borderRadius: 3,
                boxShadow: 3,
            }}
        >
            <CardActionArea onClick={onClick} sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                    src={contact?.photoUrl && contact.photoUrl !== '/avatar_default.jpg' ? contact.photoUrl : '/avatar_default.jpg'}
                    alt={contact?.displayName || 'Contact'}
                    sx={{
                        width: 56,
                        height: 56,
                        border: '2px solid #F0E7D6',
                    }}
                />
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {contact?.displayName || 'Utilisateur'}
                    </Typography>
                </Box>
            </CardActionArea>
        </Card>
    )
}

export default ContactItem
