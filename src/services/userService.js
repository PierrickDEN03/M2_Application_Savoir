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
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists()
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
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
    }
    return null
}

// --- Auth utils ---
export const signOut = () => firebaseSignOut(auth)
export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback)
