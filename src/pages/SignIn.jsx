import React from 'react'
import { Container, TextField, Button, Box, Typography, Stack } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../context/userContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignUp() {
    const navigate = useNavigate()
    const { signIn, currentUser } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [validation, setValidation] = useState('')

    useEffect(() => {
        if (currentUser) {
            navigate('/user/dashboard')
        }
    }, [currentUser, navigate])

    async function handleForm(e) {
        e.preventDefault()
        try {
            await signIn(email, password)
            setValidation('')
            navigate('/user/dashboard')
        } catch (err) {
            setValidation('Email et/ou mot de passe invalide(s)')
        }
    }

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Connexion
                </Typography>

                <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
                    <TextField label="Adresse email" type="email" fullWidth required onChange={(e) => setEmail(e.target.value)} />
                    <TextField label="Mot de passe" type="password" fullWidth required onChange={(e) => setPassword(e.target.value)} />

                    <Typography color="error" variant="body2">
                        {validation}
                    </Typography>
                    <Button type="submit" variant="contained" color="secondary" fullWidth onClick={handleForm}>
                        Se connecter
                    </Button>
                    <Link to="/login/signUp">Pas encore de compte ? Inscrivez-vous !</Link>
                </Stack>
            </Box>
        </Container>
    )
}
