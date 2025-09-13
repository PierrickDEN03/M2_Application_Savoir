import React from 'react'
import { Container, TextField, Button, Box, Typography, Stack } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { UserContext } from '../context/userContext'
import { useNavigate, Link } from 'react-router-dom'

export default function SignUp() {
    const navigate = useNavigate()
    const { signUp, currentUser } = useContext(UserContext)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmationPwd, setConfirmationPwd] = useState('')
    const [validation, setValidation] = useState('')

    useEffect(() => {
        if (currentUser) {
            navigate('/user/dashboard')
        }
    }, [currentUser, navigate])

    async function handleForm(e) {
        e.preventDefault()
        if (password !== confirmationPwd) {
            setValidation('Les mots de passe ne coincident pas')
            return
        }
        if (password.length < 6) {
            setValidation('Le mot de passe doit contenir au moins 6 caractères')
        }
        try {
            await signUp(email, password)
            setValidation('')
            navigate('/user/dashboard')
        } catch (err) {
            if (err.code === 'auth/invalid-email') {
                setValidation("Ce format d'email est invalide")
                return
            }
            if (err.code === 'auth/email-already-in-use') {
                setValidation('Cet email est déjà occupé par un autre utilisateur')
                return
            }
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
                    Inscription
                </Typography>

                <Stack spacing={2} sx={{ mt: 3, width: '100%' }}>
                    <TextField label="Adresse email" type="email" fullWidth required onChange={(e) => setEmail(e.target.value)} />
                    <TextField label="Mot de passe" type="password" fullWidth required onChange={(e) => setPassword(e.target.value)} />
                    <TextField
                        label="Confirmer le mot de passe"
                        type="password"
                        fullWidth
                        required
                        onChange={(e) => setConfirmationPwd(e.target.value)}
                    />
                    <Typography color="error" variant="body2">
                        {validation}
                    </Typography>
                    <Button type="submit" variant="contained" color="secondary" fullWidth onClick={handleForm}>
                        S’inscrire
                    </Button>
                </Stack>
            </Box>
            <Link to="/login/signIn">Vous possédez déjà un compte ? Connectez-vous ici</Link>
        </Container>
    )
}
