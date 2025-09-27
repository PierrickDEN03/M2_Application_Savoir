import React, { useState } from 'react'
import { Container, TextField, Button, Box, Typography, Slider } from '@mui/material'
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import frLocale from 'date-fns/locale/fr'
import useLoadGooglePlaces from '../../../components/useLoadGooglePlaces'
import AddressAutocomplete from '../../../components/AddressAutocomplete'

export default function CreateActivityForm() {
    useLoadGooglePlaces()

    const [formData, setFormData] = useState({
        title: '',
        date: new Date(),
        address: '',
        photos: null,
        participants: 1,
        description: '',
    })

    const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value })

    const handlePhotoUpload = (e) => {
        setFormData({ ...formData, photos: e.target.files[0] })
    }

    const handleSubmit = () => {
        console.log('Form data:', formData)
        // TODO: push en BDD / Firebase
    }

    return (
        <Container maxWidth="xs" sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Ajouter une activité
            </Typography>

            {/* Titre activité */}
            <Box sx={{ mb: 3 }}>
                <Typography>Quelle activité proposes-tu ?</Typography>
                <TextField fullWidth placeholder="Apprendre la salsa" value={formData.title} onChange={handleChange('title')} />
            </Box>

            {/* Date et heure */}
            <Box sx={{ mb: 3 }}>
                <Typography>Quand es-tu disponible ?</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={frLocale}>
                    <DateTimePicker
                        label="Choisis une date"
                        value={formData.date}
                        onChange={(newValue) => setFormData({ ...formData, date: newValue })}
                        textField={(params) => <TextField fullWidth sx={{ mt: 2 }} {...params} />}
                    />
                </LocalizationProvider>
            </Box>

            {/* Adresse */}
            <Box sx={{ mb: 3 }}>
                <Typography>Où souhaites-tu rejoindre les participants ?</Typography>
                <AddressAutocomplete value={formData.address} onAddressSelected={(addr) => setFormData({ ...formData, address: addr })} />
            </Box>

            {/* Upload photo */}
            <Box sx={{ mb: 3 }}>
                <Typography>As-tu des photos à ajouter ?</Typography>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
            </Box>

            {/* Participants */}
            <Box sx={{ mb: 3 }}>
                <Typography>Combien de personnes peuvent participer ?</Typography>
                <Slider
                    value={formData.participants}
                    min={1}
                    max={20}
                    step={1}
                    onChange={(e, val) => setFormData({ ...formData, participants: val })}
                    sx={{ mt: 2 }}
                />
            </Box>

            {/* Description */}
            <Box sx={{ mb: 3 }}>
                <Typography>Décris ton activité en quelques mots</Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Je suis passionnée de salsa depuis toujours !"
                    value={formData.description}
                    onChange={handleChange('description')}
                />
            </Box>

            <Button variant="contained" color="success" fullWidth onClick={handleSubmit}>
                Valider
            </Button>
        </Container>
    )
}
