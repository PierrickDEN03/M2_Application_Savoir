import React, { useState, useContext } from 'react'
import { Container, TextField, Button, Typography, Snackbar, Alert, Box } from '@mui/material'
import { UserContext } from '../context/userContext'

export default function SignInMagic() {
    const { sendMagicLink } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [isSending, setIsSending] = useState(false) // bloque les envois multiples

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    async function handleSend(e) {
        e.preventDefault()

        if (isSending) {
            setStatus({ open: true, severity: 'warning', message: 'Patiente un peu avant de renvoyer un lien' })
            return
        }

        if (!email.trim()) {
            setStatus({ open: true, severity: 'error', message: 'L’email est requis' })
            return
        }

        if (!validateEmail(email)) {
            setStatus({ open: true, severity: 'error', message: 'L’email n’est pas valide' })
            return
        }

        try {
            setIsSending(true)
            const result = await sendMagicLink(email)

            if (result === 'not_registered') {
                setStatus({ open: true, severity: 'error', message: 'Email non enregistré' })
            } else if (result === 'too_soon') {
                setStatus({ open: true, severity: 'warning', message: 'Lien déjà envoyé récemment, vérifie ta boîte mail' })
            } else {
                setStatus({ open: true, severity: 'success', message: 'Lien envoyé — vérifie ta boîte mail' })
            }
        } catch (err) {
            console.error(err)
            setStatus({ open: true, severity: 'error', message: 'Erreur serveur, réessaie plus tard' })
        } finally {
            setTimeout(() => setIsSending(false), 5000) // 5 secondes avant un nouvel envoi
        }
    }

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Connexion sans mot de passe
                </Typography>
                <Box component="form" sx={{ mt: 3, width: '100%' }} onSubmit={handleSend}>
                    <TextField
                        label="Adresse email"
                        type="email"
                        fullWidth
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" color="secondary" fullWidth disabled={isSending}>
                        Recevoir le lien magique
                    </Button>
                </Box>
            </Box>

            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}
