import Home from './pages/NotPrivate/pages/Home'
import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import Private from './pages/Private/Private'
import NotPrivate from './pages/NotPrivate/NotPrivate'
import Dashboard from './pages/Private/pages/Dashboard'
import SignInMagic from './pages/NotPrivate/pages/SignIn'
import AuthCallback from './pages/AuthCallback'
import RegisterProfile from './pages/NotPrivate/pages/RegisterProfile'
import SwaggerUIComponent from './components/SwaggerDoc'
import CreateActivityForm from './pages/Private/pages/CreateActivityForm'
import ChooseInterest from './pages/Private/pages/ChooseInterst'
import ResearchActivity from './pages/Private/pages/ResearchActivity'
import ActivityDetail from './pages/Private/pages/ActivityDetail'
import UserProfile from './pages/Private/pages/UserProfile'
import EditProfile from './pages/Private/pages/EditProfile'
import SendMessage from './pages/Private/pages/SendMessage'
import Messagerie from './pages/Private/pages/Messagerie'

function App() {
    return (
        <Routes>
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Documentation Swagger */}
            <Route path="/docs" element={<SwaggerUIComponent />} />

            {/* Espace non privé */}
            <Route path="/" element={<NotPrivate />}>
                <Route path="/" element={<Home />} />
                {/* Connexion par lien magique */}
                <Route path="/login" element={<SignInMagic />} />
                {/* Complétion du profil après 1ère connexion */}
                <Route path="/register-profile" element={<RegisterProfile />} />
            </Route>

            {/* Espace privé */}
            <Route path="/user" element={<Private />}>
                <Route path="/user/*" element={<Dashboard />} />
                <Route path="/user/" element={<Dashboard />} />
                <Route path="/user/dashboard" element={<Dashboard />} />
                <Route path="/user/map" element={<ResearchActivity />}></Route>
                <Route path="/user/create-activity" element={<CreateActivityForm />}></Route>
                <Route path="/user/activity-edit/:activityId" element={<CreateActivityForm />}></Route>
                <Route path="/user/interest" element={<ChooseInterest />}></Route>
                <Route path="/user/activity/:activityId" element={<ActivityDetail />} />
                <Route path="/user/profile/:idUser" element={<UserProfile />} />
                <Route path="/user/modif-profile/:idUser" element={<EditProfile />} />
                <Route path="/user/send-message/:idUser" element={<SendMessage />} />
                <Route path="/user/activity-message/:activityId/" element={<SendMessage />} />
                <Route path="/user/messagerie" element={<Messagerie />} />
            </Route>
        </Routes>
    )
}

export default App
