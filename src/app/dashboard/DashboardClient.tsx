"use client"

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Loader2, ChevronDown, ChevronRight, Plus, Check, ExternalLink, X, Edit3, Home, LogOut, Copy, Trash2, Merge, Square, CheckSquare } from "lucide-react"
import { useLanguage, LanguageToggle } from "@/lib/i18n/LanguageContext"
import { useToast } from "@/app/components/Toast"
import SearchBar from "@/app/components/SearchBar"
import ProgressBar from "@/app/components/ProgressBar"

interface User {
    id: string
    name: string
    email: string
    image?: string
}

interface Track {
    track: {
        id: string
        name: string
        uri: string
        artists: { name: string; id: string }[]
        album: {
            images: { url: string }[]
            release_date: string
        }
    }
}

interface DashboardClientProps {
    accessToken: string
    user: User
}

interface CreatedPlaylist {
    groupName: string
    playlistUrl: string
    playlistName: string
}

// --- Smart Emoji & Naming Logic ---

const EMOJI_MAP: Record<string, string> = {
    // Decades
    "2020's": "🔮",
    "2010's": "🔥",
    "2000's": "💿",
    "1990's": "📼",
    "1980's": "🕹️",
    "1970's": "🕺",
    "1960's": "☮️",

    // Genres
    "Pop": "🍭",
    "Rock": "🎸",
    "Hip-Hop": "🎤",
    "Electronic": "⚡",
    "Jazz": "🎷",
    "R&B": "🌹",
    "Classical": "🎻",
    "Metal": "🤘",
    "Country": "🤠",
    "K-Pop": "🇰🇷",
    "J-Pop": "🇯🇵",
    "Anime": "🏯",
    "Game": "🎮",
    "Other": "🎶",

    // Moods
    "High Energy": "🔥",
    "Chill/Acoustic": "☕",
    "Sad/Melancholic": "😭",
    "Dance": "💃"
}

function getSmartPlaylistName(groupBy: "year" | "genre" | "mood", groupName: string): string {
    const emoji = EMOJI_MAP[groupName] || "🎵"
    const dateSuffix = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    if (groupBy === "year") {
        // e.g. "📼 1990's Collection (2024-05-01)"
        return `${emoji} ${groupName} Collection (${dateSuffix})`
    } else if (groupBy === "mood") {
        // e.g. "🔥 High Energy Mix (2024-05-01)"
        return `${emoji} ${groupName} Mix (${dateSuffix})`
    } else {
        // e.g. "🎸 Best of Rock (2024-05-01)"
        return `${emoji} Best of ${groupName} (${dateSuffix})`
    }
}

// --- Helper Functions ---

function getDecade(releaseDate: string): string {
    const year = parseInt(releaseDate.split('-')[0])
    const decade = Math.floor(year / 10) * 10
    return `${decade}'s`
}

function groupByDecade(tracks: Track[]): Map<string, Track[]> {
    const groups = new Map<string, Track[]>()
    tracks.forEach(item => {
        const decade = getDecade(item.track.album.release_date)
        if (!groups.has(decade)) groups.set(decade, [])
        groups.get(decade)!.push(item)
    })
    return new Map([...groups.entries()].sort((a, b) => parseInt(b[0]) - parseInt(a[0])))
}

function groupByGenre(tracks: Track[], genreMapping: Record<string, string>): Map<string, Track[]> {
    const groups = new Map<string, Track[]>()
    tracks.forEach(item => {
        const firstArtistId = item.track.artists[0]?.id
        const genre = firstArtistId && genreMapping[firstArtistId] ? genreMapping[firstArtistId] : 'Other'
        if (!groups.has(genre)) groups.set(genre, [])
        groups.get(genre)!.push(item)
    })
    return new Map([...groups.entries()].sort((a, b) => b[1].length - a[1].length))
}

