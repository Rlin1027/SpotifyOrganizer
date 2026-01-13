"use client"

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Trash2, ExternalLink, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Settings, BookOpen, Zap, RotateCcw } from 'lucide-react'
import Link from 'next/link'

interface CredentialStatus {
    configured: boolean
    clientId: string | null
    source: 'environment' | 'user' | null
}

export default function SettingsClient() {
    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [showSecret, setShowSecret] = useState(false)
    const [status, setStatus] = useState<CredentialStatus | null>(null)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [clearing, setClearing] = useState(false)
    const [resetting, setResetting] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [activeTab, setActiveTab] = useState<'settings' | 'tutorial'>('settings')

    useEffect(() => {
        checkCredentials()
    }, [])

    const checkCredentials = async () => {
        try {
            const res = await fetch('/api/auth/check-credentials')
            const data = await res.json()
            setStatus(data)
        } catch (error) {
            console.error('Failed to check credentials:', error)
        }
    }

    const handleSave = async () => {
        if (!clientId.trim() || !clientSecret.trim()) {
            setMessage({ type: 'error', text: '請填寫 Client ID 和 Client Secret' })
            return
        }

        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/save-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })
            })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: '✅ 憑證已成功儲存！' })
                setClientId('')
                setClientSecret('')
                await checkCredentials()
            } else {
                setMessage({ type: 'error', text: data.error || '儲存失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '儲存時發生錯誤' })
        } finally {
            setSaving(false)
        }
    }

    const handleClear = async () => {
        if (!confirm('確定要清除已儲存的憑證嗎？')) return

        setClearing(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/clear-credentials', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: '憑證已清除' })
                await checkCredentials()
            } else {
                setMessage({ type: 'error', text: data.error || '清除失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '清除時發生錯誤' })
        } finally {
            setClearing(false)
        }
    }

    const handleTest = async () => {
        if (!clientId.trim() || !clientSecret.trim()) {
            setMessage({ type: 'error', text: '請先填寫 Client ID 和 Client Secret' })
            return
        }

        setTesting(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/test-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: clientId.trim(), clientSecret: clientSecret.trim() })
            })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: data.message })
            } else {
                setMessage({ type: 'error', text: data.error || '測試失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '測試時發生錯誤' })
        } finally {
            setTesting(false)
        }
    }

    const handleReset = async () => {
        if (!confirm('⚠️ 確定要重置應用程式嗎？\n\n這將清除：\n- 所有 API 憑證\n- 登入狀態\n\n此操作無法還原！')) return

        setResetting(true)
        setMessage(null)

        try {
            const res = await fetch('/api/auth/reset', { method: 'POST' })
            const data = await res.json()

            if (data.success) {
                setMessage({ type: 'success', text: data.message })
                await checkCredentials()
                // Redirect to home after 2 seconds
                setTimeout(() => {
                    window.location.href = '/'
                }, 2000)
            } else {
                setMessage({ type: 'error', text: data.error || '重置失敗' })
            }
        } catch (error) {
            setMessage({ type: 'error', text: '重置時發生錯誤' })
        } finally {
            setResetting(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white">
            {/* Header */}
            <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-full hover:bg-neutral-800 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-green-500" />
                            設定
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8">
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${activeTab === 'settings'
                            ? 'bg-green-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                    >
                        <Settings className="w-4 h-4" />
                        API 設定
                    </button>
                    <button
                        onClick={() => setActiveTab('tutorial')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition ${activeTab === 'tutorial'
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        教學指南
                    </button>
                </div>

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Current Status Card */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status?.configured ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                目前狀態
                            </h2>
                            {status?.configured ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-green-400">
                                        <CheckCircle className="w-5 h-5" />
                                        <span>已設定 Spotify API 憑證</span>
                                    </div>
                                    <div className="text-sm text-neutral-400">
                                        Client ID: <code className="bg-neutral-800 px-2 py-0.5 rounded">{status.clientId}</code>
                                        <span className="ml-2 text-xs">
                                            ({status.source === 'environment' ? '環境變數' : '使用者設定'})
                                        </span>
                                    </div>
                                    {status.source === 'user' && (
                                        <button
                                            onClick={handleClear}
                                            disabled={clearing}
                                            className="mt-3 flex items-center gap-2 px-4 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition disabled:opacity-50"
                                        >
                                            {clearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            清除憑證
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-yellow-400">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>尚未設定 Spotify API 憑證。請在下方輸入或查看教學指南。</span>
                                </div>
                            )}
                        </div>

                        {/* Credential Input Form */}
                        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-4">輸入 Spotify API 憑證</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Client ID
                                    </label>
                                    <input
                                        type="text"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        placeholder="例如: a1b2c3d4e5f6..."
                                        className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                                        Client Secret
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showSecret ? 'text' : 'password'}
                                            value={clientSecret}
                                            onChange={(e) => setClientSecret(e.target.value)}
                                            placeholder="••••••••••••••••"
                                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition pr-12"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowSecret(!showSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-white transition"
                                        >
                                            {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-lg ${message.type === 'success'
                                        ? 'bg-green-900/30 text-green-400 border border-green-800'
                                        : 'bg-red-900/30 text-red-400 border border-red-800'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleTest}
                                        disabled={testing || !clientId.trim() || !clientSecret.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {testing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                測試中...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-5 h-5" />
                                                測試連線
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !clientId.trim() || !clientSecret.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                儲存中...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                儲存設定
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6">
                            <h2 className="text-lg font-semibold mb-2 text-red-400 flex items-center gap-2">
                                ⚠️ 危險區域
                            </h2>
                            <p className="text-sm text-neutral-400 mb-4">
                                以下操作將清除所有儲存的資料，包括 API 憑證和登入狀態。此操作無法還原。
                            </p>
                            <button
                                onClick={handleReset}
                                disabled={resetting}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {resetting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        重置中...
                                    </>
                                ) : (
                                    <>
                                        <RotateCcw className="w-4 h-4" />
                                        重置應用程式
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tutorial Tab */}
                {activeTab === 'tutorial' && (
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6 space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                📖 如何取得你的 Spotify API 憑證
                            </h2>
                            <p className="text-neutral-400">
                                跟著以下步驟，你就能取得自己的 Spotify API 憑證，讓應用程式存取你的音樂庫。
                            </p>
                        </div>

                        {/* Step 1 */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h3 className="text-lg font-semibold text-green-400 mb-2">
                                步驟 1：前往 Spotify Developer Dashboard
                            </h3>
                            <p className="text-neutral-300 mb-3">
                                首先，你需要用你的 Spotify 帳號登入開發者平台。
                            </p>
                            <a
                                href="https://developer.spotify.com/dashboard"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition"
                            >
                                <ExternalLink className="w-4 h-4" />
                                前往 Spotify Developer Dashboard
                            </a>
                        </div>

                        {/* Step 2 */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="text-lg font-semibold text-blue-400 mb-2">
                                步驟 2：建立新的應用程式
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                                <li>點擊右上角的 <strong className="text-white">「Create App」</strong> 按鈕</li>
                                <li>填寫以下資訊：
                                    <ul className="ml-6 mt-2 space-y-1 list-disc list-inside text-neutral-400">
                                        <li><strong className="text-white">App name</strong>: 任意名稱（例如：My Music Organizer）</li>
                                        <li><strong className="text-white">App description</strong>: 簡短描述</li>
                                        <li><strong className="text-white">Redirect URI</strong>: <code className="bg-neutral-800 px-2 py-0.5 rounded text-green-400">http://127.0.0.1:3000/api/callback</code></li>
                                        <li><strong className="text-white">APIs used</strong>: 勾選 <strong className="text-white">Web API</strong></li>
                                    </ul>
                                </li>
                                <li>同意條款並點擊 <strong className="text-white">Create</strong></li>
                            </ol>
                            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                                <p className="text-yellow-400 text-sm">
                                    ⚠️ <strong>重要</strong>：Redirect URI 必須完全正確，包含 <code>http://</code> 而非 <code>https://</code>，以及埠號 <code>3000</code>。
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="border-l-4 border-purple-500 pl-4">
                            <h3 className="text-lg font-semibold text-purple-400 mb-2">
                                步驟 3：取得憑證
                            </h3>
                            <ol className="list-decimal list-inside space-y-2 text-neutral-300">
                                <li>進入你剛建立的 App</li>
                                <li>在 <strong className="text-white">Settings</strong> 頁面找到：
                                    <ul className="ml-6 mt-2 space-y-1 list-disc list-inside text-neutral-400">
                                        <li><strong className="text-white">Client ID</strong>: 直接顯示的 32 字元字串</li>
                                        <li><strong className="text-white">Client Secret</strong>: 點擊 <strong className="text-white">View client secret</strong> 查看</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        {/* Step 4 */}
                        <div className="border-l-4 border-orange-500 pl-4">
                            <h3 className="text-lg font-semibold text-orange-400 mb-2">
                                步驟 4：貼上憑證
                            </h3>
                            <p className="text-neutral-300 mb-3">
                                將上述兩個值貼到「API 設定」頁籤中的表單，然後點擊「儲存設定」。
                            </p>
                            <button
                                onClick={() => setActiveTab('settings')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg font-medium transition"
                            >
                                <Settings className="w-4 h-4" />
                                前往 API 設定
                            </button>
                        </div>

                        {/* Security Note */}
                        <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                            <h4 className="font-semibold text-red-400 mb-2">🔒 安全性提醒</h4>
                            <ul className="list-disc list-inside text-red-300/80 text-sm space-y-1">
                                <li>請妥善保管你的 <strong>Client Secret</strong>，不要分享給他人</li>
                                <li>本應用程式會將你的憑證安全地儲存在加密的 Cookie 中</li>
                                <li>你可以隨時在設定頁面清除已儲存的憑證</li>
                            </ul>
                        </div>

                        {/* FAQ */}
                        <div>
                            <h3 className="text-lg font-semibold mb-4">❓ 常見問題</h3>
                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-800/50 rounded-lg">
                                    <h4 className="font-medium text-white mb-1">Q: 為什麼需要建立自己的 Spotify App？</h4>
                                    <p className="text-neutral-400 text-sm">
                                        Spotify 要求每個應用程式都需要有自己的 API 憑證。這樣可以確保你的資料安全，並且讓你完全控制應用程式的權限。
                                    </p>
                                </div>
                                <div className="p-4 bg-neutral-800/50 rounded-lg">
                                    <h4 className="font-medium text-white mb-1">Q: 登入時出現「Invalid redirect URI」錯誤？</h4>
                                    <p className="text-neutral-400 text-sm">
                                        請確認你在 Spotify Developer Dashboard 設定的 Redirect URI 與 <code className="bg-neutral-700 px-1 rounded">http://127.0.0.1:3000/api/callback</code> 完全一致。
                                    </p>
                                </div>
                                <div className="p-4 bg-neutral-800/50 rounded-lg">
                                    <h4 className="font-medium text-white mb-1">Q: 申請 Spotify Developer 帳號需要付費嗎？</h4>
                                    <p className="text-neutral-400 text-sm">
                                        不需要！Spotify Developer 帳號是免費的，只要你有 Spotify 帳號（免費或 Premium）就可以申請。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
