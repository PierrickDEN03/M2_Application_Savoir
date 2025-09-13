import { createContext, useState, useEffect } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase-config'

export const UserContext = createContext()

export function UserContextProvider(props) {
    const [currentUser, setCurrentUser] = useState(null)
    const [loadingData, setLoadingData] = useState(true)

    //Met à jour le state currentUser et loadingData à chaque changement d’authentification avec Firebase.
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setCurrentUser(currentUser)
            setLoadingData(false)
        })
        return unsubscribe
    }, [])

    const signUp = function (email, password) {
        //A changer en fonction de la BDD
        return createUserWithEmailAndPassword(auth, email, password)
    }

    const signIn = function (email, password) {
        //A changer en fonction de la BDD
        return signInWithEmailAndPassword(auth, email, password)
    }

    return <UserContext.Provider value={{ signUp, signIn, currentUser }}>{!loadingData && props.children}</UserContext.Provider>
}
