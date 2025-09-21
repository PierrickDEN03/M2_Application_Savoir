import React, { useContext } from 'react'
import { Button, Box } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../context/userContext.js'

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
            <Button variant="contained" color="error" onClick={handleLogout}>
                Déconnexion
            </Button>
        </Box>
    )
}