// Mood Inference from Genre (Fallback since Spotify Audio Features API is deprecated)
const MOOD_FROM_GENRE: Record<string, string> = {
    'Pop': 'High Energy',
    'Dance': 'High Energy',
    'Electronic': 'High Energy',
    'Techno': 'High Energy',
    'Trance': 'High Energy',
    'House': 'High Energy',
    'Hip-Hop': 'High Energy',
    'Trap': 'High Energy',
    'Rock': 'High Energy',
    'Metal': 'High Energy',
    'Punk': 'High Energy',

    'R&B': 'Chill/Vibe',
    'Soul': 'Chill/Vibe',
    'Jazz': 'Chill/Vibe',
    'Vaporwave': 'Chill/Vibe',
    'Lo-fi': 'Chill/Vibe',
    'Ambient': 'Chill/Vibe',
    'Country': 'Chill/Vibe',
    'Folk': 'Chill/Vibe',
    'Acoustic': 'Chill/Vibe',
    'Classical': 'Calm/Focus',

    'Indie': 'Cool/Alternative',
    'Alternative': 'Cool/Alternative',

    'Anime': 'Geek/Fun',
    'Game': 'Geek/Fun',
}

function groupByMood(tracks: Track[], genreMap: Record<string, string>): Map<string, Track[]> {
    const groups = new Map<string, Track[]>()
    groups.set("High Energy", [])
    groups.set("Chill/Vibe", [])
    groups.set("Calm/Focus", [])
    groups.set("Cool/Alternative", [])
    groups.set("Geek/Fun", [])
    groups.set("Other", [])

    // We don't really need "Unknown" as much if we have Other, but let's see.

    tracks.forEach(item => {
        // Get main artist genre
        const artistId = item.track.artists[0]?.id
        const genre = genreMap[artistId] || 'Other'

        const mood = MOOD_FROM_GENRE[genre] || 'Other'

        if (groups.has(mood)) {
            groups.get(mood)!.push(item)
        } else {
            groups.get("Other")!.push(item)
        }
    })

    // Remove empty groups
    for (const [key, value] of groups.entries()) {
        if (value.length === 0) {
            groups.delete(key)
        }
    }

    // Sort by count
    return new Map([...groups.entries()].sort((a, b) => b[1].length - a[1].length))
}

// --- Duplicate Detection ---

interface DuplicateGroup {
    key: string // normalized song name + artist
    tracks: Track[]
}

function findDuplicates(tracks: Track[]): DuplicateGroup[] {
    const trackMap = new Map<string, Track[]>()

    tracks.forEach(item => {
        // Create a normalized key: lowercase song name + first artist name
        const songName = item.track.name.toLowerCase().trim()
        const artistName = item.track.artists[0]?.name.toLowerCase().trim() || ''
        const key = `${songName}::${artistName}`

        if (!trackMap.has(key)) {
            trackMap.set(key, [])
        }
        trackMap.get(key)!.push(item)
    })

    // Filter to only groups with more than 1 track (duplicates)
    const duplicates: DuplicateGroup[] = []
    trackMap.forEach((trackList, key) => {
        if (trackList.length > 1) {
            duplicates.push({ key, tracks: trackList })
        }
    })

    // Sort by number of duplicates (most first)
    return duplicates.sort((a, b) => b.tracks.length - a.tracks.length)
}


// --- Components ---

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (name: string, description: string) => void
    initialName: string
    initialDescription: string
    isCreating: boolean
}

function CreatePlaylistModal({ isOpen, onClose, onConfirm, initialName, initialDescription, isCreating }: ModalProps) {
    const [name, setName] = useState(initialName)
    const [description, setDescription] = useState(initialDescription)

    // Reset state when modal opens
    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            const t = setTimeout(() => {
                setName(initialName)
                setDescription(initialDescription)
            }, 0)
            return () => clearTimeout(t)
        }
    }, [isOpen, initialName, initialDescription])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent mb-6">
                    Customize Playlist
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Playlist Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none transition resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(name, description)}
                        disabled={isCreating || !name.trim()}
                        className="flex-1 py-3 rounded-full bg-green-600 hover:bg-green-500 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Playlist"
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}


