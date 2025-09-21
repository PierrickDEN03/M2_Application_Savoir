import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { UserContextProvider } from './context/userContext'
import NavbarBottom from './components/NavbarBottom'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <BrowserRouter>
        <UserContextProvider>
            <NavbarBottom></NavbarBottom>
            <App />
        </UserContextProvider>
    </BrowserRouter>
)
