// FILE: src/context/userContext.jsx
import React, { createContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase-config'
import { sendMagicLink, completeSignInWithEmailLink, profileExists, createProfile, signOut } from '../services/userService'

export const UserContext = createContext(null)

export function UserContextProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            setLoading(false)
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
