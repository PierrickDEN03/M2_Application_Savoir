import { db } from '../firebase-config.js'
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'

// Liste des catégories avec description, icône et couleur
const categories = [
    { description: 'Sport', iconName: 'SportsBaseball', color: '#E74C3C' }, // rouge
    { description: 'Musique', iconName: 'MusicNote', color: '#3498DB' }, // bleu
    { description: 'Danse', iconName: 'EmojiPeople', color: '#9B59B6' }, // violet
    { description: 'Cuisine', iconName: 'Restaurant', color: '#E67E22' }, // orange
    { description: 'Bricolage', iconName: 'Build', color: '#27AE60' }, // vert
    { description: 'Art', iconName: 'Palette', color: '#F39C12' }, // jaune
    { description: 'Culture', iconName: 'MenuBook', color: '#2ECC71' }, // vert clair
    { description: 'Théâtre', iconName: 'TheaterComedy', color: '#D35400' }, // marron/orange foncé
    { description: 'Running', iconName: 'DirectionsRun', color: '#1ABC9C' }, // turquoise
    { description: 'Shopping', iconName: 'ShoppingCart', color: '#C0392B' }, // rouge foncé
    { description: 'Jeux vidéo', iconName: 'VideogameAsset', color: '#2980B9' }, // bleu foncé
    { description: 'Randonnées', iconName: 'Hiking', color: '#16A085' }, // vert forêt
    { description: 'Natation', iconName: 'Pool', color: '#2874A6' }, // bleu océan
    { description: 'Autres', iconName: 'MoreHoriz', color: '#7F8C8D' }, // gris
]

export const createCategories = async () => {
    try {
        console.log('Création des catégories dans Firestore...')
        for (const cat of categories) {
            const docRef = await addDoc(collection(db, 'categories'), {
                description: cat.description,
                iconName: cat.iconName,
                color: cat.color,
                createdAt: new Date(),
            })
            console.log(`Catégorie "${cat.description}" créée avec ID: ${docRef.id}`)
        }
        console.log('Toutes les catégories ont été créées !')
    } catch (error) {
        console.error('Erreur lors de la création des catégories:', error)
    }
}

/**
 * Met à jour les intérêts d'un utilisateur
 * @param {string} uid - ID Firebase Auth de l'utilisateur
 * @param {string[]} interests - Liste d'IDs de catégories
 */
export const saveUserInterests = async (uid, interests) => {
    try {
        const userRef = doc(db, 'users', uid)
        await updateDoc(userRef, {
            interests_id: interests,
        })
        console.log('Intérêts enregistrés pour l’utilisateur:', uid, interests)
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des intérêts:', error)
    }
}

// Récupérer les intérêts complets de l'utilisateur
export const getUserInterests = async (userId) => {
    const userRef = doc(db, 'users', userId)
    const snap = await getDoc(userRef)

    if (snap.exists() && snap.data().interests_id) {
        const interestsIds = snap.data().interests_id
        const categories = []

        for (const id of interestsIds) {
            const catRef = doc(db, 'categories', id)
            const catSnap = await getDoc(catRef)
            if (catSnap.exists()) {
                categories.push({ id: catSnap.id, ...catSnap.data() })
            }
        }

        return categories // ✅ retourne les objets complets
    }
    return []
}

export const fetchCategoryById = async (categoryId) => {
    const ref = doc(db, 'categories', categoryId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() }
    }
    return null
}
