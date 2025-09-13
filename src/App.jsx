import Home from './pages/Home'
import './styles/App.css'
import { Routes, Route } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Private from './pages/Private/Private'
import Dashboard from './pages/Private/pages/Dashboard'

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/*" element={<SignIn />}></Route>
            <Route path="/login/signUp" element={<SignUp />}></Route>
            <Route path="/login/signIn" element={<SignIn />}></Route>
            <Route path="/user" element={<Private />}>
                <Route path="/user/dashboard" element={<Dashboard />}></Route>
            </Route>
        </Routes>
    )
}

export default App
