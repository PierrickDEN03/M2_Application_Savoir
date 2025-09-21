import React, { useEffect, useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Typography, CircularProgress } from '@mui/material'
import { auth } from '../firebase-config'
import { UserContext } from '../context/userContext'

export default function AuthCallback() {
    const navigate = useNavigate()
    const { completeSignInWithEmailLink, profileExists } = useContext(UserContext)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function run() {
            try {
                // Finalise la connexion en passant l’URL
                const result = await completeSignInWithEmailLink(window.location.href)

                const user = auth.currentUser || result.user
                if (!user) {
                    setError('Utilisateur non connecté après signIn')
                    return
                }

                // Vérifie si un profil existe déjà
                const exists = await profileExists(user.uid)
                if (exists) {
                    navigate('/user/dashboard')
                } else {
                    navigate('/register-profile', { state: { email: user.email } })
                }
            } catch (err) {
                console.error('Erreur AuthCallback:', err)
                if (err.message === 'email-required') {
                    setError('Impossible de retrouver ton email, recommence la connexion.')
                    //navigate('/login')
                } else {
                    setError('Lien invalide ou expiré, demande un nouveau lien de connexion.')
                    //navigate('/login')
                }
            }
        }

        run()
    }, [navigate, completeSignInWithEmailLink, profileExists])

    if (error) {
        return (
            <Container sx={{ mt: 8 }}>
                <Typography color="error">{error}</Typography>
            </Container>
        )
    }

    return (
        <Container sx={{ mt: 8, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Connexion en cours…</Typography>
        </Container>
    )
}