export default function DashboardClient({ accessToken: _accessToken, user }: DashboardClientProps) {
    const { t } = useLanguage()
    const { addToast } = useToast()

    const [tracks, setTracks] = useState<Track[]>([])
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState("Ready")
    const [groupBy, setGroupBy] = useState<"year" | "genre" | "mood" | "none">("none")
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

    // Search State
    const [searchQuery, setSearchQuery] = useState('')

    // Loading Progress State
    const [loadProgress, _setLoadProgress] = useState<{ current: number; total: number | null }>({ current: 0, total: null })

    // Data State
    const [genreMapping, setGenreMapping] = useState<Record<string, string>>({})
    const [loadingGenres, setLoadingGenres] = useState(false)

    const [creatingPlaylistGroup, setCreatingPlaylistGroup] = useState<string | null>(null)
    const [createdPlaylists, setCreatedPlaylists] = useState<CreatedPlaylist[]>([])

    // Modal State
    const [modalOpen, setModalOpen] = useState(false)
    const [pendingPlaylist, setPendingPlaylist] = useState<{ groupName: string, tracks: Track[] } | null>(null)

    // Duplicate Detection State
    const [showDuplicates, setShowDuplicates] = useState(false)
    const [excludedTracks, setExcludedTracks] = useState<Set<string>>(new Set())

    // Merge State
    const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set())
    const [mergeModalOpen, setMergeModalOpen] = useState(false)
    const [mergeName, setMergeName] = useState('')
    const [mergeDescription, setMergeDescription] = useState('')
    const [isMerging, setIsMerging] = useState(false)

    // Memoized grouped data
    const groupedByDecade = useMemo(() => groupByDecade(tracks), [tracks])
    const groupedByGenre = useMemo(() => groupByGenre(tracks, genreMapping), [tracks, genreMapping])
    const groupedByMood = useMemo(() => {
        if (groupBy !== "mood") return new Map()
        return groupByMood(tracks, genreMapping)
    }, [tracks, groupBy, genreMapping])

    // Duplicate detection
    const duplicates = useMemo(() => findDuplicates(tracks), [tracks])
    const totalDuplicateCount = useMemo(() =>
        duplicates.reduce((sum, group) => sum + group.tracks.length - 1, 0),
        [duplicates]
    )

    // Filtered tracks (excluding user-selected duplicates)
    const filteredTracks = useMemo(() =>
        tracks.filter(t => !excludedTracks.has(t.track.id)),
        [tracks, excludedTracks]
    )

    // Search filtering
    const searchFilteredTracks = useMemo(() => {
        if (!searchQuery.trim()) return filteredTracks
        const query = searchQuery.toLowerCase()
        return filteredTracks.filter(t =>
            t.track.name.toLowerCase().includes(query) ||
            t.track.artists.some(a => a.name.toLowerCase().includes(query)) ||
            t.track.album.release_date.includes(query)
        )
    }, [filteredTracks, searchQuery])

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(group))
                newSet.delete(group)
            else
                newSet.add(group)
            return newSet
        })
    }

    const expandAll = () => {
        if (groupBy === "year") setExpandedGroups(new Set(groupedByDecade.keys()))
        else if (groupBy === "genre") setExpandedGroups(new Set(groupedByGenre.keys()))
        else if (groupBy === "mood") setExpandedGroups(new Set(groupedByMood.keys()))
    }

    const collapseAll = () => setExpandedGroups(new Set())

    // Fetch Genres Logic
    const fetchGenres = async () => {
        if (Object.keys(genreMapping).length > 0) return
        setLoadingGenres(true)
        try {
            const artistIds = new Set<string>()
            tracks.forEach(item => item.track.artists.forEach(artist => artistIds.add(artist.id)))
            const res = await fetch('/api/genres', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ artistIds: Array.from(artistIds) })
            })
            const data = await res.json()
            if (data.genres) {
                setGenreMapping(data.genres)
                setExpandedGroups(new Set())
            }
        } catch (error) {
            console.error("Failed to fetch genres:", error)
        } finally {
            setLoadingGenres(false)
        }
    }

    const handleGroupByChange = async (newGroupBy: "year" | "genre" | "mood" | "none") => {
        if (newGroupBy === groupBy) {
            setGroupBy("none")
            setExpandedGroups(new Set())
            return
        }
        setGroupBy(newGroupBy)
        setExpandedGroups(new Set()) // Reset expanded groups on new groupBy selection

        if (newGroupBy === "genre" && Object.keys(genreMapping).length === 0) await fetchGenres()
        // Determine Mood from Genre now
        if (newGroupBy === "mood" && Object.keys(genreMapping).length === 0) await fetchGenres()

        if (newGroupBy !== "none") {
            setTimeout(() => {
                let groups
                if (newGroupBy === "year") groups = groupedByDecade
                else if (newGroupBy === "genre") groups = groupedByGenre
                else if (newGroupBy === "mood") groups = groupedByMood

                const firstGroup = groups ? Array.from(groups.keys())[0] : null
                if (firstGroup) setExpandedGroups(new Set([firstGroup]))
            }, 100)
        }
    }

    // Open Modal logic
    const initiateCreatePlaylist = (groupName: string, groupTracks: Track[]) => {
        setPendingPlaylist({ groupName, tracks: groupTracks })
        setModalOpen(true)
    }

    // API Call logic
    const confirmCreatePlaylist = async (customName: string, customDescription: string) => {
        if (!pendingPlaylist || !groupBy || groupBy === 'none') return

        const { groupName, tracks: groupTracks } = pendingPlaylist
        setCreatingPlaylistGroup(groupName)

        try {
            const trackUris = groupTracks.map(item => item.track.uri)

            const res = await fetch('/api/playlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: customName,
                    trackUris,
                    description: customDescription
                })
            })

            const data = await res.json()

            if (data.success) {
                setCreatedPlaylists(prev => [...prev, {
                    groupName,
                    playlistUrl: data.playlist.url,
                    playlistName: data.playlist.name
                }])
                setModalOpen(false) // Close modal on success
            } else {
                addToast(`Failed to create playlist: ${data.error}`, 'error')
            }
        } catch (error) {
            console.error("Error creating playlist:", error)
            addToast("Failed to create playlist", 'error')
        } finally {
            setCreatingPlaylistGroup(null) // Stop loading state
        }
    }

    const isPlaylistCreated = (groupName: string) => createdPlaylists.some(p => p.groupName === groupName)
    const getPlaylistUrl = (groupName: string) => createdPlaylists.find(p => p.groupName === groupName)?.playlistUrl

    // Generate initial modal data
    const modalInitialData = useMemo(() => {
        if (!pendingPlaylist || groupBy === 'none') return { name: '', description: '' }

        const name = getSmartPlaylistName(groupBy, pendingPlaylist.groupName)
        const description = `This playlist contains ${pendingPlaylist.tracks.length} ${pendingPlaylist.groupName} highlights. Auto-generated by Spotify Organizer.`

        return { name, description }
    }, [pendingPlaylist, groupBy])


    const renderGroupView = (groups: Map<string, Track[]>, labelColor: string) => (
        <div className="space-y-4">
            {/* Merge Controls */}
            {selectedGroups.size > 1 && (
                <div className="flex items-center justify-between p-4 bg-purple-900/30 border border-purple-600/30 rounded-lg">
                    <span className="text-purple-300">
                        <Merge className="w-4 h-4 inline mr-2" />
                        {selectedGroups.size} groups selected for merge
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSelectedGroups(new Set())}
                            className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-sm"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => {
                                const groupNames = Array.from(selectedGroups)
                                setMergeName(`🎵 ${groupNames.join(' + ')} Mix`)
                                setMergeDescription(`Merged playlist: ${groupNames.join(', ')}`)
                                setMergeModalOpen(true)
                            }}
                            className="px-4 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm font-medium"
                        >
                            Merge Selected
                        </button>
                    </div>
                </div>
            )}

            {Array.from(groups.entries()).map(([groupName, groupTracks]) => (
                <div key={groupName} className="bg-neutral-900/30 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 hover:bg-neutral-900/50 transition">
                        {/* Merge Checkbox */}
                        <button
                            onClick={() => {
                                setSelectedGroups(prev => {
                                    const newSet = new Set(prev)
                                    if (newSet.has(groupName)) {
                                        newSet.delete(groupName)
                                    } else {
                                        newSet.add(groupName)
                                    }
                                    return newSet
                                })
                            }}
                            className="mr-3 text-neutral-400 hover:text-purple-400 transition"
                        >
                            {selectedGroups.has(groupName) ? (
                                <CheckSquare className="w-5 h-5 text-purple-400" />
                            ) : (
                                <Square className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={() => toggleGroup(groupName)}
                            className="flex items-center gap-3 flex-1"
                        >
                            {expandedGroups.has(groupName) ? (
                                <ChevronDown className="w-5 h-5 text-green-500" />
                            ) : (
                                <ChevronRight className="w-5 h-5 text-neutral-500" />
                            )}
                            <span className={`text-xl font-bold ${labelColor}`}>{groupName}</span>
                            <span className="text-neutral-500">({groupTracks.length} songs)</span>
                        </button>

                        {isPlaylistCreated(groupName) ? (
                            <a
                                href={getPlaylistUrl(groupName)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-full text-sm font-medium hover:bg-green-500 transition"
                            >
                                <Check className="w-4 h-4" />
                                Open in Spotify
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        ) : (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    initiateCreatePlaylist(groupName, groupTracks)
                                }}
                                disabled={creatingPlaylistGroup === groupName}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${creatingPlaylistGroup === groupName
                                    ? 'bg-neutral-700 text-neutral-400 cursor-wait'
                                    : 'bg-neutral-800 hover:bg-green-600 hover:text-white'
                                    }`}
                            >
                                {creatingPlaylistGroup === groupName ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-4 h-4" />
                                        Customize & Create
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {expandedGroups.has(groupName) && (
                        <div className="px-4 pb-4 space-y-2">
                            {groupTracks.slice(0, 50).map((item, idx) => (
                                <div
                                    key={item.track.id + idx}
                                    className="flex items-center gap-4 p-3 bg-neutral-900/50 rounded-lg hover:bg-neutral-800 transition"
                                >
                                    <img
                                        src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                                        className="w-10 h-10 rounded"
                                        alt={item.track.name}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{item.track.name}</div>
                                        <div className="text-sm text-neutral-400 truncate">
                                            {item.track.artists.map(a => a.name).join(", ")} • {item.track.album.release_date.split('-')[0]}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {groupTracks.length > 50 && (
                                <p className="text-center text-neutral-500 py-2">
                                    +{groupTracks.length - 50} more songs...
                                </p>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {/* Create All Button */}
            <div className="flex justify-center pt-4">
                <button
                    onClick={async () => {
                        if (!confirm(`This will automatically create ${groups.size - createdPlaylists.length} playlists with default names like "🎵 [Category] Collection". Continue?`)) return;

                        for (const [groupName, groupTracks] of groups.entries()) {
                            if (!isPlaylistCreated(groupName)) {
                                const smartName = getSmartPlaylistName(groupBy as "year" | "genre" | "mood", groupName)
                                setCreatingPlaylistGroup(groupName)
                                try {
                                    const trackUris = groupTracks.map(item => item.track.uri)
                                    const res = await fetch('/api/playlists', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            name: smartName,
                                            trackUris,
                                            description: `Bulk created via Spotify Organizer`
                                        })
                                    })
                                    const data = await res.json()
                                    if (data.success) {
                                        setCreatedPlaylists(prev => [...prev, {
                                            groupName,
                                            playlistUrl: data.playlist.url,
                                            playlistName: data.playlist.name
                                        }])
                                    }
                                } catch (e) { console.error(e) }
                                setCreatingPlaylistGroup(null)
                            }
                        }
                    }}
                    disabled={creatingPlaylistGroup !== null}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-full font-bold hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Bulk Create All (Auto-Named)
                </button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8">
            {/* Modal Injection */}
            <CreatePlaylistModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={confirmCreatePlaylist}
                initialName={modalInitialData.name}
                initialDescription={modalInitialData.description}
                isCreating={creatingPlaylistGroup !== null}
            />

            {/* Merge Modal */}
            {mergeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setMergeModalOpen(false)} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                            <Merge className="w-6 h-6 text-purple-400" />
                            Merge Playlists
                        </h2>

                        <p className="text-sm text-neutral-400 mb-4">
                            Merging: {Array.from(selectedGroups).join(', ')}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Playlist Name</label>
                                <input
                                    type="text"
                                    value={mergeName}
                                    onChange={(e) => setMergeName(e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-1">Description</label>
                                <textarea
                                    value={mergeDescription}
                                    onChange={(e) => setMergeDescription(e.target.value)}
                                    rows={2}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none transition resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setMergeModalOpen(false)}
                                className="flex-1 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsMerging(true)
                                    try {
                                        // Collect all tracks from selected groups
                                        const currentGroups = groupBy === 'year' ? groupedByDecade :
                                            groupBy === 'genre' ? groupedByGenre :
                                                groupBy === 'mood' ? groupedByMood : new Map()

                                        const allTrackUris: string[] = []
                                        selectedGroups.forEach(groupName => {
                                            const groupTracks = currentGroups.get(groupName) || []
                                            groupTracks.forEach((t: Track) => {
                                                if (!excludedTracks.has(t.track.id)) {
                                                    allTrackUris.push(t.track.uri)
                                                }
                                            })
                                        })

                                        const res = await fetch('/api/playlists', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                name: mergeName,
                                                trackUris: allTrackUris,
                                                description: mergeDescription
                                            })
                                        })

                                        const data = await res.json()
                                        if (data.success) {
                                            addToast(`Created merged playlist: ${data.playlist.name}`, 'success')
                                            setCreatedPlaylists(prev => [...prev, {
                                                groupName: `Merged: ${Array.from(selectedGroups).join('+')}`,
                                                playlistUrl: data.playlist.url,
                                                playlistName: data.playlist.name
                                            }])
                                            setSelectedGroups(new Set())
                                            setMergeModalOpen(false)
                                        } else {
                                            addToast(`Failed to merge: ${data.error}`, 'error')
                                        }
                                    } catch (error) {
                                        console.error('Merge error:', error)
                                        addToast('Failed to create merged playlist', 'error')
                                    } finally {
                                        setIsMerging(false)
                                    }
                                }}
                                disabled={isMerging || !mergeName.trim()}
                                className="flex-1 py-3 rounded-full bg-purple-600 hover:bg-purple-500 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isMerging ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Merging...
                                    </>
                                ) : (
                                    <>
                                        <Merge className="w-4 h-4" />
                                        Create Merged Playlist
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-green-500">{t('myLibrary')}</h1>
                <div className="flex gap-4 items-center flex-wrap">
                    <span className="text-neutral-400">
                        {searchQuery ? `${searchFilteredTracks.length} / ${tracks.length}` : `${t('totalSongs')}: ${tracks.length}`}
                    </span>
                    {/* Search Bar */}
                    {tracks.length > 0 && (
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Search songs, artists..."
                        />
                    )}
                    {/* Duplicate Detection Button */}

                    {duplicates.length > 0 && (
                        <button
                            onClick={() => setShowDuplicates(!showDuplicates)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${showDuplicates ? 'bg-orange-600' : 'bg-orange-900/50 hover:bg-orange-800'}`}
                        >
                            <Copy className="w-4 h-4" />
                            {totalDuplicateCount} Duplicates
                        </button>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleGroupByChange("year")}
                            className={`px-4 py-2 rounded-full transition ${groupBy === 'year' ? 'bg-green-600' : 'bg-neutral-800 hover:bg-neutral-700'}`}
                        >
                            {t('byDecade')}
                        </button>
                        <button
                            onClick={() => handleGroupByChange("genre")}
                            disabled={loadingGenres}
                            className={`px-4 py-2 rounded-full transition ${groupBy === 'genre' ? 'bg-blue-600' : 'bg-neutral-800 hover:bg-neutral-700'} ${loadingGenres ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {loadingGenres ? t('loading') : t('byGenre')}
                        </button>
                        <button
                            onClick={() => handleGroupByChange("mood")}
                            disabled={loadingGenres}
                            className={`px-4 py-2 rounded-full transition ${groupBy === 'mood' ? 'bg-purple-600' : 'bg-neutral-800 hover:bg-neutral-700'} ${loadingGenres ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {loadingGenres ? t('loading') : t('byMood')}
                        </button>
                    </div>
                    {groupBy !== "none" && (
                        <div className="flex gap-2">
                            <button onClick={expandAll} className="px-3 py-1 text-sm bg-neutral-800 rounded hover:bg-neutral-700">
                                {t('expandAll')}
                            </button>
                            <button onClick={collapseAll} className="px-3 py-1 text-sm bg-neutral-800 rounded hover:bg-neutral-700">
                                {t('collapseAll')}
                            </button>
                        </div>
                    )}

                    {/* User Actions */}
                    <div className="flex items-center gap-2">
                        {user.image && (
                            <img src={user.image} className="w-10 h-10 rounded-full" alt={user.name} />
                        )}
                        <LanguageToggle />
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-full text-sm transition"
                            title={t('home')}
                        >
                            <Home className="w-4 h-4" />
                        </Link>
                        <a
                            href="/api/spotify/logout"
                            className="flex items-center gap-2 px-3 py-2 bg-red-900/50 hover:bg-red-800 text-red-400 hover:text-white rounded-full text-sm transition"
                            title={t('logout')}
                        >
                            <LogOut className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Success Message - Enhanced */}
            {createdPlaylists.length > 0 && (
                <div className="mb-6 animate-in slide-in-from-top duration-300">
                    <div className="p-4 bg-green-900/30 border border-green-600/50 rounded-lg flex gap-3 items-center">
                        <Check className="w-5 h-5 text-green-400" />
                        <div>
                            <p className="text-green-400 font-medium">
                                {t('successCreated')} {createdPlaylists.length} {t('playlists')}
                            </p>
                            <div className="text-sm text-green-500/80 mt-1">
                                {t('latest')}: <a href={createdPlaylists[createdPlaylists.length - 1].playlistUrl} target="_blank" className="underline hover:text-white">{createdPlaylists[createdPlaylists.length - 1].playlistName}</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Detection Panel */}
            {showDuplicates && duplicates.length > 0 && (
                <div className="mb-6 p-4 bg-orange-900/20 border border-orange-600/30 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                            <Copy className="w-5 h-5" />
                            Duplicate Songs ({duplicates.length} groups, {totalDuplicateCount} duplicates)
                        </h3>
                        <button
                            onClick={() => setShowDuplicates(false)}
                            className="text-neutral-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-sm text-neutral-400 mb-4">
                        These songs appear multiple times in your library. Click the trash icon to exclude them from playlist creation.
                    </p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {duplicates.map((group, idx) => (
                            <div key={idx} className="bg-neutral-900/50 rounded-lg p-3">
                                <div className="font-medium text-orange-300 mb-2">
                                    {group.tracks[0].track.name} - {group.tracks[0].track.artists[0]?.name}
                                    <span className="text-neutral-500 text-sm ml-2">({group.tracks.length} copies)</span>
                                </div>
                                <div className="space-y-2">
                                    {group.tracks.map((track, tIdx) => (
                                        <div
                                            key={track.track.id + tIdx}
                                            className={`flex items-center gap-3 p-2 rounded ${excludedTracks.has(track.track.id) ? 'bg-red-900/30 opacity-50' : 'bg-neutral-800/50'}`}
                                        >
                                            <img
                                                src={track.track.album.images[2]?.url || track.track.album.images[0]?.url}
                                                className="w-8 h-8 rounded"
                                                alt={track.track.album.release_date}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm truncate">
                                                    Album: {track.track.album.release_date.split('-')[0]}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setExcludedTracks(prev => {
                                                        const newSet = new Set(prev)
                                                        if (newSet.has(track.track.id)) {
                                                            newSet.delete(track.track.id)
                                                        } else {
                                                            newSet.add(track.track.id)
                                                        }
                                                        return newSet
                                                    })
                                                }}
                                                className={`p-1 rounded transition ${excludedTracks.has(track.track.id) ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600/50 hover:bg-red-500'}`}
                                                title={excludedTracks.has(track.track.id) ? 'Include in playlists' : 'Exclude from playlists'}
                                            >
                                                {excludedTracks.has(track.track.id) ? <Plus className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    {excludedTracks.size > 0 && (
                        <div className="mt-4 pt-4 border-t border-orange-600/30 flex justify-between items-center">
                            <span className="text-sm text-orange-400">
                                {excludedTracks.size} tracks will be excluded from playlist creation
                            </span>
                            <button
                                onClick={() => setExcludedTracks(new Set())}
                                className="text-sm px-3 py-1 bg-neutral-800 hover:bg-neutral-700 rounded transition"
                            >
                                Reset Exclusions
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Fetch Button */}
            {tracks.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-[50vh]">
                    <p className="mb-4 text-neutral-400">{t('clickToLoad')}</p>
                    <button
                        onClick={async () => {
                            setLoading(true)
                            setStatus(t('fetchingSongs'))
                            try {
                                const res = await fetch('/api/songs')
                                const data = await res.json()
                                if (data.error) {
                                    setStatus(`${t('error')}: ${data.error}`)
                                } else {
                                    setTracks(data.tracks || [])
                                    setStatus(t('success'))
                                }
                            } catch {
                                setStatus(t('error'))
                            } finally {
                                setLoading(false)
                            }
                        }}
                        className="px-8 py-4 bg-green-500 text-black font-bold rounded-full hover:scale-105 transition"
                    >
                        {t('fetchLikedSongs')}
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
                    <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                    <p className="text-xl">{status}</p>
                    {loadProgress.current > 0 && (
                        <ProgressBar
                            current={loadProgress.current}
                            total={loadProgress.total}
                            label="Loading songs..."
                        />
                    )}
                </div>
            )}

            {/* Grouped by Decade View */}
            {tracks.length > 0 && groupBy === "year" && renderGroupView(groupedByDecade, "text-green-400")}

            {/* Grouped by Genre View */}
            {tracks.length > 0 && groupBy === "genre" && (
                loadingGenres ? (
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <p className="text-xl">Analyzing genres...</p>
                    </div>
                ) : (
                    renderGroupView(groupedByGenre, "text-blue-400")
                )
            )}

            {/* Grouped by Mood View */}
            {tracks.length > 0 && groupBy === "mood" && (
                loadingGenres ? (
                    <div className="flex flex-col items-center justify-center h-[50vh]">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
                        <p className="text-xl">Analyzing genres for mood inference...</p>
                    </div>
                ) : (
                    renderGroupView(groupedByMood, "text-purple-400")
                )
            )}

            {/* Default List View */}
            {tracks.length > 0 && groupBy === "none" && (
                <div className="grid gap-4">
                    {tracks.slice(0, 100).map((item, idx) => (
                        <div
                            key={item.track.id + idx}
                            className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-lg hover:bg-neutral-900 transition"
                        >
                            <img
                                src={item.track.album.images[2]?.url || item.track.album.images[0]?.url}
                                className="w-12 h-12 rounded"
                                alt={item.track.name}
                            />
                            <div>
                                <div className="font-bold">{item.track.name}</div>
                                <div className="text-sm text-neutral-400">
                                    {item.track.artists.map(a => a.name).join(", ")} • {item.track.album.release_date.split('-')[0]}
                                </div>
                            </div>
                        </div>
                    ))}
                    {tracks.length > 100 && (
                        <p className="text-center text-neutral-500 p-4">
                            Showing first 100 of {tracks.length} songs...
                        </p>
                    )}
                </div>
            )}

        </div>
    )
}
