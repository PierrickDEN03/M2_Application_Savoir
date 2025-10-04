import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getConversations } from '../../../services/messagesService'
import ContactItem from '../../../components/messagerie/ContactItem'
import { getAuth } from 'firebase/auth'
import { Box, Typography, CircularProgress, Button, Stack } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AvatarPlaceholder from '../../../components/utils/Avatar_Placeholder'

function Messagerie() {
    const [contacts, setContacts] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()
    const auth = getAuth()
    const currentUser = auth.currentUser

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                if (!currentUser) return
                const conversations = await getConversations(currentUser.uid)
                setContacts(conversations)
            } catch (error) {
                console.error('Erreur lors du chargement des conversations :', error)
            } finally {
                setLoading(false)
            }
        }

        fetchContacts()
    }, [currentUser])

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#B2DDF7',
                }}
            >
                <CircularProgress sx={{ color: '#3454D1' }} />
            </Box>
        )
    }

    return (
        <Box sx={{ backgroundColor: '#B2DDF7', minHeight: '100vh', p: 3 }}>
            <AvatarPlaceholder />
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                    color: '#3454D1',
                    fontWeight: 600,
                    textTransform: 'none',
                    mb: 2,
                }}
            >
                Retour
            </Button>

            <Typography
                variant="h4"
                sx={{
                    color: '#3454D1',
                    fontWeight: 'bold',
                    mb: 4,
                }}
            >
                Messagerie
            </Typography>

            {contacts.length === 0 ? (
                <Typography
                    sx={{
                        textAlign: 'center',
                        color: '#3454D1',
                        fontWeight: 500,
                        mt: 8,
                    }}
                >
                    Aucune conversation pour le moment.
                </Typography>
            ) : (
                <Stack spacing={2}>
                    {contacts.map((contactId) => (
                        <ContactItem key={contactId} contactId={contactId} onClick={() => navigate(`/user/send-message/${contactId}`)} />
                    ))}
                </Stack>
            )}
        </Box>
    )
}

export default Messagerie
