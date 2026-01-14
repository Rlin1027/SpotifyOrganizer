"use client"

import { useState, useCallback } from "react"
import { Search, X } from "lucide-react"

interface SearchBarProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder = "Search songs, artists, albums..." }: SearchBarProps) {
    const [isFocused, setIsFocused] = useState(false)

    return (
        <div className={`relative flex items-center transition-all duration-200 ${isFocused ? 'w-80' : 'w-64'}`}>
            <Search className="absolute left-3 w-4 h-4 text-neutral-500" />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full pl-10 pr-8 py-2 bg-neutral-800 border border-neutral-700 rounded-full text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 text-neutral-500 hover:text-white transition"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    )
}
