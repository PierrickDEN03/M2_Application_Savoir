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
    { description: 'Astronomie', iconName: 'Public', color: '#8E44AD' },
    { description: 'Cinéma', iconName: 'Movie', color: '#8E44AD' },
    { description: 'Lecture', iconName: 'MenuBook', color: '#2E86C1' },
    { description: 'Yoga', iconName: 'SelfImprovement', color: '#27AE60' },
    { description: 'Jeux de société', iconName: 'Extension', color: '#AF7AC5' },
    { description: 'Photographie', iconName: 'PhotoCamera', color: '#5DADE2' },
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
        Sport: 'https://images.pexels.com/photos/1127120/pexels-photo-1127120.jpeg',
        Musique: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        Natation: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        Cuisine: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
        Astronomie: 'https://images.pexels.com/photos/920689/pexels-photo-920689.jpeg',
        Arts: 'https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg',
        Culture: 'https://images.pexels.com/photos/161251/senso-ji-temple-japan-kyoto-landmark-161251.jpeg',
        Théâtre: 'https://images.pexels.com/photos/4722577/pexels-photo-4722577.jpeg',
        Running: 'https://images.pexels.com/photos/8454917/pexels-photo-8454917.jpeg',
        Shopping: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80',
        Cinéma: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg',
        Danse: 'https://images.pexels.com/photos/175658/pexels-photo-175658.jpeg',
        Randonnée: 'https://images.pexels.com/photos/34355900/pexels-photo-34355900.jpeg',
        Lecture: 'https://images.pexels.com/photos/1148399/pexels-photo-1148399.jpeg',
        Yoga: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg',
        'Jeux de société': 'https://images.pexels.com/photos/29282821/pexels-photo-29282821.jpeg',
        Photographie: 'https://images.pexels.com/photos/34364145/pexels-photo-34364145.jpeg',
        Bricolage: 'https://images.pexels.com/photos/5974035/pexels-photo-5974035.jpeg',
        'Jeux vidéo': 'https://images.pexels.com/photos/7862243/pexels-photo-7862243.jpeg',
        Autres: 'https://images.pexels.com/photos/6558789/pexels-photo-6558789.jpeg',
    }

    return imageMap[category] || 'https://images.pexels.com/photos/6558789/pexels-photo-6558789.jpeg'
}
