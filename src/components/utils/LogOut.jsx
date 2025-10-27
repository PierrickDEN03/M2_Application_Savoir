import React, { useContext } from 'react'
import { Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { Logout } from '@mui/icons-material'
import { UserContext } from '../../context/userContext'

export default function LogOut() {
    const navigate = useNavigate()
    const { signOut } = useContext(UserContext)

    async function handleLogout() {
        try {
            await signOut()
            navigate('/')
        } catch {
            alert('Pour certaines raisons, vous ne pouvez pas vous déconnecter. Veuillez vérifier votre connexion Internet et réessayer.')
        }
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
                variant="outlined"
                startIcon={<Logout />} // icône de déconnexion
                onClick={handleLogout}
                sx={{
                    borderColor: '#D32F2F',
                    color: '#D32F2F',
                    borderRadius: 3,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                        borderColor: '#D32F2F',
                        bgcolor: 'rgba(211, 47, 47, 0.05)',
                    },
                }}
            >
                Déconnexion
            </Button>
        </Box>
    )
}
