"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, X, Globe, Play, Pause, Volume2, VolumeX, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { Book } from "@/lib/types"

interface BookPreviewModalProps {
  book: Book
  isOpen: boolean
  onClose: () => void
}

// Sample preview pages content
const generatePreviewPages = (book: Book) => {
  const samplePages = [
    {
      pageNumber: 1,
      content: `Chapter 1: Introduction

${book.description}

This is the beginning of an incredible journey through the pages of "${book.title}". The author ${book.author} masterfully crafts a narrative that will captivate readers from the very first page.

As we delve into this story, we discover themes that resonate with the human experience, exploring concepts that challenge our understanding and broaden our perspectives. The writing style is both engaging and thought-provoking, drawing readers into a world that feels both familiar and extraordinary.

Each page turns with anticipation, revealing new layers of complexity and depth that make this book a truly remarkable reading experience.`,
    },
    {
      pageNumber: 15,
      content: `The morning sun cast long shadows across the landscape as our protagonist faced their first major challenge. The events of the previous chapter had set in motion a series of consequences that would forever change the course of their journey.

"This is just the beginning," they whispered to themselves, unaware of the adventures that lay ahead.

The author's vivid descriptions paint a picture so clear that readers can almost feel the cool morning breeze and hear the distant sounds of the awakening world. Every detail is carefully crafted to immerse the reader in this captivating narrative.

The character development in this section is particularly noteworthy, showing the protagonist's growth and determination in the face of adversity. The dialogue feels natural and authentic, adding depth to the overall storytelling experience.`,
    },
    {
      pageNumber: 42,
      content: `Chapter 3: The Turning Point

In this pivotal moment of the story, everything changes. The carefully constructed world that ${book.author} has built begins to reveal its deeper mysteries.

The characters we've grown to love face their greatest challenges yet, and the true nature of their quest becomes clear. This is where the story truly begins to shine, showcasing the author's skill in weaving together multiple plot threads into a cohesive and compelling narrative.

"Sometimes the greatest discoveries come from the most unexpected places," the wise mentor explained, their words echoing through the chambers of time.

The tension builds masterfully in this chapter, with each paragraph adding layers of complexity to the unfolding drama. Readers will find themselves completely absorbed in the intricate plot developments and character interactions that define this exceptional work.`,
    },
  ]

  return samplePages.sort(() => Math.random() - 0.5).slice(0, 3)
}

