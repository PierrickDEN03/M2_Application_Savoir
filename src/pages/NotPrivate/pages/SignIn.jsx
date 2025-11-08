import React, { useState, useContext } from 'react'
import { TextField, Button, Typography, Snackbar, Alert, Box } from '@mui/material'
import { UserContext } from '../../../context/userContext'

export default function SignInMagic() {
    const { sendMagicLink } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState({ open: false, severity: 'info', message: '' })
    const [isSending, setIsSending] = useState(false)

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
            setTimeout(() => setIsSending(false), 5000)
        }
    }

    return (
        <Box
            sx={{
                height: '100vh',
                bgcolor: '#e4eff6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',

                    width: '100%',
                    px: 3,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Box
                        component="img"
                        src="/assets/Logo.svg"
                        alt="Logo"
                        sx={{
                            width: { xs: '200px', sm: '280px' },
                            height: 'auto',
                        }}
                    />
                </Box>

                <Typography
                    sx={{
                        color: '#ED6A5A',
                        fontSize: '1rem',
                        mb: { xs: 10, sm: 28 },
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 400,
                    }}
                >
                    Là où chaque rencontre résonne
                </Typography>
                {/* Titre */}
                <Box sx={{ width: '100%', mb: 3, ml: 5, display: 'flex', justifyContent: 'left' }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 'bold',
                            color: '#3454D1',
                            fontFamily: '"All Round Gothic Semi", sans-serif',
                        }}
                    >
                        Se connecter
                    </Typography>
                </Box>

                {/* Formulaire */}
                <Box
                    component="form"
                    onSubmit={handleSend}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <TextField
                        placeholder="e-mail"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            width: '320px',
                            mb: 8,
                            bgcolor: 'white',
                            borderRadius: '8px',
                            fontFamily: '"Nunito", sans-serif',
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        disabled={isSending}
                        sx={{
                            width: '270px',
                            bgcolor: '#ED6A5A',
                            color: '#fff',
                            borderRadius: '12px',
                            py: 1.5,
                            fontWeight: 'bold',
                            fontFamily: '"Nunito", sans-serif',
                            fontSize: '1rem',
                            textTransform: 'uppercase',
                            '&:hover': { bgcolor: '#B2DDF7', color: '#3454D1' },
                        }}
                    >
                        Se connecter →
                    </Button>
                </Box>
            </Box>

            {/* Snackbar */}
            <Snackbar open={status.open} autoHideDuration={5000} onClose={() => setStatus({ ...status, open: false })}>
                <Alert severity={status.severity} sx={{ width: '100%' }}>
                    {status.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
