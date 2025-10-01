// FILE: src/services/activitiesService.js
import { db } from '../firebase-config'
import { collection, addDoc, serverTimestamp, getDocs, query, where, orderBy, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'

/**
 * Crée une nouvelle activité dans Firestore
 * @param {string} uid - L'ID de l'utilisateur créateur
 * @param {object} activityData - Les données de l'activité
 * @returns {Promise<string>} - L'ID de l'activité créée
 */
export async function createActivity(uid, activityData = {}) {
    if (!uid) throw new Error('uid-required')
    if (!activityData) throw new Error('activity-data-required')

    const activitiesRef = collection(db, 'activities')
    const payload = {
        ...activityData,
        createdBy: uid,
        createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(activitiesRef, payload)
    return docRef.id
}

/**
 * Récupère toutes les activités depuis Firestore
 * @returns {Promise<Array>} - Liste des activités
 */
export async function fetchActivitiesFromDB() {
    const querySnapshot = await getDocs(collection(db, 'activities'))
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * Récupère toutes les catégories depuis Firestore
 * @returns {Promise<Array>} - Liste des catégories
 */
export async function fetchCategoriesFromDB() {
    const querySnapshot = await getDocs(collection(db, 'categories'))
    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * Récupère une activité spécifique par son ID
 * @param {string} activityId - L'ID de l'activité
 * @returns {Promise<object|null>} - L'activité ou null si non trouvée
 */
export async function fetchActivityById(activityId) {
    if (!activityId) throw new Error('activity-id-required')

    const activityRef = doc(db, 'activities', activityId)
    const activitySnap = await getDoc(activityRef)

    if (activitySnap.exists()) {
        return {
            id: activitySnap.id,
            ...activitySnap.data(),
        }
    }
    return null
}

/**
 * Récupère les activités par catégorie
 * @param {string} categoryId - L'ID de la catégorie
 * @returns {Promise<Array>} - Liste des activités de cette catégorie
 */
export async function fetchActivitiesByCategory(categoryId) {
    if (!categoryId) throw new Error('category-id-required')

    const activitiesRef = collection(db, 'activities')
    const q = query(activitiesRef, where('categoryId', '==', categoryId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * Récupère les activités créées par un utilisateur spécifique
 * @param {string} userId - L'ID de l'utilisateur
 * @returns {Promise<Array>} - Liste des activités créées par cet utilisateur
 */
export async function fetchActivitiesByUser(userId) {
    if (!userId) throw new Error('user-id-required')

    const activitiesRef = collection(db, 'activities')
    const q = query(activitiesRef, where('createdBy', '==', userId), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * Récupère les activités à venir (date >= aujourd'hui)
 * @returns {Promise<Array>} - Liste des activités futures
 */
export async function fetchUpcomingActivities() {
    const activitiesRef = collection(db, 'activities')
    const today = new Date().toISOString()
    const q = query(activitiesRef, where('date', '>=', today), orderBy('date', 'asc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }))
}

/**
 * Met à jour une activité existante
 * @param {string} activityId - L'ID de l'activité
 * @param {object} updates - Les champs à mettre à jour
 * @returns {Promise<void>}
 */
export async function updateActivity(activityId, updates) {
    if (!activityId) throw new Error('activity-id-required')
    if (!updates) throw new Error('updates-required')

    const activityRef = doc(db, 'activities', activityId)
    await updateDoc(activityRef, {
        ...updates,
        updatedAt: serverTimestamp(),
    })
}

/**
 * Supprime une activité
 * @param {string} activityId - L'ID de l'activité à supprimer
 * @returns {Promise<void>}
 */
export async function deleteActivity(activityId) {
    if (!activityId) throw new Error('activity-id-required')

    const activityRef = doc(db, 'activities', activityId)
    await deleteDoc(activityRef)
}

/**
 * Recherche des activités par mots-clés
 * @param {string} searchTerm - Le terme de recherche
 * @returns {Promise<Array>} - Liste des activités correspondantes
 */
export async function searchActivities(searchTerm) {
    if (!searchTerm) return []

    // Note: Firestore ne supporte pas la recherche full-text native
    // Cette fonction récupère toutes les activités et filtre côté client
    const activities = await fetchActivitiesFromDB()
    const lowerSearchTerm = searchTerm.toLowerCase()

    return activities.filter((activity) => {
        const titleMatch = activity.title?.toLowerCase().includes(lowerSearchTerm)
        const cityMatch = activity.address?.city?.toLowerCase().includes(lowerSearchTerm)
        const descriptionMatch = activity.description?.toLowerCase().includes(lowerSearchTerm)

        return titleMatch || cityMatch || descriptionMatch
    })
}