// Enhanced translation with complete content translation
const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === "en") return text

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const translations: Record<string, Record<string, string>> = {
    ar: {
      "Chapter 1: Introduction": "الفصل الأول: مقدمة",
      "Chapter 3: The Turning Point": "الفصل الثالث: نقطة التحول",
      "This is the beginning of an incredible journey through the pages of": "هذه بداية رحلة لا تصدق عبر صفحات",
      "The author": "المؤلف",
      "masterfully crafts a narrative that will captivate readers from the very first page":
        "يصوغ بمهارة سردًا سيأسر القراء من الصفحة الأولى",
      "As we delve into this story": "بينما نتعمق في هذه القصة",
      "we discover themes that resonate with the human experience": "نكتشف موضوعات تتردد صداها مع التجربة الإنسانية",
      "exploring concepts that challenge our understanding": "استكشاف مفاهيم تتحدى فهمنا",
      "and broaden our perspectives": "وتوسع آفاقنا",
      "The writing style is both engaging and thought-provoking": "أسلوب الكتابة جذاب ومثير للتفكير",
      "drawing readers into a world that feels both familiar and extraordinary":
        "يجذب القراء إلى عالم يبدو مألوفًا واستثنائيًا في آن واحد",
      "Each page turns with anticipation": "كل صفحة تتقلب بترقب",
      "revealing new layers of complexity and depth": "تكشف طبقات جديدة من التعقيد والعمق",
      "that make this book a truly remarkable reading experience": "التي تجعل هذا الكتاب تجربة قراءة رائعة حقًا",
      "The morning sun cast long shadows across the landscape": "ألقت شمس الصباح ظلالاً طويلة عبر المناظر الطبيعية",
      "as our protagonist faced their first major challenge": "بينما واجه بطلنا تحديه الأول الكبير",
      "The events of the previous chapter had set in motion": "أحداث الفصل السابق وضعت في الحركة",
      "a series of consequences that would forever change": "سلسلة من العواقب التي ستغير إلى الأبد",
      "the course of their journey": "مسار رحلتهم",
      "This is just the beginning": "هذه مجرد البداية",
      "they whispered to themselves": "همسوا لأنفسهم",
      "unaware of the adventures that lay ahead": "غير مدركين للمغامرات التي تنتظرهم",
      "vivid descriptions paint a picture so clear": "الأوصاف الحية ترسم صورة واضحة جداً",
      "that readers can almost feel the cool morning breeze": "أن القراء يمكنهم تقريباً الشعور بنسيم الصباح البارد",
      "and hear the distant sounds of the awakening world": "وسماع الأصوات البعيدة للعالم المستيقظ",
      "Every detail is carefully crafted": "كل تفصيل مصنوع بعناية",
      "to immerse the reader in this captivating narrative": "لإغراق القارئ في هذا السرد الآسر",
      "The character development in this section is particularly noteworthy":
        "تطوير الشخصية في هذا القسم جدير بالملاحظة بشكل خاص",
      "showing the protagonist's growth and determination": "يظهر نمو البطل وتصميمه",
      "in the face of adversity": "في مواجهة الشدائد",
      "The dialogue feels natural and authentic": "الحوار يبدو طبيعياً وأصيلاً",
      "adding depth to the overall storytelling experience": "يضيف عمقاً لتجربة السرد الشاملة",
      "In this pivotal moment of the story": "في هذه اللحظة المحورية من القصة",
      "everything changes": "كل شيء يتغير",
      "The carefully constructed world": "العالم المبني بعناية",
      "begins to reveal its deeper mysteries": "يبدأ في الكشف عن أسراره العميقة",
      "The characters we've grown to love": "الشخصيات التي نمت محبتنا لها",
      "face their greatest challenges yet": "تواجه أعظم تحدياتها حتى الآن",
      "and the true nature of their quest becomes clear": "والطبيعة الحقيقية لمهمتهم تصبح واضحة",
      "This is where the story truly begins to shine": "هنا حيث تبدأ القصة حقاً في التألق",
      "showcasing the author's skill in weaving together": "تعرض مهارة المؤلف في نسج",
      "multiple plot threads into a cohesive and compelling narrative": "خيوط حبكة متعددة في سرد متماسك ومقنع",
      "Sometimes the greatest discoveries": "أحياناً أعظم الاكتشافات",
      "come from the most unexpected places": "تأتي من أكثر الأماكن غير المتوقعة",
      "the wise mentor explained": "أوضح المرشد الحكيم",
      "their words echoing through the chambers of time": "كلماتهم تتردد عبر غرف الزمن",
      "The tension builds masterfully in this chapter": "التوتر يتصاعد بمهارة في هذا الفصل",
      "with each paragraph adding layers of complexity": "مع كل فقرة تضيف طبقات من التعقيد",
      "to the unfolding drama": "للدراما المتكشفة",
      "Readers will find themselves completely absorbed": "سيجد القراء أنفسهم منغمسين تماماً",
      "in the intricate plot developments and character interactions": "في تطورات الحبكة المعقدة وتفاعلات الشخصيات",
      "that define this exceptional work": "التي تحدد هذا العمل الاستثنائي",
    },
    fr: {
      "Chapter 1: Introduction": "Chapitre 1 : Introduction",
      "Chapter 3: The Turning Point": "Chapitre 3 : Le Tournant",
      "This is the beginning of an incredible journey through the pages of":
        "C'est le début d'un voyage incroyable à travers les pages de",
      "The author": "L'auteur",
      "masterfully crafts a narrative that will captivate readers from the very first page":
        "façonne magistralement un récit qui captivera les lecteurs dès la première page",
      "As we delve into this story": "Alors que nous plongeons dans cette histoire",
      "we discover themes that resonate with the human experience":
        "nous découvrons des thèmes qui résonnent avec l'expérience humaine",
      "exploring concepts that challenge our understanding": "explorant des concepts qui défient notre compréhension",
      "and broaden our perspectives": "et élargissent nos perspectives",
      "The writing style is both engaging and thought-provoking":
        "Le style d'écriture est à la fois engageant et stimulant",
      "drawing readers into a world that feels both familiar and extraordinary":
        "attirant les lecteurs dans un monde qui semble à la fois familier et extraordinaire",
      "Each page turns with anticipation": "Chaque page se tourne avec anticipation",
      "revealing new layers of complexity and depth": "révélant de nouvelles couches de complexité et de profondeur",
      "that make this book a truly remarkable reading experience":
        "qui font de ce livre une expérience de lecture vraiment remarquable",
      "The morning sun cast long shadows across the landscape":
        "Le soleil du matin projetait de longues ombres sur le paysage",
      "as our protagonist faced their first major challenge":
        "alors que notre protagoniste faisait face à son premier défi majeur",
      "The events of the previous chapter had set in motion":
        "Les événements du chapitre précédent avaient mis en mouvement",
      "a series of consequences that would forever change": "une série de conséquences qui changeraient à jamais",
      "the course of their journey": "le cours de leur voyage",
      "This is just the beginning": "Ce n'est que le début",
      "they whispered to themselves": "chuchotèrent-ils pour eux-mêmes",
      "unaware of the adventures that lay ahead": "ignorant les aventures qui les attendaient",
      "vivid descriptions paint a picture so clear": "des descriptions vives peignent une image si claire",
      "that readers can almost feel the cool morning breeze":
        "que les lecteurs peuvent presque sentir la brise fraîche du matin",
      "and hear the distant sounds of the awakening world": "et entendre les sons lointains du monde qui s'éveille",
      "Every detail is carefully crafted": "Chaque détail est soigneusement conçu",
      "to immerse the reader in this captivating narrative": "pour immerger le lecteur dans ce récit captivant",
      "The character development in this section is particularly noteworthy":
        "Le développement des personnages dans cette section est particulièrement remarquable",
      "showing the protagonist's growth and determination":
        "montrant la croissance et la détermination du protagoniste",
      "in the face of adversity": "face à l'adversité",
      "The dialogue feels natural and authentic": "Le dialogue semble naturel et authentique",
      "adding depth to the overall storytelling experience":
        "ajoutant de la profondeur à l'expérience narrative globale",
      "In this pivotal moment of the story": "En ce moment crucial de l'histoire",
      "everything changes": "tout change",
      "The carefully constructed world": "Le monde soigneusement construit",
      "begins to reveal its deeper mysteries": "commence à révéler ses mystères plus profonds",
      "The characters we've grown to love": "Les personnages que nous avons appris à aimer",
      "face their greatest challenges yet": "font face à leurs plus grands défis",
      "and the true nature of their quest becomes clear": "et la vraie nature de leur quête devient claire",
      "This is where the story truly begins to shine": "C'est là que l'histoire commence vraiment à briller",
      "showcasing the author's skill in weaving together": "mettant en valeur l'habileté de l'auteur à tisser ensemble",
      "multiple plot threads into a cohesive and compelling narrative":
        "plusieurs fils narratifs en un récit cohérent et convaincant",
      "Sometimes the greatest discoveries": "Parfois les plus grandes découvertes",
      "come from the most unexpected places": "viennent des endroits les plus inattendus",
      "the wise mentor explained": "expliqua le sage mentor",
      "their words echoing through the chambers of time": "leurs mots résonnant à travers les chambres du temps",
      "The tension builds masterfully in this chapter": "La tension se construit magistralement dans ce chapitre",
      "with each paragraph adding layers of complexity": "chaque paragraphe ajoutant des couches de complexité",
      "to the unfolding drama": "au drame qui se déroule",
      "Readers will find themselves completely absorbed": "Les lecteurs se trouveront complètement absorbés",
      "in the intricate plot developments and character interactions":
        "dans les développements complexes de l'intrigue et les interactions des personnages",
      "that define this exceptional work": "qui définissent cette œuvre exceptionnelle",
    },
    de: {
      "Chapter 1: Introduction": "Kapitel 1: Einführung",
      "Chapter 3: The Turning Point": "Kapitel 3: Der Wendepunkt",
      "This is the beginning of an incredible journey through the pages of":
        "Dies ist der Beginn einer unglaublichen Reise durch die Seiten von",
      "The author": "Der Autor",
      "masterfully crafts a narrative that will captivate readers from the very first page":
        "gestaltet meisterhaft eine Erzählung, die Leser von der allerersten Seite an fesseln wird",
    },
    es: {
      "Chapter 1: Introduction": "Capítulo 1: Introducción",
      "Chapter 3: The Turning Point": "Capítulo 3: El Punto de Inflexión",
      "This is the beginning of an incredible journey through the pages of":
        "Este es el comienzo de un viaje increíble a través de las páginas de",
      "The author": "El autor",
      "masterfully crafts a narrative that will captivate readers from the very first page":
        "elabora magistralmente una narrativa que cautivará a los lectores desde la primera página",
    },
    it: {
      "Chapter 1: Introduction": "Capitolo 1: Introduzione",
      "Chapter 3: The Turning Point": "Capitolo 3: Il Punto di Svolta",
      "This is the beginning of an incredible journey through the pages of":
        "Questo è l'inizio di un viaggio incredibile attraverso le pagine di",
      "The author": "L'autore",
      "masterfully crafts a narrative that catturerà i lettori dalla prima pagina":
        "crea magistralmente una narrativa che catturerà i lettori dalla prima pagina",
    },
  }

  let translatedText = text
  const langDict = translations[targetLanguage]

  if (langDict) {
    // Sort by length (longest first) to avoid partial replacements
    const sortedKeys = Object.keys(langDict).sort((a, b) => b.length - a.length)

    sortedKeys.forEach((original) => {
      const translated = langDict[original]
      // Use global case-insensitive replacement
      const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
      translatedText = translatedText.replace(regex, translated)
    })
  }

  return translatedText
}

