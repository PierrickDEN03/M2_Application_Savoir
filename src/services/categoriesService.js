import { db } from '../firebase-config.js'
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore'

// Liste des catégories à créer avec seulement le nom de l'icône
const categories = [
    { description: 'Sport', iconName: 'SportsBaseball' },
    { description: 'Musique', iconName: 'MusicNote' },
    { description: 'Danse', iconName: 'EmojiPeople' },
    { description: 'Cuisine', iconName: 'Restaurant' },
    { description: 'Bricolage', iconName: 'Build' },
    { description: 'Art', iconName: 'Palette' },
    { description: 'Culture', iconName: 'MenuBook' },
    { description: 'Théâtre', iconName: 'TheaterComedy' },
    { description: 'Running', iconName: 'DirectionsRun' },
    { description: 'Shopping', iconName: 'ShoppingCart' },
    { description: 'Jeux vidéo', iconName: 'VideogameAsset' },
    { description: 'Randonnées', iconName: 'Hiking' },
    { description: 'Natation', iconName: 'Pool' },
    { description: 'Autres', iconName: 'MoreHoriz' },
]

export const createCategories = async () => {
    try {
        console.log('Création des catégories dans Firestore...')
        for (const cat of categories) {
            const docRef = await addDoc(collection(db, 'categories'), {
                description: cat.description,
                iconName: cat.iconName, // stocke juste le nom
                createdAt: new Date(),
                isActive: true,
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

// Récupérer les intérêts de l'utilisateur
export const getUserInterests = async (userId) => {
    const userRef = doc(db, 'users', userId)
    const snap = await getDoc(userRef)

    if (snap.exists() && snap.data().interests_id) {
        return snap.data().interests_id
    }
    return [] // si pas d'intérêts encore
}
