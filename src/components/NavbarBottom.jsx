import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import MapIcon from '@mui/icons-material/Map'
import BookmarksIcon from '@mui/icons-material/Bookmarks'
import ChatIcon from '@mui/icons-material/Chat'
import Paper from '@mui/material/Paper'

export default function BottomNav() {
    const navigate = useNavigate()
    const [value, setValue] = React.useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
        switch (newValue) {
            case 0:
                navigate('/user/dashboard')
                break
            case 1:
                navigate('/user/map')
                break
            case 2:
                navigate('/reservations')
                break
            case 3:
                navigate('/messagerie')
                break
            default:
                navigate('/user/dashboard')
        }
    }

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                borderRadius: 0,
                boxShadow: '0 -2px 8px rgba(0,0,0,0.1)',
            }}
            elevation={3}
        >
            <BottomNavigation value={value} onChange={handleChange} showLabels>
                <BottomNavigationAction label="Home" icon={<HomeIcon />} />
                <BottomNavigationAction label="Carte" icon={<MapIcon />} />
                <BottomNavigationAction label="Réservations" icon={<BookmarksIcon />} />
                <BottomNavigationAction label="Messagerie" icon={<ChatIcon />} />
            </BottomNavigation>
        </Paper>
    )
}
