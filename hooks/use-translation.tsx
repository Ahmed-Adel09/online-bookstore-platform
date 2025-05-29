"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type Language = "en" | "ar" | "fr" | "de" | "es" | "it"

interface TranslationContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  en: {
    // Navigation
    books: "Books",
    newReleases: "New Releases",
    bestSellers: "Best Sellers",
    about: "About",
    premium: "Premium",

    // Actions
    addToCart: "Add to Cart",
    addToBookmark: "Add to Bookmark",
    removeBookmark: "Remove Bookmark",
    preview: "Preview",
    readNow: "Read Now",
    download: "Download",

    // Book Details
    author: "Author",
    publisher: "Publisher",
    publicationDate: "Publication Date",
    pages: "Pages",
    rating: "Rating",
    reviews: "reviews",
    price: "Price",
    format: "Format",
    physicalBook: "Physical Book",
    ebook: "eBook",

    // Preview
    bookPreview: "Book Preview",
    previewPages: "Preview Pages",
    closePreview: "Close Preview",
    page: "Page",

    // Dashboard
    bookshelf: "Bookshelf",
    bookmarks: "Bookmarks",
    readingStats: "Reading Stats",
    totalBooksRead: "Total Books Read",
    hoursSpentReading: "Hours Spent Reading",
    favoriteGenre: "Favorite Genre",
    achievements: "Achievements",

    // Messages
    addedToCart: "Added to cart",
    addedToBookmarks: "Added to bookmarks",
    removedFromBookmarks: "Removed from bookmarks",

