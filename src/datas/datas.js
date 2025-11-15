// FILE: src/services/datas.js
import { db } from '../firebase-config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { addReservation } from '../services/reservationsService'

// ------------------------
// Catégories existantes
// ------------------------
export const categories = [
    { id: '4IRMWhxiGFxgNOwVpg8r', description: 'Shopping', iconName: 'ShoppingCart' },
    { id: '4cJXqJo3V1KD7V996HuA', description: 'Cinéma', iconName: 'Movie' },
    { id: '5BpFGj2TAbxGKyoA2Vrd', description: 'Photographie', iconName: 'CameraAlt' },
    { id: '6CWbnUWjsuxVq2isxhPX', description: 'Danse', iconName: 'DirectionsRun' },
    { id: '7f2uNuW0mwZFFY2uQjmx', description: 'Randonnées', iconName: 'Hiking' },
    { id: '8hBkMbyOqyyboTOmzBxH', description: 'Cuisine', iconName: 'Restaurant' },
    { id: 'B6rLI1acZ8iKCIGM7zWy', description: 'Yoga', iconName: 'SelfImprovement' },
    { id: 'IjNoF0eXCjPOydfb9yyJ', description: 'Sport', iconName: 'FitnessCenter' },
    { id: 'Ilx5RrxAVNLW6zxs3pCp', description: 'Astronomie', iconName: 'RocketLaunch' },
    { id: 'Kzpzc3mI9M2SQo6JX1bw', description: 'Lecture', iconName: 'MenuBook' },
    { id: 'SX78JHJqyiEjj51KJAzy', description: 'Culture', iconName: 'TheaterComedy' },
    { id: 'Yc0OkTe9JdNUXZ4guC1K', description: 'Bricolage', iconName: 'Build' },
    { id: 'ZBg92skofHoZV46Q34qn', description: 'Autres', iconName: 'Category' },
    { id: 'jfUPqAX6im81lWevYmqL', description: 'Jeux de société', iconName: 'SportsEsports' },
    { id: 'mRzfUJysJ9rCC0bKhsKy', description: 'Jeux vidéo', iconName: 'VideogameAsset' },
    { id: 'obDibFfne1UdxBg1mWLa', description: 'Running', iconName: 'DirectionsRun' },
    { id: 'pRe8oGc9j9Hx7LxQjb5h', description: 'Yoga', iconName: 'SelfImprovement' },
    { id: 'u1t0xiXVvL6NLa7fo49j', description: 'Théâtre', iconName: 'TheaterComedy' },
    { id: 'v3Mw9l31Y8Ff4eHITFDZ', description: 'Art', iconName: 'Palette' },
    { id: 'yRPnt0C9cenVpmw59041', description: 'Musique', iconName: 'MusicNote' },
]

const categoriesMap = Object.fromEntries(categories.map((c) => [c.id, c.description]))
const categoryIds = categories.map((c) => c.id)

