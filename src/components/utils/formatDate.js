// FILE: src/components/utils/formatDate.js
import { format, isToday, isTomorrow } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatActivityDate(dateString) {
    const date = new Date(dateString)
    let formatted

    if (isToday(date)) {
        formatted = `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`
    } else if (isTomorrow(date)) {
        formatted = `Demain à ${format(date, 'HH:mm', { locale: fr })}`
    } else {
        formatted = format(date, 'EEEE d MMMM à HH:mm', { locale: fr })
        // Capitaliser la première lettre
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1)
    }

    return formatted
}
