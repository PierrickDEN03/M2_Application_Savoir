// FILE: src/services/favorisService.js
import { db } from '../firebase-config'
import { collection, addDoc, deleteDoc, doc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'

/**
 * Vérifie si l'activité est dans les favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} activityId - ID de l'activité
 * @returns {Promise<string|null>} - ID du favori ou null
 */
export async function checkFavorite(userId, activityId) {
    if (!userId || !activityId) return null

    const q = query(collection(db, 'favoris'), where('userId', '==', userId), where('activityId', '==', activityId))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id
    }
    return null
}

/**
 * Ajoute aux favoris
 * @param {string} userId - ID de l'utilisateur
 * @param {string} activityId - ID de l'activité
 * @returns {Promise<string>} - ID du favori créé
 */
export async function addFavorite(userId, activityId) {
    if (!userId || !activityId) throw new Error('userId et activityId requis')

    const docRef = await addDoc(collection(db, 'favoris'), {
        userId,
        activityId,
        createdAt: serverTimestamp(),
    })
    return docRef.id
}

/**
 * Supprime des favoris
 * @param {string} favoriteId - ID du favori
 * @returns {Promise<void>}
 */
export async function removeFavorite(favoriteId) {
    if (!favoriteId) throw new Error('favoriteId requis')

    await deleteDoc(doc(db, 'favoris', favoriteId))
}

/**
 * Récupère tous les favoris d'un utilisateur
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des favoris
 */
export async function getUserFavorites(userId) {
    if (!userId) return []

    const q = query(collection(db, 'favoris'), where('userId', '==', userId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}
