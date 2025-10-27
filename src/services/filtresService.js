// FILE: src/services/filtresService.js
import { db } from '../firebase-config'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'

/**
 * Sauvegarde ou met à jour les filtres d’un utilisateur.
 */
export async function saveUserFilters(userId, filters) {
    if (!userId) return
    try {
        const ref = doc(db, 'filters', userId)
        await setDoc(ref, { userId, filters }, { merge: true })
    } catch (err) {
        console.error('Erreur saveUserFilters:', err)
    }
}

/**
 * Charge les filtres de l’utilisateur.
 */
export async function loadUserFilters(userId) {
    if (!userId) return null
    try {
        const ref = doc(db, 'filters', userId)
        const snap = await getDoc(ref)
        if (snap.exists()) {
            return snap.data().filters || null
        }
        return null
    } catch (err) {
        console.error('Erreur loadUserFilters:', err)
        return null
    }
}

/**
 * Réinitialise les filtres de l’utilisateur.
 */
export async function resetUserFilters(userId) {
    if (!userId) return
    try {
        const ref = doc(db, 'filters', userId)
        await updateDoc(ref, { filters: {} })
    } catch (err) {
        console.error('Erreur resetUserFilters:', err)
    }
}
