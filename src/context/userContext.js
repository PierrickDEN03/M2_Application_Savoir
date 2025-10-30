// FILE: src/context/userContext.jsx
import React, { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase-config'
import { sendMagicLink, completeSignInWithEmailLink, profileExists, createProfile, signOut } from '../services/userService'

import { requestNotificationPermission, listenToForegroundMessages } from '../firebase-messaging'

export const UserContext = createContext(null)

export function UserContextProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        listenToForegroundMessages()

        const unsub = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user)
            setLoading(false)

            if (user) {
                try {
                    await requestNotificationPermission()
                } catch (err) {
                    console.error('Erreur lors de la demande de permission FCM:', err)
                }
            }
        })

        return unsub
    }, [])

    return (
        <UserContext.Provider
            value={{
                currentUser,
                sendMagicLink,
                completeSignInWithEmailLink,
                profileExists,
                createProfile,
                signOut,
            }}
        >
            {!loading && children}
        </UserContext.Provider>
    )
}
