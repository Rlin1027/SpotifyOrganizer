"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language, TranslationKey } from './translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = 'spotify-organizer-language'

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('zh') // Default to Chinese
    const [mounted, setMounted] = useState(false)

    // Load language from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null
        if (saved && (saved === 'en' || saved === 'zh')) {
            // Defer update to avoid synchronous state update warning
            setTimeout(() => setLanguageState(saved), 0)
        }
        setTimeout(() => setMounted(true), 0)
    }, [])

    // Save language to localStorage when it changes
    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem(STORAGE_KEY, lang)
    }

    // Translation function
    const t = (key: TranslationKey): string => {
        return translations[language][key] || key
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}

// Language toggle button component
export function LanguageToggle({ className = '' }: { className?: string }) {
    const { language, setLanguage } = useLanguage()

    const toggle = () => {
        setLanguage(language === 'en' ? 'zh' : 'en')
    }

    return (
        <button
            onClick={toggle}
            className={`flex items-center gap-1 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition ${className}`}
            title={language === 'en' ? 'Switch to Chinese' : '切換至英文'}
        >
            <span className="text-base">🌐</span>
            <span className="font-medium">{language === 'en' ? '中' : 'EN'}</span>
        </button>
    )
}