    // Languages
    language: "Language",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
  ar: {
    // Navigation
    books: "الكتب",
    newReleases: "الإصدارات الجديدة",
    bestSellers: "الأكثر مبيعاً",
    about: "حول",
    premium: "مميز",

    // Actions
    addToCart: "أضف إلى السلة",
    addToBookmark: "أضف إلى المفضلة",
    removeBookmark: "إزالة من المفضلة",
    preview: "معاينة",
    readNow: "اقرأ الآن",
    download: "تحميل",

    // Book Details
    author: "المؤلف",
    publisher: "الناشر",
    publicationDate: "تاريخ النشر",
    pages: "الصفحات",
    rating: "التقييم",
    reviews: "مراجعات",
    price: "السعر",
    format: "التنسيق",
    physicalBook: "كتاب ورقي",
    ebook: "كتاب إلكتروني",

    // Preview
    bookPreview: "معاينة الكتاب",
    previewPages: "صفحات المعاينة",
    closePreview: "إغلاق المعاينة",
    page: "صفحة",

    // Dashboard
    bookshelf: "رف الكتب",
    bookmarks: "المفضلة",
    readingStats: "إحصائيات القراءة",
    totalBooksRead: "إجمالي الكتب المقروءة",
    hoursSpentReading: "ساعات القراءة",
    favoriteGenre: "النوع المفضل",
    achievements: "الإنجازات",

    // Messages
    addedToCart: "تم إضافته إلى السلة",
    addedToBookmarks: "تم إضافته إلى المفضلة",
    removedFromBookmarks: "تم إزالته من المفضلة",

    // Languages
    language: "اللغة",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
  fr: {
    // Navigation
    books: "Livres",
    newReleases: "Nouveautés",
    bestSellers: "Meilleures ventes",
    about: "À propos",
    premium: "Premium",

    // Actions
    addToCart: "Ajouter au panier",
    addToBookmark: "Ajouter aux favoris",
    removeBookmark: "Retirer des favoris",
    preview: "Aperçu",
    readNow: "Lire maintenant",
    download: "Télécharger",

    // Book Details
    author: "Auteur",
    publisher: "Éditeur",
    publicationDate: "Date de publication",
    pages: "Pages",
    rating: "Note",
    reviews: "avis",
    price: "Prix",
    format: "Format",
    physicalBook: "Livre physique",
    ebook: "Livre numérique",

    // Preview
    bookPreview: "Aperçu du livre",
    previewPages: "Pages d'aperçu",
    closePreview: "Fermer l'aperçu",
    page: "Page",

    // Dashboard
    bookshelf: "Bibliothèque",
    bookmarks: "Favoris",
    readingStats: "Statistiques de lecture",
    totalBooksRead: "Total des livres lus",
    hoursSpentReading: "Heures de lecture",
    favoriteGenre: "Genre préféré",
    achievements: "Réalisations",

    // Messages
    addedToCart: "Ajouté au panier",
    addedToBookmarks: "Ajouté aux favoris",
    removedFromBookmarks: "Retiré des favoris",

    // Languages
    language: "Langue",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
  de: {
    // Navigation
    books: "Bücher",
    newReleases: "Neuerscheinungen",
    bestSellers: "Bestseller",
    about: "Über uns",
    premium: "Premium",

    // Actions
    addToCart: "In den Warenkorb",
    addToBookmark: "Zu Lesezeichen hinzufügen",
    removeBookmark: "Aus Lesezeichen entfernen",
    preview: "Vorschau",
    readNow: "Jetzt lesen",
    download: "Herunterladen",

    // Book Details
    author: "Autor",
    publisher: "Verlag",
    publicationDate: "Veröffentlichungsdatum",
    pages: "Seiten",
    rating: "Bewertung",
    reviews: "Bewertungen",
    price: "Preis",
    format: "Format",
    physicalBook: "Physisches Buch",
    ebook: "E-Book",

    // Preview
    bookPreview: "Buchvorschau",
    previewPages: "Vorschauseiten",
    closePreview: "Vorschau schließen",
    page: "Seite",

    // Dashboard
    bookshelf: "Bücherregal",
    bookmarks: "Lesezeichen",
    readingStats: "Lesestatistiken",
    totalBooksRead: "Gelesene Bücher insgesamt",
    hoursSpentReading: "Lesestunden",
    favoriteGenre: "Lieblingsgenre",
    achievements: "Erfolge",

    // Messages
    addedToCart: "Zum Warenkorb hinzugefügt",
    addedToBookmarks: "Zu Lesezeichen hinzugefügt",
    removedFromBookmarks: "Aus Lesezeichen entfernt",

    // Languages
    language: "Sprache",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
  es: {
    // Navigation
    books: "Libros",
    newReleases: "Novedades",
    bestSellers: "Más vendidos",
    about: "Acerca de",
    premium: "Premium",

    // Actions
    addToCart: "Añadir al carrito",
    addToBookmark: "Añadir a favoritos",
    removeBookmark: "Quitar de favoritos",
    preview: "Vista previa",
    readNow: "Leer ahora",
    download: "Descargar",

    // Book Details
    author: "Autor",
    publisher: "Editorial",
    publicationDate: "Fecha de publicación",
    pages: "Páginas",
    rating: "Calificación",
    reviews: "reseñas",
    price: "Precio",
    format: "Formato",
    physicalBook: "Libro físico",
    ebook: "Libro electrónico",

    // Preview
    bookPreview: "Vista previa del libro",
    previewPages: "Páginas de vista previa",
    closePreview: "Cerrar vista previa",
    page: "Página",

    // Dashboard
    bookshelf: "Estantería",
    bookmarks: "Favoritos",
    readingStats: "Estadísticas de lectura",
    totalBooksRead: "Total de libros leídos",
    hoursSpentReading: "Horas de lectura",
    favoriteGenre: "Género favorito",
    achievements: "Logros",

    // Messages
    addedToCart: "Añadido al carrito",
    addedToBookmarks: "Añadido a favoritos",
    removedFromBookmarks: "Quitado de favoritos",

    // Languages
    language: "Idioma",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
  it: {
    // Navigation
    books: "Libri",
    newReleases: "Nuove uscite",
    bestSellers: "Più venduti",
    about: "Chi siamo",
    premium: "Premium",

    // Actions
    addToCart: "Aggiungi al carrello",
    addToBookmark: "Aggiungi ai preferiti",
    removeBookmark: "Rimuovi dai preferiti",
    preview: "Anteprima",
    readNow: "Leggi ora",
    download: "Scarica",

    // Book Details
    author: "Autore",
    publisher: "Editore",
    publicationDate: "Data di pubblicazione",
    pages: "Pagine",
    rating: "Valutazione",
    reviews: "recensioni",
    price: "Prezzo",
    format: "Formato",
    physicalBook: "Libro fisico",
    ebook: "E-book",

    // Preview
    bookPreview: "Anteprima del libro",
    previewPages: "Pagine di anteprima",
    closePreview: "Chiudi anteprima",
    page: "Pagina",

    // Dashboard
    bookshelf: "Libreria",
    bookmarks: "Preferiti",
    readingStats: "Statistiche di lettura",
    totalBooksRead: "Libri letti totali",
    hoursSpentReading: "Ore di lettura",
    favoriteGenre: "Genere preferito",
    achievements: "Risultati",

    // Messages
    addedToCart: "Aggiunto al carrello",
    addedToBookmarks: "Aggiunto ai preferiti",
    removedFromBookmarks: "Rimosso dai preferiti",

    // Languages
    language: "Lingua",
    english: "English",
    arabic: "العربية",
    french: "Français",
    german: "Deutsch",
    spanish: "Español",
    italian: "Italiano",
  },
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language to localStorage and update document direction
  useEffect(() => {
    localStorage.setItem("language", language)
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key
  }

  const isRTL = language === "ar"

  return (
    <TranslationContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isRTL,
      }}
    >
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider")
  }
  return context
}
