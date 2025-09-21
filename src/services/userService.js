import { sendSignInLinkToEmail, signInWithEmailLink, isSignInWithEmailLink, signOut as firebaseSignOut } from 'firebase/auth'
import { auth, db, actionCodeSettings } from '../firebase-config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// Envoie un lien magique à l’email
export async function sendMagicLink(email) {
    if (!email) throw new Error('email-required')

    // Ajout de l’email en query param
    const urlWithEmail = `${actionCodeSettings.url}?email=${encodeURIComponent(email)}`

    await sendSignInLinkToEmail(auth, email, {
        ...actionCodeSettings,
        url: urlWithEmail,
    })

    // Stockage local (utile si même appareil)
    window.localStorage.setItem('emailForSignIn', email)
    return true
}

// Complète la connexion après clic sur le lien
export async function completeSignInWithEmailLink(url) {
    if (!isSignInWithEmailLink(auth, url)) {
        throw new Error('not-an-email-link')
    }

    // Vérification de l’email
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

// Vérifie si un profil existe en base
export async function profileExists(uid) {
    if (!uid) return false
    const ref = doc(db, 'users', uid)
    const snap = await getDoc(ref)
    return snap.exists()
}

// Crée ou met à jour un profil utilisateur
export async function createProfile(uid, profileData = {}) {
    if (!uid) throw new Error('uid-required')
    const ref = doc(db, 'users', uid)
    await setDoc(ref, profileData, { merge: true })
    return true
}

// Déconnexion
export const signOut = () => firebaseSignOut(auth)
