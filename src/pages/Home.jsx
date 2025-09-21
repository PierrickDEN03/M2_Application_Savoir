import React from 'react'
import { Container, Box, Typography, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function Home() {
    const navigate = useNavigate()

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    mt: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Bienvenue 👋
                </Typography>

                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                    Découvre notre application d’échanges entre étudiants. Connecte-toi avec ton email en 1 clic grâce au lien magique.
                </Typography>

                <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    sx={{ borderRadius: '2rem', px: 5, py: 1.5, fontSize: '1.1rem', textTransform: 'none', boxShadow: 3 }}
                    onClick={() => navigate('/login')}
                >
                    🚀 Commencer
                </Button>
            </Box>
        </Container>
    )
}