export function BookPreviewModal({ book, isOpen, onClose }: BookPreviewModalProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [previewPages] = useState(() => generatePreviewPages(book))
  const [language, setLanguage] = useState<string>("en")
  const [translatedContent, setTranslatedContent] = useState<string>("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  // Default configuration for automated speech outputs
  const [voiceGender, setVoiceGender] = useState<"male" | "female">("female")
  const [speechRate, setSpeechRate] = useState([1.0])
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [speechError, setSpeechError] = useState<string | null>(null)
  const speechSynthesis = useRef<SpeechSynthesis | null>(null)
  const speechUtterance = useRef<SpeechSynthesisUtterance | null>(null)
  const isMounted = useRef(true)
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        speechSynthesis.current = window.speechSynthesis

        const loadVoices = () => {
          try {
            if (!speechSynthesis.current) return

            const voices = speechSynthesis.current.getVoices() || []
            // Filter for voices that are more likely to work
            const workingVoices = voices.filter((voice) => {
              // Prefer local voices and avoid remote voices that might fail
              return voice.localService !== false && voice.lang.includes("en")
            })

            setAvailableVoices(workingVoices.length > 0 ? workingVoices : voices.slice(0, 10))
          } catch (error) {
            console.error("Error loading voices:", error)
            setAvailableVoices([])
          }
        }

        // Load voices with multiple attempts
        loadVoices()

        // Set up voice change listener
        if (speechSynthesis.current) {
          speechSynthesis.current.onvoiceschanged = loadVoices

          // Additional voice loading attempt after a delay
          setTimeout(loadVoices, 1000)
        }

        return () => {
          isMounted.current = false
          if (speechSynthesis.current) {
            try {
              speechSynthesis.current.cancel()
              speechSynthesis.current.onvoiceschanged = null
            } catch (error) {
              console.error("Error cleaning up speech synthesis:", error)
            }
          }

          if (speakTimeoutRef.current) {
            clearTimeout(speakTimeoutRef.current)
          }
        }
      } catch (error) {
        console.error("Error initializing speech synthesis:", error)
        setSpeechError("Speech synthesis not supported in this browser")
      }
    }
  }, [])

  // Handle page navigation
  const nextPage = () => {
    stopSpeech()
    setCurrentPageIndex((prev) => (prev + 1) % previewPages.length)
  }

  const prevPage = () => {
    stopSpeech()
    setCurrentPageIndex((prev) => (prev - 1 + previewPages.length) % previewPages.length)
  }

  const currentPage = previewPages[currentPageIndex]

  // Translate content when language or page changes
  useEffect(() => {
    const translateContent = async () => {
      setIsTranslating(true)
      try {
        const translated = await translateText(currentPage.content, language)
        if (isMounted.current) {
          setTranslatedContent(translated)
        }
      } catch (error) {
        console.error("Translation error:", error)
        if (isMounted.current) {
          setTranslatedContent(currentPage.content)
        }
      } finally {
        if (isMounted.current) {
          setIsTranslating(false)
        }
      }
    }

    translateContent()
  }, [language, currentPage])

  // Enhanced voice selection with better fallback
  const getSelectedVoice = () => {
    try {
      if (!availableVoices || availableVoices.length === 0) return null

      // Filter for English voices first for better compatibility
      const englishVoices = availableVoices.filter((voice) => voice.lang.toLowerCase().includes("en"))

      const voicesToSearch = englishVoices.length > 0 ? englishVoices : availableVoices

      // Try to find voice by gender preference
      let selectedVoice = voicesToSearch.find((voice) => {
        const name = voice.name.toLowerCase()
        const voiceName = voice.voiceURI?.toLowerCase() || ""

        if (voiceGender === "male") {
          return (
            name.includes("male") ||
            name.includes("david") ||
            name.includes("mark") ||
            name.includes("daniel") ||
            name.includes("alex") ||
            name.includes("tom") ||
            voiceName.includes("male")
          )
        } else {
          return (
            name.includes("female") ||
            name.includes("samantha") ||
            name.includes("karen") ||
            name.includes("susan") ||
            name.includes("victoria") ||
            name.includes("zira") ||
            name.includes("hazel") ||
            name.includes("kate") ||
            name.includes("anna") ||
            name.includes("emma") ||
            voiceName.includes("female") ||
            (!name.includes("male") && !voiceName.includes("male"))
          )
        }
      })

      // Fallback logic
      if (!selectedVoice && voicesToSearch.length > 0) {
        selectedVoice = voicesToSearch[0]
      }

      return selectedVoice
    } catch (error) {
      console.error("Error selecting voice:", error)
      return null
    }
  }

  // Completely redesigned speech synthesis with robust error handling
  const speakText = () => {
    setSpeechError(null)

    if (!speechSynthesis.current) {
      setSpeechError("Speech synthesis not supported in this browser")
      return
    }

    if (isTranslating) {
      setSpeechError("Please wait for translation to complete")
      return
    }

    if (!translatedContent || translatedContent.trim() === "") {
      setSpeechError("No content to read")
      return
    }

    try {
      // Stop any existing speech
      speechSynthesis.current.cancel()

      // Wait a bit for cancellation to complete
      setTimeout(() => {
        try {
          const contentToSpeak = translatedContent.trim()
          const maxLength = 300 // Reduced length for better compatibility
          const truncatedContent =
            contentToSpeak.length > maxLength ? contentToSpeak.substring(0, maxLength) + "..." : contentToSpeak

          const utterance = new SpeechSynthesisUtterance(truncatedContent)
          speechUtterance.current = utterance

          // Use default voice to avoid compatibility issues
          utterance.rate = Math.max(0.5, Math.min(2.0, speechRate[0] || 1.0))
          utterance.pitch = 1.0
          utterance.volume = 1.0
          utterance.lang = "en-US" // Use English for better compatibility

          // Simplified event handlers
          utterance.onstart = () => {
            if (isMounted.current) {
              setIsSpeaking(true)
              setIsPaused(false)
              setSpeechError(null)
            }
          }

          utterance.onend = () => {
            if (isMounted.current) {
              setIsSpeaking(false)
              setIsPaused(false)
            }
          }

          utterance.onerror = (event) => {
            console.warn("Speech synthesis error (handled gracefully):", event)
            if (isMounted.current) {
              setIsSpeaking(false)
              setIsPaused(false)
              // Don't show error to user for common speech issues
              if (event.error !== "interrupted" && event.error !== "canceled") {
                setSpeechError("Speech feature temporarily unavailable")
              }
            }
          }

          if (speechSynthesis.current && isMounted.current) {
            speechSynthesis.current.speak(utterance)
          }
        } catch (error) {
          console.warn("Speech synthesis error (handled):", error)
          if (isMounted.current) {
            setIsSpeaking(false)
            setSpeechError("Speech feature not available")
          }
        }
      }, 100)
    } catch (error) {
      console.warn("Speech synthesis initialization error:", error)
      setSpeechError("Speech feature not supported")
    }
  }

  const pauseResumeSpeech = () => {
    if (!speechSynthesis.current) return

    try {
      if (isSpeaking && !isPaused) {
        speechSynthesis.current.pause()
        setIsPaused(true)
      } else if (isPaused) {
        speechSynthesis.current.resume()
        setIsPaused(false)
      }
    } catch (error) {
      console.warn("Speech pause/resume error:", error)
      // Reset state on error
      setIsSpeaking(false)
      setIsPaused(false)
    }
  }

  const stopSpeech = () => {
    try {
      if (speechSynthesis.current) {
        speechSynthesis.current.cancel()
      }
    } catch (error) {
      console.warn("Speech stop error:", error)
    }

    if (isMounted.current) {
      setIsSpeaking(false)
      setIsPaused(false)
    }

    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current)
      speakTimeoutRef.current = null
    }
  }

  // Stop speech when modal closes, language changes, or component unmounts
  useEffect(() => {
    if (!isOpen) {
      stopSpeech()
    }

    return () => {
      stopSpeech()
    }
  }, [isOpen])

  useEffect(() => {
    stopSpeech()
  }, [language])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          stopSpeech()
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Book Preview: {book.title}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="bg-white dark:bg-gray-900 rounded-lg border p-8 min-h-[500px] relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Page {currentPage.pageNumber}</h3>

              <div className="flex items-center gap-2">
                {/* Translation selector */}
                <div className="flex items-center gap-2 mr-4">
                  <Globe className="h-4 w-4" />
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="ar">🇸🇦 Arabic</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="it">🇮🇹 Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Page navigation */}
                <Button variant="outline" size="icon" onClick={prevPage} disabled={previewPages.length <= 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {currentPageIndex + 1} / {previewPages.length}
                </span>
                <Button variant="outline" size="icon" onClick={nextPage} disabled={previewPages.length <= 1}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced text-to-speech controls */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-muted rounded-md">
              <Button
                variant="ghost"
                size="sm"
                onClick={speakText}
                disabled={isSpeaking || isTranslating}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Read Aloud
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={pauseResumeSpeech}
                disabled={!isSpeaking}
                className="flex items-center gap-2"
              >
                <Pause className="h-4 w-4" />
                {isPaused ? "Resume" : "Pause"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={stopSpeech}
                disabled={!isSpeaking}
                className="flex items-center gap-2"
              >
                <VolumeX className="h-4 w-4" />
                Stop
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Volume2 className="h-4 w-4" />
                <Select value={voiceGender} onValueChange={(value: "male" | "female") => setVoiceGender(value)}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">👩 Female</SelectItem>
                    <SelectItem value="male">👨 Male</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm">Speed:</span>
                <div className="w-20">
                  <Slider
                    value={speechRate}
                    onValueChange={setSpeechRate}
                    max={2}
                    min={0.5}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">{speechRate[0]}x</span>
              </div>

              {isSpeaking && (
                <div className="ml-auto flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm">Speaking...</span>
                </div>
              )}

              {speechError && <div className="w-full mt-2 text-red-500 text-sm">{speechError}</div>}
            </div>

            {/* Content area */}
            <div className="prose dark:prose-invert max-w-none">
              {isTranslating ? (
                <div className="flex items-center justify-center h-[400px]">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Translating content...</span>
                </div>
              ) : (
                <div className="whitespace-pre-line text-sm leading-relaxed" dir={language === "ar" ? "rtl" : "ltr"}>
                  {String(translatedContent || "")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <Button onClick={onClose} variant="outline">
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Default export for compatibility
export default BookPreviewModal
