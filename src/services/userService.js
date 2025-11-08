// FILE: src/services/userService.js
import {
    sendSignInLinkToEmail,
    signInWithEmailLink,
    isSignInWithEmailLink,
    signOut as firebaseSignOut,
    onAuthStateChanged,
} from 'firebase/auth'
import { auth, db, actionCodeSettings, storage } from '../firebase-config'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// --- Magic link ---
export async function sendMagicLink(email) {
    if (!email) throw new Error('email-required')

    const urlWithEmail = `${actionCodeSettings.url}?email=${encodeURIComponent(email)}`
    await sendSignInLinkToEmail(auth, email, { ...actionCodeSettings, url: urlWithEmail })

    window.localStorage.setItem('emailForSignIn', email)
    return true
}

// --- Vérifie si l'utilisateur est connecté ET enregistré dans Firestore ---
export async function getAuthenticatedUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe()

            if (!user) {
                resolve(null)
                return
            }

            try {
                // ⚠️ On attend que le token soit bien rafraîchi
                await user.getIdToken(true)

                const userDocRef = doc(db, 'users', user.uid)

                // utiliser getDoc sans listener pour éviter l'erreur de permission
                try {
                    const snap = await getDoc(userDocRef)

                    if (!snap.exists()) {
                        resolve({ uid: user.uid, email: user.email, registered: false })
                    } else {
                        resolve({ uid: user.uid, email: user.email, registered: true, data: snap.data() })
                    }
                } catch (firestoreError) {
                    // Si l'erreur est "permission-denied", l'utilisateur n'est pas enregistré
                    if (firestoreError.code === 'permission-denied') {
                        resolve({ uid: user.uid, email: user.email, registered: false })
                    } else {
                        throw firestoreError
                    }
                }
            } catch (err) {
                console.error('Erreur getAuthenticatedUser:', err)
                reject(err)
            }
        })
    })
}

export async function completeSignInWithEmailLink(url) {
    if (!isSignInWithEmailLink(auth, url)) {
        throw new Error('not-an-email-link')
    }

    let email = window.localStorage.getItem('emailForSignIn')
    if (!email) {
        const urlParams = new URL(url).searchParams
        email = urlParams.get('email')
        if (!email) throw new Error('email-required')
    }

    const result = await signInWithEmailLink(auth, email, url)
    window.localStorage.removeItem('emailForSignIn')
    return result
}

// --- Profiles ---
export async function profileExists(uid) {
    if (!uid) return false
    try {
        const ref = doc(db, 'users', uid)
        const snap = await getDoc(ref)
        return snap.exists()
    } catch (error) {
        // Si permission denied, le profil n'existe pas
        if (error.code === 'permission-denied') {
            return false
        }
        throw error
    }
}

export async function createProfile(uid, profileData = {}, photoFile = null) {
    if (!uid) throw new Error('uid-required')

    let photoUrl = profileData.photoUrl || '/avatar_default.jpg'

    // Upload photo si fournie
    if (photoFile) {
        const storageRef = ref(storage, `users/${uid}/profile.jpg`)
        await uploadBytes(storageRef, photoFile)
        photoUrl = await getDownloadURL(storageRef)
    }

    const payload = {
        ...profileData,
        photoUrl,
        createdAt: new Date().toISOString(),
    }

    await setDoc(doc(db, 'users', uid), payload, { merge: true })
    return payload
}

export async function updateUserProfile(uid, updates = {}) {
    if (!uid) throw new Error('uid-required')
    const ref = doc(db, 'users', uid)
    await updateDoc(ref, updates)
    return true
}

export async function fetchUserById(userId) {
    if (!userId) return null
    try {
        const docRef = doc(db, 'users', userId)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() }
        }
        return null
    } catch (error) {
        console.error('Erreur fetchUserById:', error)
        return null
    }
}

// --- Contacts ---
export async function fetchContact(contactId) {
    if (!contactId) throw new Error('contactId-required')

    try {
        const docRef = doc(db, 'users', contactId)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() }
        } else {
            return { id: contactId, name: 'Utilisateur inconnu', avatar: null }
        }
    } catch (error) {
        console.error('Erreur lors du chargement du contact :', error)
        // Retourner un objet par défaut au lieu de throw
        return { id: contactId, name: 'Utilisateur inconnu', avatar: null }
    }
}

// --- Auth utils ---
export const signOut = () => firebaseSignOut(auth)
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback)



export const getProfile = async (uid) => {
    try {
        const docRef = doc(db, 'users', uid)
        const docSnap = await getDoc(docRef)
        return docSnap.exists() ? docSnap.data() : null
    } catch (err) {
        console.error('Erreur getProfile:', err)
        return null
    }
}