// ------------------------
// Titres et descriptions diversifiées
// ------------------------
const activityTemplates = {
    Shopping: [
        { title: 'Boutiques insolites', description: 'Découverte des adresses secrètes et originales à Lyon et alentours' },
        { title: 'Marché vintage', description: 'Chiner des objets rares et partager vos trouvailles' },
        { title: 'Shopping gourmand', description: 'Visite de boutiques culinaires et dégustation de spécialités locales' },
    ],
    Cinéma: [
        { title: 'Soirée courts-métrages', description: 'Projection et échanges autour de courts-métrages innovants' },
        { title: 'Ciné en plein air', description: 'Séance de cinéma dans un cadre atypique et convivial' },
        { title: 'Film et discussion', description: 'Regarder un film et débattre de ses thématiques' },
    ],
    Photographie: [
        { title: 'Street photography', description: 'Capturer les paysages urbains et moments spontanés' },
        { title: 'Portraits créatifs', description: 'Exercices de portraits dans différents contextes' },
        { title: 'Nature et paysages', description: 'Balade photographique en dehors de Lyon' },
    ],
    Danse: [
        { title: 'Hip-hop débutants', description: 'Découverte du hip-hop pour tous les niveaux' },
        { title: 'Danse moderne', description: 'Atelier chorégraphique et expression corporelle' },
        { title: 'Danses du monde', description: 'Apprendre différentes danses internationales' },
    ],
    Randonnées: [
        { title: 'Rando en collines', description: 'Randonnée avec panorama sur Lyon et ses alentours' },
        { title: 'Forêt et nature', description: 'Marche tranquille pour se ressourcer en pleine nature' },
        { title: 'Balade à thème', description: 'Découverte des histoires et légendes locales en marchant' },
    ],
    Cuisine: [
        { title: 'Cuisine asiatique', description: 'Atelier découverte des saveurs de l’Asie' },
        { title: 'Pâtisseries créatives', description: 'Apprentissage de desserts originaux' },
        { title: 'Cuisine végétarienne', description: 'Recettes saines et gourmandes à partager' },
    ],
    Yoga: [
        { title: 'Yoga doux matinal', description: 'Démarrage de la journée avec douceur et énergie' },
        { title: 'Yoga dynamique', description: 'Séance tonique pour renforcer le corps et l’esprit' },
        { title: 'Méditation en plein air', description: 'Allier yoga et méditation dans un cadre naturel' },
    ],
    Sport: [
        { title: 'Bootcamp extérieur', description: 'Entraînement complet en groupe pour tous niveaux' },
        { title: 'VTT urbain', description: 'Sortie VTT dans et autour de Lyon' },
        { title: 'Escalade découverte', description: 'Initiation à l’escalade avec matériel fourni' },
    ],
    Astronomie: [
        { title: 'Observation du ciel', description: 'Découverte des étoiles et planètes avec télescope' },
        { title: 'Éclipse et phénomènes', description: 'Observation guidée d’événements astronomiques' },
        { title: 'Atelier astrophotographie', description: 'Capturer le ciel nocturne avec votre appareil photo' },
    ],
    Lecture: [
        { title: 'Club lecture moderne', description: 'Échanges autour de romans récents' },
        { title: 'Lecture en extérieur', description: 'Apprécier la lecture dans un parc ou jardin' },
        { title: 'Atelier poésie', description: 'Écriture et partage de poèmes collectifs' },
    ],
    Culture: [
        { title: 'Découverte architecturale', description: 'Balade pour admirer l’architecture historique et moderne' },
        { title: 'Visite artistique', description: 'Découverte d’expositions locales' },
        { title: 'Conférence patrimoine', description: 'Apprendre l’histoire locale avec des spécialistes' },
    ],
    Bricolage: [
        { title: 'DIY créatif', description: 'Créer des objets décoratifs uniques' },
        { title: 'Atelier recyclage', description: 'Réutiliser des objets pour créer de nouvelles choses' },
        { title: 'Mini construction', description: 'Apprendre des techniques simples de menuiserie' },
    ],
    'Jeux de société': [
        { title: 'Soirée stratégique', description: 'Découvrir des jeux de plateau modernes' },
        { title: 'Jeux rapides', description: 'Sessions de jeux courts et fun entre amis' },
        { title: 'Jeux coopératifs', description: 'Résoudre ensemble des défis et énigmes' },
    ],
    'Jeux vidéo': [
        { title: 'Tournoi multi-joueurs', description: 'Affrontements amicaux sur jeux populaires' },
        { title: 'Découverte indie', description: 'Tester des jeux indépendants originaux' },
        { title: 'Session rétro', description: 'Redécouverte des classiques des années 90-2000' },
    ],
    Running: [
        { title: 'Footing en groupe', description: 'Course collective à rythme modéré' },
        { title: 'Trail urbain', description: 'Parcours urbains et collines environnantes' },
        { title: 'Étirements et course', description: 'Séance combinée course et stretching' },
    ],
    Théâtre: [
        { title: 'Improv et comédie', description: 'Exercices et scènes improvisées' },
        { title: 'Lecture de pièces', description: 'Analyse et lecture de textes classiques ou contemporains' },
        { title: 'Atelier technique', description: 'Perfectionnement sur diction, gestuelle et expression' },
    ],
    Art: [
        { title: 'Peinture et croquis', description: 'Expression artistique libre ou guidée' },
        { title: 'Visite atelier', description: 'Découverte d’artistes locaux et de leurs techniques' },
        { title: 'Street art tour', description: 'Explorer l’art urbain à Lyon et alentours' },
    ],
    Musique: [
        { title: 'Jam session', description: 'Improvisation musicale entre participants' },
        { title: 'Découverte musicale', description: 'Écouter et partager de nouveaux genres musicaux' },
        { title: 'Concert acoustique', description: 'Petits concerts intimistes en extérieur' },
    ],
    Autres: [
        { title: 'Rencontre thématique', description: 'Échanger autour d’un thème choisi par les participants' },
        { title: 'Activité surprise', description: 'Découvrir une activité inattendue et originale' },
        { title: 'Balade insolite', description: 'Découverte ludique de lieux peu connus' },
    ],
}

