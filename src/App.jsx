import Home from './pages/Home'
import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Private from './pages/Private/Private'
import Dashboard from './pages/Private/pages/Dashboard'
import SignInMagic from './pages/SignIn'
import AuthCallback from './pages/AuthCallback'
import RegisterProfile from './pages/RegisterProfile'
import Map from './pages/Private/pages/Map'
import SwaggerUIComponent from './components/SwaggerDoc'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />

            {/* Documentation Swagger */}
            <Route path="/docs" element={<SwaggerUIComponent />} />

            {/* Connexion par lien magique */}
            <Route path="/login" element={<SignInMagic />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Complétion du profil après 1ère connexion */}
            <Route path="/register-profile" element={<RegisterProfile />} />

            <Route path="/user/map" element={<Map />}></Route>
            {/* Espace privé */}
            <Route path="/user" element={<Private />}>
                <Route path="/user/dashboard" element={<Dashboard />} />
                {/* <Route path="/user/map" element={<Map />}></Route>*/}
            </Route>
        </Routes>
    )
}

export default App
