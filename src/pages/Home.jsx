import React from 'react'
import { Button, Stack } from '@mui/material'
import { Link } from 'react-router-dom'

function Home() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Bienvenue sur notre application</h1>
            <p>Veuillez appuyer sur un des liens suivants :</p>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                <Button component={Link} to="/login/signIn" variant="contained" color="primary">
                    Connexion
                </Button>

                <Button component={Link} to="/login/signUp" variant="outlined" color="secondary">
                    Inscription
                </Button>
            </Stack>
        </div>
    )
}

export default Home
