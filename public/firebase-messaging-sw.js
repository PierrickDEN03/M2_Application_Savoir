// public/firebase-messaging-sw.js
/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/11.0.1/firebase-messaging-compat.js')

firebase.initializeApp({
    apiKey: 'AIzaSyAGXaaE1BDvm-h8vdtAzx1-InBhH0nFq0c',
    authDomain: 'm2applicationsavoir.firebaseapp.com',
    projectId: 'm2applicationsavoir',
    storageBucket: 'm2applicationsavoir.appspot.com',
    messagingSenderId: '302099366829',
    appId: '1:302099366829:web:4a62ae2cdb44785a651724',
})

const messaging = firebase.messaging()

// Quand une notif arrive en arrière-plan
messaging.onBackgroundMessage((payload) => {
    console.log('Message reçu en arrière-plan:', payload)
    const notificationTitle = payload.notification.title
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png',
    }

    self.registration.showNotification(notificationTitle, notificationOptions)
})