// ------------------------
// Données aléatoires pour utilisateurs
// ------------------------
const firstNames = ['Lucas', 'Emma', 'Léo', 'Chloé', 'Gabriel', 'Manon', 'Louis', 'Camille', 'Arthur', 'Julie', 'Raphaël', 'Sarah']
const lastNames = [
    'Bernier',
    'Dubois',
    'Moreau',
    'Lefevre',
    'Roux',
    'Faure',
    'Garnier',
    'Chevalier',
    'Martinez',
    'Blanc',
    'Fournier',
    'Gauthier',
]
const streets = [
    'Cours Charlemagne',
    'Rue de la République',
    'Rue Garibaldi',
    'Rue Victor Hugo',
    'Rue Mercière',
    'Place Bellecour',
    'Quai Saint-Antoine',
    'Rue Président Édouard Herriot',
    'Rue des Marronniers',
    'Rue Sainte-Catherine',
    'Rue Paul Cazeneuve',
    'Rue de la Barre',
]

const lyonPostalCodes = ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008', '69009']

// Pour positions autour de Lyon (Presqu'île, Vieux Lyon, Confluence, Croix-Rousse, Villeurbanne, Caluire)
const lyonPositions = [
    { lat: 45.76, lng: 4.835 },
    { lat: 45.758, lng: 4.826 },
    { lat: 45.766, lng: 4.838 },
    { lat: 45.771, lng: 4.841 },
    { lat: 45.755, lng: 4.85 },
    { lat: 45.77, lng: 4.83 },
    { lat: 45.768, lng: 4.845 },
    { lat: 45.78, lng: 4.85 },
    { lat: 45.765, lng: 4.825 },
]

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)]
const randomPhone = () => `06${Math.floor(10 + Math.random() * 90)}${Math.floor(1000000 + Math.random() * 9000000)}`

// ------------------------
// Génération d'utilisateurs
// ------------------------
const generateUser = (index) => {
    const firstName = sample(firstNames)
    const lastName = sample(lastNames)
    const displayName = `${firstName} ${lastName}`
    const shuffledCategories = [...categoryIds].sort(() => 0.5 - Math.random())
    const interests_id = shuffledCategories.slice(0, 3)

    return {
        uid: `user_${String(index).padStart(3, '0')}`,
        city: 'Lyon',
        createdAt: new Date().toISOString(),
        description: '',
        displayName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        firstName,
        lastName,
        phone: randomPhone(),
        photoUrl: '/avatar_default.jpg',
        postalCode: sample(lyonPostalCodes),
        street: `${Math.floor(Math.random() * 200) + 1} ${sample(streets)}`,
        interests_id,
    }
}

export const generatedUsers = Array.from({ length: 40 }, (_, i) => generateUser(i + 1))

export async function insertGeneratedUsers() {
    for (const user of generatedUsers) {
        const { uid, ...payload } = user
        await setDoc(doc(db, 'users', uid), payload, { merge: false })
    }
    console.log('✅ 40 utilisateurs insérés dans Firestore')
}

// ------------------------
// Adresses possibles et position pour activités
// ------------------------
const addresses = Array.from({ length: 100 }, () => ({
    city: 'Lyon',
    postalCode: sample(lyonPostalCodes),
    street: `${Math.floor(Math.random() * 200) + 1} ${sample(streets)}`,
    position: sample(lyonPositions),
}))

// ------------------------
// Dates aléatoires cohérentes (26 déc 2025 -> 31 janv 2026)
// ------------------------
const generateRandomDate = () => {
    const start = new Date('2025-12-26T18:00:00')
    const end = new Date('2026-01-31T23:00:00')
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime())
    const date = new Date(randomTime)

    const hours = [18, 19, 20, 21, 22]
    const minutes = [0, 15, 30, 45]
    date.setHours(sample(hours))
    date.setMinutes(sample(minutes))
    date.setSeconds(0)
    return date.toISOString()
}

// ------------------------
// Génération d'activités
// ------------------------
const generateActivity = (index) => {
    const categoryId = sample(categoryIds)
    const categoryName = categoriesMap[categoryId]
    const user = sample(generatedUsers)
    const address = sample(addresses)
    const templates = activityTemplates[categoryName] || activityTemplates['Autres']
    const template = sample(templates)

    return {
        userId: user.uid,
        createdBy: user.uid,
        title: template.title,
        description: template.description,
        categoryId,
        date: generateRandomDate(),
        duration: Math.floor(Math.random() * 3) + 1,
        participants: Math.floor(Math.random() * 10) + 1,
        address: {
            street: address.street,
            city: address.city,
            postalCode: address.postalCode,
        },
        position: {
            lat: address.position.lat + (Math.random() - 0.5) / 100,
            lng: address.position.lng + (Math.random() - 0.5) / 100,
        },
        photoUrl: null,
    }
}

