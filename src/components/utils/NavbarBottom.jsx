import { useState, useEffect, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import HomeIcon from '@mui/icons-material/Home'
import ChatIcon from '@mui/icons-material/Chat'
import MapIcon from '@mui/icons-material/Map'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import Paper from '@mui/material/Paper'
import { Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { UserContext } from '../../context/userContext'

export default function BottomNav() {
    const navigate = useNavigate()
    const location = useLocation()
    const { currentUser } = useContext(UserContext)

    const getValueFromPath = (path) => {
        if (path === '/user/map') return 1
        if (path === '/user/profile') return 3
        if (path === '/user/messagerie' || path.startsWith('/user/send-message')) return 4
        if (path === '/user/dashboard' || path === '/user/create-activity') return 0
        return 0
    }

    const [value, setValue] = useState(getValueFromPath(location.pathname))

    useEffect(() => {
        setValue(getValueFromPath(location.pathname))
    }, [location.pathname])

    const handleChange = (event, newValue) => {
        if (newValue === 2) return

        setValue(newValue)
        switch (newValue) {
            case 0:
                navigate('/user/dashboard')
                break
            case 1:
                navigate('/user/map')
                break
            case 3:
                navigate(`/user/profile/${currentUser.uid}`)
                break
            case 4:
                navigate('/user/messagerie')
                break
            default:
                navigate('/user/dashboard')
        }
    }

    const handleCreateActivity = () => {
        navigate('/user/create-activity')
    }

    return (
        <>
            {/* Bouton flottant central */}
            <Fab
                aria-label="add"
                onClick={handleCreateActivity}
                sx={{
                    position: 'fixed',
                    bottom: 50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1001,
                    bgcolor: '#3454D1',
                    color: '#fff',
                    width: 64,
                    height: 64,
                    boxShadow: '0 4px 12px rgba(52, 84, 209, 0.4)',
                    '&:hover': {
                        bgcolor: '#2840a0',
                        boxShadow: '0 6px 16px rgba(52, 84, 209, 0.6)',
                    },
                    transition: 'all 0.3s ease',
                }}
            >
                <AddIcon sx={{ fontSize: 32 }} />
            </Fab>

            {/* Bottom Navigation */}
            <Paper
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    borderRadius: '20px 20px 0 0',
                    bgcolor: 'white',
                    zIndex: 1000,
                    border: 'none',
                }}
                elevation={3}
            >
                <BottomNavigation
                    value={value}
                    onChange={handleChange}
                    showLabels={true}
                    sx={{
                        height: 'auto',
                        bgcolor: 'transparent',
                        justifyContent: 'space-around',
                        paddingX: 1,
                        paddingY: 1,
                        '& .MuiBottomNavigationAction-root': {
                            color: '#9E9E9E',
                            minWidth: 'auto',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            margin: '4px 0',
                            transition: 'all 0.2s ease',
                            flexDirection: 'column',
                            fontSize: '0.7rem',
                            '&:hover': {
                                color: '#3454D1',
                            },
                            '& .MuiSvgIcon-root': {
                                fontSize: '24px',
                                marginBottom: '2px',
                            },
                        },
                        '& .Mui-selected': {
                            color: '#3454D1 !important',
                            bgcolor: 'transparent',
                            '& .MuiSvgIcon-root': {
                                fontSize: '28px',
                            },
                        },
                    }}
                >
                    <BottomNavigationAction label="Accueil" icon={<HomeIcon />} />
                    <BottomNavigationAction label="Carte" icon={<MapIcon />} />
                    <BottomNavigationAction label="" icon={null} disabled />
                    <BottomNavigationAction label="Profil" icon={<AccountCircleIcon />} />
                    <BottomNavigationAction label="Message" icon={<ChatIcon />} />
                </BottomNavigation>
            </Paper>
        </>
    )
}
