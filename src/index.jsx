import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { UserContextProvider } from './context/userContext'

// Enregistrer le service worker pour Firebase Messaging
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/firebase-messaging-sw.js')
            .then((registration) => {
                console.log('✅ Service Worker Firebase enregistré avec succès :', registration)
            })
            .catch((err) => {
                console.error('❌ Erreur lors de l’enregistrement du Service Worker Firebase :', err)
            })
    })
}

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <BrowserRouter>
        <UserContextProvider>
            <App />
        </UserContextProvider>
    </BrowserRouter>
)
