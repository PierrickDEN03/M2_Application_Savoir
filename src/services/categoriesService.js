import { db } from '../firebase-config.js'
import { collection, addDoc, updateDoc, doc, getDoc, getDocs } from 'firebase/firestore'

// Liste des catégories avec description, icône et couleur
const categories = [
    { description: 'Sport', iconName: 'SportsBaseball', color: '#E74C3C' },
    { description: 'Musique', iconName: 'MusicNote', color: '#3498DB' },
    { description: 'Danse', iconName: 'EmojiPeople', color: '#9B59B6' },
    { description: 'Cuisine', iconName: 'Restaurant', color: '#E67E22' },
    { description: 'Bricolage', iconName: 'Build', color: '#27AE60' },
    { description: 'Art', iconName: 'Palette', color: '#F39C12' },
    { description: 'Culture', iconName: 'MenuBook', color: '#2ECC71' },
    { description: 'Théâtre', iconName: 'TheaterComedy', color: '#D35400' },
    { description: 'Running', iconName: 'DirectionsRun', color: '#1ABC9C' },
    { description: 'Shopping', iconName: 'ShoppingCart', color: '#C0392B' },
    { description: 'Jeux vidéo', iconName: 'VideogameAsset', color: '#2980B9' },
    { description: 'Randonnées', iconName: 'Hiking', color: '#16A085' },
    { description: 'Natation', iconName: 'Pool', color: '#2874A6' },
    { description: 'Autres', iconName: 'MoreHoriz', color: '#7F8C8D' },
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
        console.log("Intérêts enregistrés pour l'utilisateur:", uid, interests)
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des intérêts:', error)
    }
}

/**
 * Récupère toutes les catégories depuis Firestore
 * @returns {Promise<Array>} - Liste de toutes les catégories
 */
export const fetchCategoriesFromDB = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'categories'))
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error)
        return []
    }
}

/**
 * Récupère les intérêts complets de l'utilisateur
 */
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

        return categories
    }
    return []
}

/**
 * Récupère une catégorie par son ID
 * @param {string} categoryId - L'ID de la catégorie
 * @returns {Promise<object|null>} - La catégorie ou null
 */
export const fetchCategoryById = async (categoryId) => {
    const ref = doc(db, 'categories', categoryId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
        return { id: snap.id, ...snap.data() }
    }
    return null
}

export const getCategoryImage = (category) => {
    const imageMap = {
        Sport: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80',
        Musique: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        Danse: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
        Cuisine: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        Bricolage: 'https://images.unsplash.com/photo-1581091012184-5c97e8ce53a9?auto=format&fit=crop&w=800&q=80',
        Art: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        Culture: 'https://images.unsplash.com/photo-1551806235-7d864347a1e9?auto=format&fit=crop&w=800&q=80',
        Théâtre: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
        Running: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=800&q=80',
        Shopping: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
        'Jeux vidéo': 'https://images.unsplash.com/photo-1580128637425-1c79a6720d2b?auto=format&fit=crop&w=800&q=80',
        Randonnées: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
        Natation: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        Autres: 'https://images.unsplash.com/photo-1520975918318-3e9ce41f1cc6?auto=format&fit=crop&w=800&q=80',
    }

    return imageMap[category] || 'https://images.unsplash.com/photo-1503264116251-35a269479413?auto=format&fit=crop&w=800&q=80'
}
