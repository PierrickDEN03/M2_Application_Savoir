import React from 'react'
import { Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase-config'

export default function LogOut() {
    const navigate = useNavigate()

    async function handleLogout() {
        try {
            await signOut(auth)
            navigate('/')
        } catch {
            alert('Pour certaines raisons, vous ne pouvez pas vous déconnecter. Veuillez vérifier votre connexion Internet et réessayer')
        }
    }

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button variant="contained" color="error" onClick={handleLogout}>
                Déconnexion
            </Button>
        </Box>
    )
}