export async function insertGeneratedActivities() {
    console.log('🚀 Début de la génération de 100 activités...')
    for (let i = 0; i < 100; i++) {
        const activityId = `activity_${String(i + 1).padStart(3, '0')}`
        const activity = generateActivity(i)
        const docRef = doc(db, 'activities', activityId)
        await setDoc(docRef, { ...activity, createdAt: serverTimestamp() })
    }
    console.log('🎉 100 activités insérées !')
}

// ------------------------
// Génération réservations et messages
// ------------------------
const userIds = generatedUsers.map((u) => u.uid)
const activityIds = Array.from({ length: 100 }, (_, i) => `activity_${String(i + 1).padStart(3, '0')}`)

const generateRandomReservation = () => {
    return {
        userId: sample(userIds),
        activityId: sample(activityIds),
    }
}

export async function insertGeneratedReservations(count = 300) {
    console.log(`🚀 Génération de ${count} réservations...`)
    for (let i = 0; i < count; i++) {
        const { userId, activityId } = generateRandomReservation()
        try {
            await addReservation(userId, activityId)
        } catch (e) {
            console.warn(`⚠️ Réservation déjà existante ou erreur pour ${userId},${activityId}`)
        }
    }
    console.log(`🎉 ${count} réservations insérées !`)
}

const conversationSamples = [
    'Salut !',
    'Ça va ?',
    'Oui, et toi ?',
    'On se voit ce week-end ?',
    'Parfait, à samedi !',
    'Merci pour ton aide !',
    'Tu as vu le dernier film ?',
    'On pourrait organiser ça ensemble.',
    'Peux-tu m’envoyer le document ?',
    'C’était super sympa hier.',
    'À quelle heure on se retrouve ?',
    'Bonne journée !',
    'Tu es dispo demain ?',
    'J’ai pensé à toi pour ce projet.',
    'On se fait un café cette semaine ?',
    'Tu as fini le travail ?',
    'Je suis en retard, désolé !',
    'Ça marche, je note.',
    'On change de lieu pour la réunion ?',
    'Tu viens à la soirée vendredi ?',
    'Je te rappelle plus tard.',
    'As-tu reçu mon mail ?',
    'On peut décaler la réunion ?',
    'Merci pour ton retour rapide.',
    'C’est noté, merci !',
    'Super, j’adore cette idée.',
    'Tu veux qu’on fasse ça ensemble ?',
    'J’ai une question pour toi.',
    'Ça te dérange si je passe plus tard ?',
    'Je suis coincé dans les transports.',
    'Peux-tu m’aider avec ce fichier ?',
    'On se retrouve au parc ?',
    'Je n’ai pas compris, peux-tu répéter ?',
    'Tu as des nouvelles de Paul ?',
    'Je suis en train de préparer le projet.',
    'Ça serait génial si tu pouvais venir.',
    'On se fait un déjeuner demain ?',
    'Tu es libre ce soir ?',
    'Merci pour le partage.',
    'Je confirme notre rendez-vous.',
    'Peux-tu m’envoyer le lien ?',
    'J’ai adoré notre dernière sortie.',
    'On peut reporter ça à lundi ?',
    'Je te tiens au courant.',
    'C’est urgent ?',
    'Je passe chez toi vers 18h.',
    'Tu veux participer au groupe ?',
    'Je suis pris toute la journée.',
    'On fait ça la semaine prochaine ?',
    'Tu m’expliques comment faire ?',
    'Merci beaucoup pour tout !',
]

export async function insertCohesiveMessages() {
    console.log('🚀 Génération de messages...')
    const pairs = []
    const shuffledUsers = [...generatedUsers].sort(() => 0.5 - Math.random())
    for (let i = 0; i < 10; i++) {
        pairs.push([shuffledUsers[i].uid, shuffledUsers[i + 10].uid])
    }
    let messageCount = 0
    for (const [userA, userB] of pairs) {
        const numMessages = 15 + Math.floor(Math.random() * 6)
        let currentDate = new Date()
        currentDate.setDate(currentDate.getDate() - Math.floor(Math.random() * 30))
        for (let i = 0; i < numMessages; i++) {
            const senderId = i % 2 === 0 ? userA : userB
            const receiverId = senderId === userA ? userB : userA
            const text = sample(conversationSamples)
            currentDate = new Date(currentDate.getTime() + Math.floor(Math.random() * 120) * 60 * 1000)
            const messageId = `message_${String(messageCount + 1).padStart(3, '0')}`
            const docRef = doc(db, 'messages', messageId)
            await setDoc(docRef, { senderId, receiverId, text, read: Math.random() > 0.3, createdAt: currentDate })
            messageCount++
        }
    }
    console.log(`🎉 ${messageCount} messages insérés !`)
}
