export type Language = 'en' | 'zh'

export const translations = {
    en: {
        // Common
        settings: 'Settings',
        home: 'Home',
        logout: 'Logout',
        save: 'Save',
        cancel: 'Cancel',
        loading: 'Loading...',
        success: 'Success',
        error: 'Error',

        // Dashboard
        myLibrary: 'My Library',
        totalSongs: 'Total Songs',
        byDecade: 'By Decade',
        byGenre: 'By Genre',
        byMood: 'By Mood (Inferred)',
        expandAll: 'Expand All',
        collapseAll: 'Collapse All',
        fetchLikedSongs: 'Fetch Liked Songs',
        fetchingSongs: 'Fetching songs...',
        clickToLoad: 'Click below to load your library',
        songs: 'songs',
        moreSongs: 'more songs...',
        showingFirst: 'Showing first',
        of: 'of',

        // Playlist Creation
        createPlaylist: 'Create Playlist',
        customizePlaylist: 'Customize Playlist',
        playlistName: 'Playlist Name',
        description: 'Description',
        creating: 'Creating...',
        customizeAndCreate: 'Customize & Create',
        openInSpotify: 'Open in Spotify',
        bulkCreateAll: 'Bulk Create All (Auto-Named)',
        successCreated: 'Success! Created',
        playlists: 'playlist(s)',
        latest: 'Latest',

        // Grouping
        analyzingGenres: 'Analyzing genres...',
        analyzingMood: 'Analyzing genres for mood inference...',

        // Settings Page
        apiSettings: 'API Settings',
        tutorial: 'Tutorial',
        currentStatus: 'Current Status',
        configured: 'Spotify API credentials configured',
        notConfigured: 'Spotify API credentials not configured. Please enter below or see tutorial.',
        clientId: 'Client ID',
        clientSecret: 'Client Secret',
        testConnection: 'Test Connection',
        testing: 'Testing...',
        saveSettings: 'Save Settings',
        saving: 'Saving...',
        clearCredentials: 'Clear Credentials',
        fromEnv: 'Environment Variables',
        fromUser: 'User Settings',

        // Danger Zone
        dangerZone: 'Danger Zone',
        dangerWarning: 'The following action will clear all stored data including API credentials and login status. This cannot be undone.',
        resetApp: 'Reset Application',
        resetting: 'Resetting...',

        // Tutorial
        howToGetCredentials: 'How to get your Spotify API credentials',
        followSteps: 'Follow the steps below to get your own Spotify API credentials.',
        step1: 'Step 1: Go to Spotify Developer Dashboard',
        step1Desc: 'First, log in to the developer platform with your Spotify account.',
        goToSpotifyDashboard: 'Go to Spotify Developer Dashboard',
        step2: 'Step 2: Create a new application',
        step3: 'Step 3: Get credentials',
        step4: 'Step 4: Paste credentials',
        step4Desc: 'Paste the values into the form in the "API Settings" tab, then click "Save Settings".',
        goToApiSettings: 'Go to API Settings',
        securityReminder: 'Security Reminder',

        // Home Page
        loginWithSpotify: 'Login with Spotify',
        welcome: 'Welcome',
        goToDashboard: 'Go to Dashboard',
        signOut: 'Sign Out',
        apiConfigured: 'API Configured',
        apiNotConfigured: 'Spotify API credentials not configured',
        goToSettings: 'Go to Settings →',
        pleaseConfigureFirst: 'Please configure API credentials first to login',

        // Language
        language: 'Language',
        english: 'English',
        chinese: '中文',
    },
    zh: {
        // Common
        settings: '設定',
        home: '首頁',
        logout: '登出',
        save: '儲存',
        cancel: '取消',
        loading: '載入中...',
        success: '成功',
        error: '錯誤',

        // Dashboard
        myLibrary: '我的音樂庫',
        totalSongs: '總歌曲數',
        byDecade: '按年代',
        byGenre: '按曲風',
        byMood: '按情緒 (推測)',
        expandAll: '展開全部',
        collapseAll: '收合全部',
        fetchLikedSongs: '載入收藏歌曲',
        fetchingSongs: '正在載入歌曲...',
        clickToLoad: '點擊下方按鈕載入你的音樂庫',
        songs: '首歌曲',
        moreSongs: '首歌曲...',
        showingFirst: '顯示前',
        of: '首，共',

        // Playlist Creation
        createPlaylist: '建立播放清單',
        customizePlaylist: '自訂播放清單',
        playlistName: '播放清單名稱',
        description: '描述',
        creating: '建立中...',
        customizeAndCreate: '自訂並建立',
        openInSpotify: '在 Spotify 中開啟',
        bulkCreateAll: '批次建立全部 (自動命名)',
        successCreated: '成功！已建立',
        playlists: '個播放清單',
        latest: '最新',

        // Grouping
        analyzingGenres: '正在分析曲風...',
        analyzingMood: '正在分析曲風以推測情緒...',

        // Settings Page
        apiSettings: 'API 設定',
        tutorial: '教學指南',
        currentStatus: '目前狀態',
        configured: '已設定 Spotify API 憑證',
        notConfigured: '尚未設定 Spotify API 憑證。請在下方輸入或查看教學指南。',
        clientId: 'Client ID',
        clientSecret: 'Client Secret',
        testConnection: '測試連線',
        testing: '測試中...',
        saveSettings: '儲存設定',
        saving: '儲存中...',
        clearCredentials: '清除憑證',
        fromEnv: '環境變數',
        fromUser: '使用者設定',

        // Danger Zone
        dangerZone: '危險區域',
        dangerWarning: '以下操作將清除所有儲存的資料，包括 API 憑證和登入狀態。此操作無法還原。',
        resetApp: '重置應用程式',
        resetting: '重置中...',

        // Tutorial
        howToGetCredentials: '如何取得你的 Spotify API 憑證',
        followSteps: '跟著以下步驟，你就能取得自己的 Spotify API 憑證，讓應用程式存取你的音樂庫。',
        step1: '步驟 1：前往 Spotify Developer Dashboard',
        step1Desc: '首先，你需要用你的 Spotify 帳號登入開發者平台。',
        goToSpotifyDashboard: '前往 Spotify Developer Dashboard',
        step2: '步驟 2：建立新的應用程式',
        step3: '步驟 3：取得憑證',
        step4: '步驟 4：貼上憑證',
        step4Desc: '將上述兩個值貼到「API 設定」頁籤中的表單，然後點擊「儲存設定」。',
        goToApiSettings: '前往 API 設定',
        securityReminder: '安全性提醒',

        // Home Page
        loginWithSpotify: '使用 Spotify 登入',
        welcome: '歡迎',
        goToDashboard: '前往音樂庫',
        signOut: '登出',
        apiConfigured: 'API 已設定',
        apiNotConfigured: '尚未設定 Spotify API 憑證',
        goToSettings: '前往設定 →',
        pleaseConfigureFirst: '請先設定 API 憑證才能登入',

        // Language
        language: '語言',
        english: 'English',
        chinese: '中文',
    }
} as const

export type TranslationKey = keyof typeof translations.en
