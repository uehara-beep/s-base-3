import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// テーマカラー定義（10色）
export const themeColors = [
  { id: 'orange', name: 'オレンジ', emoji: '🟠', primary: '#FF6B00', light: '#FFF5EE', dark: '#E55A00', desc: '建設業・暖色系' },
  { id: 'blue', name: 'ブルー', emoji: '🔵', primary: '#0066FF', light: '#E6F0FF', dark: '#0052CC', desc: 'クール・信頼感' },
  { id: 'green', name: 'グリーン', emoji: '🟢', primary: '#00C853', light: '#E8F5E9', dark: '#00A843', desc: '現場・自然' },
  { id: 'purple', name: 'パープル', emoji: '🟣', primary: '#7C4DFF', light: '#F3E8FF', dark: '#6B3FE0', desc: 'モダン' },
  { id: 'dark', name: 'ダーク', emoji: '⚫', primary: '#6B7280', light: '#F3F4F6', dark: '#4B5563', desc: 'シンプル黒基調' },
  { id: 'red', name: 'レッド', emoji: '🔴', primary: '#E53935', light: '#FFEBEE', dark: '#C62828', desc: 'エネルギッシュ' },
  { id: 'cyan', name: 'シアン', emoji: '🩵', primary: '#00BCD4', light: '#E0F7FA', dark: '#00ACC1', desc: '爽やか' },
  { id: 'pink', name: 'ピンク', emoji: '🩷', primary: '#EC407A', light: '#FCE4EC', dark: '#D81B60', desc: 'ポップ' },
  { id: 'yellow', name: 'イエロー', emoji: '🟡', primary: '#FFD600', light: '#FFFDE7', dark: '#FFC400', desc: '明るい・注意喚起' },
  { id: 'brown', name: 'ブラウン', emoji: '🤎', primary: '#795548', light: '#EFEBE9', dark: '#5D4037', desc: '落ち着き・土木系' },
]

// 背景スタイル定義（グレージュをデフォルトに）
export const backgroundStyles = [
  {
    id: 'greige',
    name: 'グレージュ',
    desc: '落ち着いたベージュグレー',
    bg: 'linear-gradient(180deg, #d4cfc9 0%, #c8c2bb 50%, #beb7af 100%)',
    bgLight: '#e8e4df',
    card: 'rgba(255,255,255,0.85)',
    cardHover: 'rgba(255,255,255,0.95)',
    border: 'rgba(139,119,101,0.2)',
    text: '#4a4540',
    textLight: '#8b7765',
    shadow: '0 4px 20px rgba(139,119,101,0.15)',
    headerBg: 'rgba(212,207,201,0.95)',
    navBg: 'rgba(200,194,187,0.98)',
  },
  {
    id: 'night_road',
    name: 'ナイトロード',
    desc: '夜の道路',
    bg: 'url(/backgrounds/SunyuTEC_login_bg_iphone_1170x2532.jpg)',
    bgStyle: {
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    },
    bgLight: 'rgba(10, 21, 37, 0.7)',
    card: 'rgba(10, 21, 37, 0.75)',
    cardHover: 'rgba(10, 21, 37, 0.85)',
    border: 'rgba(255,255,255,0.15)',
    text: '#ffffff',
    textLight: 'rgba(255,255,255,0.7)',
    shadow: '0 8px 32px rgba(0,0,0,0.3)',
    headerBg: 'rgba(10, 21, 37, 0.85)',
    navBg: 'rgba(10, 21, 37, 0.92)',
    hasNightEffect: true,
    useGlassmorphism: true,
  },
  {
    id: 'white',
    name: 'ホワイト',
    desc: 'クリーンで明るい',
    bg: '#ffffff',
    bgLight: '#f5f5f5',
    card: '#ffffff',
    cardHover: '#f8f8f8',
    border: 'rgba(0,0,0,0.08)',
    text: '#333333',
    textLight: '#888888',
    shadow: '0 4px 20px rgba(0,0,0,0.08)',
    headerBg: 'rgba(255, 255, 255, 0.9)',
    navBg: 'rgba(255, 255, 255, 0.95)',
  },
  {
    id: 'gray',
    name: 'グレー',
    desc: '落ち着いたビジネス向け',
    bg: '#e8e8e8',
    bgLight: '#d5d5d5',
    card: 'rgba(255,255,255,0.5)',
    cardHover: 'rgba(255,255,255,0.7)',
    border: 'rgba(0,0,0,0.08)',
    text: '#333333',
    textLight: '#777777',
    shadow: '0 4px 20px rgba(0,0,0,0.1)',
    headerBg: 'rgba(230, 230, 230, 0.95)',
    navBg: 'rgba(230, 230, 230, 0.98)',
  },
  {
    id: 'ocean',
    name: 'オーシャン',
    desc: '浅瀬の海',
    bg: 'linear-gradient(180deg, rgba(0, 210, 220, 0.85) 0%, rgba(0, 190, 200, 0.8) 30%, rgba(0, 170, 185, 0.75) 60%, rgba(0, 155, 170, 0.8) 100%)',
    bgLight: 'rgba(0, 150, 170, 0.5)',
    card: 'rgba(255,255,255,0.15)',
    cardHover: 'rgba(255,255,255,0.22)',
    border: 'rgba(255,255,255,0.25)',
    text: '#ffffff',
    textLight: 'rgba(255,255,255,0.7)',
    shadow: '0 8px 32px rgba(0,0,0,0.12)',
    headerBg: 'rgba(0, 150, 170, 0.6)',
    navBg: 'rgba(0, 130, 150, 0.8)',
    hasOceanEffect: true,
    useGlassmorphism: true,
  },
]

// フォントサイズ定義
export const fontSizes = [
  { id: 'small', name: '小', base: 12, desc: '12px基準' },
  { id: 'medium', name: '中', base: 14, desc: '14px基準' },
  { id: 'large', name: '大', base: 16, desc: '16px基準' },
  { id: 'xlarge', name: '特大', base: 18, desc: '18px基準' },
]

// テーマストア
export const useThemeStore = create(
  persist(
    (set, get) => ({
      themeId: 'orange', // デフォルトはオレンジ
      backgroundId: 'greige', // デフォルトはグレージュ
      fontSizeId: 'medium', // デフォルトは中

      setTheme: (themeId) => {
        const theme = themeColors.find(t => t.id === themeId)
        if (theme) {
          document.documentElement.style.setProperty('--primary', theme.primary)
          document.documentElement.style.setProperty('--primary-light', theme.light)
          document.documentElement.style.setProperty('--primary-dark', theme.dark)
          set({ themeId })
          // 背景がグラデーションの場合は更新
          const state = get()
          if (state.backgroundId === 'gradient') {
            get().applyBackground('gradient')
          }
        }
      },

      setBackground: (backgroundId) => {
        set({ backgroundId })
        get().applyBackground(backgroundId)
      },

      setFontSize: (fontSizeId) => {
        const fontSize = fontSizes.find(f => f.id === fontSizeId)
        if (fontSize) {
          document.documentElement.style.setProperty('--font-size-base', `${fontSize.base}px`)
          document.documentElement.style.fontSize = `${fontSize.base}px`
          set({ fontSizeId })
        }
      },

      applyBackground: (backgroundId) => {
        const bg = backgroundStyles.find(b => b.id === backgroundId)
        if (bg) {
          document.documentElement.style.setProperty('--bg', bg.bg)
          document.documentElement.style.setProperty('--bg-light', bg.bgLight)
          document.documentElement.style.setProperty('--card', bg.card)
          document.documentElement.style.setProperty('--card-hover', bg.cardHover)
          document.documentElement.style.setProperty('--border', bg.border)
          document.documentElement.style.setProperty('--text', bg.text)
          document.documentElement.style.setProperty('--text-light', bg.textLight)
          document.documentElement.style.setProperty('--shadow', bg.shadow)
        }
      },

      getCurrentTheme: () => {
        const state = get()
        return themeColors.find(t => t.id === state.themeId) || themeColors[0]
      },

      // 背景スタイルを取得（画像背景とCSSプロパティを含む）
      getBackgroundStyle: () => {
        const state = get()
        const bg = backgroundStyles.find(b => b.id === state.backgroundId) || backgroundStyles[0]
        return {
          background: bg.bg,
          ...(bg.bgStyle || {}),
        }
      },

      getCurrentBackground: () => {
        const state = get()
        return backgroundStyles.find(b => b.id === state.backgroundId) || backgroundStyles[0]
      },

      getCurrentFontSize: () => {
        const state = get()
        return fontSizes.find(f => f.id === state.fontSizeId) || fontSizes[1]
      },

      initTheme: () => {
        const state = get()
        const theme = themeColors.find(t => t.id === state.themeId) || themeColors[0]
        const fontSize = fontSizes.find(f => f.id === state.fontSizeId) || fontSizes[1]

        // テーマカラー
        document.documentElement.style.setProperty('--primary', theme.primary)
        document.documentElement.style.setProperty('--primary-light', theme.light)
        document.documentElement.style.setProperty('--primary-dark', theme.dark)

        // 背景
        get().applyBackground(state.backgroundId)

        // フォントサイズ
        document.documentElement.style.setProperty('--font-size-base', `${fontSize.base}px`)
      },
    }),
    {
      name: 'sanyutech-theme',
    }
  )
)

// メインストア
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ユーザー情報
      user: {
        name: '田中 太郎',
        role: '職長',
        company: 'サンユウテック'
      },
      
      // 通知
      notifications: [
        { id: 1, type: 'approval', title: '承認依頼', body: '田中太郎さんが経費精算を申請しました', time: '5分前', read: false },
        { id: 2, type: 'alert', title: '在庫アラート', body: 'ヘルメットの在庫が最小数量を下回りました', time: '1時間前', read: false },
        { id: 3, type: 'info', title: 'KY承認完了', body: '久留米現場のKY記録が承認されました', time: '昨日', read: true },
      ],
      unreadCount: 2,
      
      // 承認待ち（APIから取得）
      pendingApprovals: 0,

      // 日報確認待ち
      pendingDailyReportConfirmations: 0,

      // 日報確認待ち数を更新
      setPendingDailyReportConfirmations: (count) => set({ pendingDailyReportConfirmations: count }),
      
      // 現場データ
      sites: [
        {
          id: 'kurume',
          name: '九州自動車道 久留米管内舗装補修',
          shortName: '久留米',
          client: '鹿島道路㈱',
          location: '福岡県久留米市東合川1-2-3',
          lat: 33.3152,
          lng: 130.5070,
          period: { start: '2024-04-01', end: '2025-02-28' },
          status: 'active',
          shift: 'day',
          members: ['田中', '山田', '佐藤', '鈴木', '高橋'],
          photos: 23,
          documents: 3,
        },
        {
          id: 'miyazaki',
          name: '宮崎自動車道 舗装補修工事',
          shortName: '宮崎',
          client: '鹿島道路㈱',
          location: '宮崎県宮崎市',
          lat: 31.9077,
          lng: 131.4202,
          period: { start: '2024-07-01', end: '2024-12-31' },
          status: 'active',
          shift: 'night',
          members: ['伊藤', '渡辺', '中村'],
          photos: 15,
          documents: 2,
        },
        {
          id: 'chidori',
          name: '千鳥橋JCT舗装改良',
          shortName: '千鳥橋',
          client: 'NIPPO',
          location: '福岡県福岡市',
          lat: 33.5902,
          lng: 130.4017,
          period: { start: '2024-10-01', end: '2025-01-31' },
          status: 'active',
          shift: 'day',
          members: ['木村', '加藤'],
          photos: 8,
          documents: 1,
        },
      ],
      
      // 作業員
      workers: [
        { id: 1, name: '田中 太郎', role: '職長', company: 'サンユウテック', type: 'employee' },
        { id: 2, name: '山田 次郎', role: '作業員', company: 'サンユウテック', type: 'employee' },
        { id: 3, name: '佐藤 三郎', role: '作業員', company: '〇〇工業', type: 'subcontractor' },
        { id: 4, name: '鈴木 四郎', role: '作業員', company: 'サンユウテック', type: 'employee' },
        { id: 5, name: '高橋 五郎', role: '作業員', company: 'サンユウテック', type: 'employee' },
        { id: 6, name: '伊藤 六郎', role: '作業員', company: '△△建設', type: 'subcontractor' },
        { id: 7, name: '渡辺 七郎', role: 'オペ', company: 'サンユウテック', type: 'employee' },
        { id: 8, name: '中村 八郎', role: '作業員', company: '□□組', type: 'subcontractor' },
      ],
      
      // 車両
      vehicles: [
        { id: 1, name: 'ハイエース', plate: '福岡 100 あ 1234', status: 'available', location: '本社駐車場', fuel: 50, nextInspection: '2025-01-15' },
        { id: 2, name: '2tダンプ', plate: '福岡 200 か 5678', status: 'in-use', location: '久留米現場', user: '田中', nextInspection: '2025-02-20' },
        { id: 3, name: '4tダンプ', plate: '福岡 800 さ 9012', status: 'in-use', location: '宮崎現場', user: '伊藤', nextInspection: '2025-01-10' },
        { id: 4, name: 'キャラバン', plate: '福岡 300 た 3456', status: 'maintenance', location: '整備工場', nextInspection: '2025-03-01' },
      ],
      
      // 機材
      equipment: [
        { id: 1, name: 'バックホー 0.25㎥', code: 'BH-001', status: 'in-use', location: '久留米現場', user: '田中', hours: 1234, type: 'owned' },
        { id: 2, name: 'バックホー 0.45㎥', code: 'BH-002', status: 'available', location: '本社倉庫', hours: 2567, type: 'owned' },
        { id: 3, name: 'ローラー 3t', code: 'RL-001', status: 'in-use', location: '宮崎現場', user: '伊藤', hours: 890, type: 'owned' },
        { id: 4, name: 'アスファルトフィニッシャー', code: 'AF-001', status: 'in-use', location: '久留米現場', user: '山田', hours: 3456, type: 'owned' },
        { id: 5, name: 'ブレーカー', code: 'BR-001', status: 'maintenance', location: '整備工場', hours: 567, type: 'owned' },
      ],
      
      // レンタル機材
      rentals: [
        { id: 1, name: 'バックホー 0.7㎥', company: 'アクティオ', site: '久留米', startDate: '2024-12-10', endDate: '2024-12-28', dailyRate: 25000 },
        { id: 2, name: 'タイヤローラー 10t', company: 'ニッケン', site: '久留米', startDate: '2024-12-15', endDate: '2024-12-25', dailyRate: 18000 },
        { id: 3, name: '路面切削機', company: 'カナモト', site: '千鳥橋', startDate: '2024-12-18', endDate: '2024-12-21', dailyRate: 45000 },
      ],
      
      // 在庫
      inventory: [
        { id: 1, name: 'ヘルメット', stock: 3, min: 5, location: '倉庫A', unit: '個' },
        { id: 2, name: '軍手', stock: 50, min: 20, location: '倉庫A', unit: '双' },
        { id: 3, name: '安全ベスト', stock: 8, min: 10, location: '倉庫A', unit: '枚' },
        { id: 4, name: 'カラーコーン', stock: 30, min: 15, location: '倉庫B', unit: '本' },
      ],
      
      // 単価マスタ
      priceMaster: {
        rental: [
          { id: 1, vendor: 'アクティオ', item: 'バックホー 0.7㎥', dailyRate: 25000, deliveryFee: 35000, date: '2024-12-20' },
          { id: 2, vendor: 'ニッケン', item: 'タイヤローラー 10t', dailyRate: 18000, deliveryFee: 28000, date: '2024-12-15' },
          { id: 3, vendor: 'カナモト', item: '路面切削機', dailyRate: 45000, deliveryFee: 50000, date: '2024-12-18' },
        ],
        material: [
          { id: 1, vendor: '〇〇建材', item: 'アスファルト合材（密粒度13）', unitPrice: 9500, unit: 't', date: '2024-12-01' },
          { id: 2, vendor: '△△砕石', item: '路盤材（RC-40）', unitPrice: 3500, unit: 't', date: '2024-12-01' },
        ],
        subcon: [
          { id: 1, vendor: '〇〇工業', item: '舗装作業員', dailyRate: 20000, date: '2024-04-01' },
          { id: 2, vendor: '△△建設', item: '重機オペレーター', dailyRate: 25000, date: '2024-04-01' },
        ],
      },
      
      // 問い合わせ履歴
      feedbacks: [
        { id: 1, category: 'improve', content: '週間配置表を現場軸にしてほしい', date: '2024-12-19', status: 'resolved' },
        { id: 2, category: 'feature', content: '天気予報を複数ソースで集約してほしい', date: '2024-12-18', status: 'resolved' },
        { id: 3, category: 'feature', content: '機材管理を追加してほしい', date: '2024-12-18', status: 'resolved' },
      ],
      
      // アクション
      markNotificationAsRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: state.notifications.filter(n => !n.read && n.id !== id).length
      })),
      
      addFeedback: (feedback) => set((state) => ({
        feedbacks: [{ ...feedback, id: Date.now(), date: new Date().toISOString().split('T')[0], status: 'pending' }, ...state.feedbacks]
      })),
      
      addSite: (site) => set((state) => ({
        sites: [...state.sites, { ...site, id: Date.now().toString() }]
      })),
      
      updateSite: (id, updates) => set((state) => ({
        sites: state.sites.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
    }),
    {
      name: 'sanyutech-storage',
      partialize: (state) => ({
        feedbacks: state.feedbacks,
        notifications: state.notifications,
      }),
    }
  )
)

// S-BASE用ストア
export const useSbaseStore = create((set) => ({
  projects: [
    {
      id: 'kurume',
      name: '久留米管内舗装補修',
      client: '鹿島道路㈱',
      contractAmount: 28000000,
      budget: 25200000,
      actualCost: 19600000,
      status: 'active',
      progress: 75,
    },
    {
      id: 'miyazaki',
      name: '宮崎舗装補修工事',
      client: '鹿島道路㈱',
      contractAmount: 13500000,
      budget: 12150000,
      actualCost: 10800000,
      status: 'active',
      progress: 90,
    },
    {
      id: 'chidori',
      name: '千鳥橋JCT舗装改良',
      client: 'NIPPO',
      contractAmount: 8500000,
      budget: 7650000,
      actualCost: 4200000,
      status: 'active',
      progress: 60,
    },
  ],
  
  totalProfit: 8730000,
  profitRate: 18.0,
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
  })),
}))

// 天気用ストア
export const useWeatherStore = create((set) => ({
  weatherData: {
    kurume: {
      location: '福岡県久留米市',
      current: { icon: '☀️', temp: 12, condition: '晴れ', confidence: 95 },
      sources: [
        { name: 'Yahoo天気', forecast: '☀️ 晴れ' },
        { name: 'tenki.jp', forecast: '☀️ 晴れ' },
        { name: 'ウェザーニュース', forecast: '☀️ 晴れ' },
      ],
      weekly: [
        { day: '土', icon: '☀️', temp: 14, rain: 0 },
        { day: '日', icon: '☁️', temp: 12, rain: 20 },
        { day: '月', icon: '🌧️', temp: 8, rain: 80, alert: true },
        { day: '火', icon: '☁️', temp: 10, rain: 30 },
        { day: '水', icon: '☀️', temp: 13, rain: 10 },
      ],
    },
    miyazaki: {
      location: '宮崎県宮崎市',
      current: { icon: '☀️', temp: 15, condition: '晴れ', confidence: 90 },
      sources: [
        { name: 'Yahoo天気', forecast: '☀️ 晴れ' },
        { name: 'tenki.jp', forecast: '🌤️ 晴れ時々曇' },
        { name: 'ウェザーニュース', forecast: '☀️ 晴れ' },
      ],
      weekly: [
        { day: '土', icon: '☀️', temp: 16, rain: 5 },
        { day: '日', icon: '☀️', temp: 15, rain: 10 },
        { day: '月', icon: '☁️', temp: 12, rain: 40 },
        { day: '火', icon: '☀️', temp: 14, rain: 15 },
        { day: '水', icon: '☀️', temp: 15, rain: 5 },
      ],
    },
    chidori: {
      location: '福岡県福岡市',
      current: { icon: '🌤️', temp: 13, condition: '晴れ時々曇り', confidence: 75 },
      sources: [
        { name: 'Yahoo天気', forecast: '☀️ 晴れ' },
        { name: 'tenki.jp', forecast: '🌤️ 晴れ時々曇' },
        { name: 'ウェザーニュース', forecast: '☁️ 曇り' },
      ],
      weekly: [
        { day: '土', icon: '☀️', temp: 14, rain: 10 },
        { day: '日', icon: '☁️', temp: 11, rain: 30 },
        { day: '月', icon: '🌧️', temp: 9, rain: 85, alert: true },
        { day: '火', icon: '🌤️', temp: 11, rain: 25 },
        { day: '水', icon: '☀️', temp: 13, rain: 10 },
      ],
    },
  },
  lastUpdated: '12/20 8:00',

  refreshWeather: () => set({ lastUpdated: new Date().toLocaleString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }),
}))

// KPIカード定義
export const kpiOptions = [
  { id: 'activeProjects', name: '進行中案件', icon: 'FolderKanban', color: '#3B82F6', unit: '件' },
  { id: 'monthlySales', name: '今月売上', icon: 'TrendingUp', color: '#10B981', unit: '万円' },
  { id: 'unpaidAmount', name: '未請求', icon: 'AlertCircle', color: '#F59E0B', unit: '万円' },
  { id: 'profitRate', name: '粗利率', icon: 'Percent', color: '#8B5CF6', unit: '%' },
  { id: 'monthlyExpense', name: '今月経費', icon: 'Receipt', color: '#EF4444', unit: '万円' },
  { id: 'completedProjects', name: '完了案件', icon: 'CheckCircle', color: '#06B6D4', unit: '件' },
  { id: 'pendingApprovals', name: '承認待ち', icon: 'Clock', color: '#F97316', unit: '件' },
  { id: 'workerCount', name: '作業員数', icon: 'Users', color: '#84CC16', unit: '人' },
]

// ダッシュボード設定用ウィジェット定義
export const dashboardWidgets = [
  // 営業（現場台帳・顧客管理・営業活動）
  { id: 'projectList', name: '現場台帳', category: 'sales', defaultEnabled: true },
  { id: 'newProject', name: '新規案件', category: 'sales', defaultEnabled: false },
  { id: 'excelImport', name: 'Excel取込', category: 'sales', defaultEnabled: false },
  { id: 'clients', name: '顧客管理', category: 'sales', defaultEnabled: false },
  { id: 'clientRanking', name: '顧客別ランキング', category: 'sales', defaultEnabled: false },
  { id: 'businessCards', name: '名刺管理', category: 'sales', defaultEnabled: false },
  { id: 'salesSchedule', name: '営業スケジュール', category: 'sales', defaultEnabled: false },
  // 工事（段取りくん・安全管理・現場情報・その他）
  { id: 'dantori', name: '配置管理', category: 'construction', defaultEnabled: true },
  { id: 'workers', name: '作業員管理', category: 'construction', defaultEnabled: false },
  { id: 'dailyReport', name: '日報入力', category: 'construction', defaultEnabled: false },
  { id: 'kyManagement', name: 'KY管理', category: 'construction', defaultEnabled: false },
  { id: 'photos', name: '工事写真', category: 'construction', defaultEnabled: false },
  { id: 'documents', name: '書類管理', category: 'construction', defaultEnabled: false },
  { id: 'siteLocation', name: '現場位置', category: 'construction', defaultEnabled: false },
  { id: 'weather', name: '天気予報', category: 'construction', defaultEnabled: false },
  { id: 'schedule', name: '年間工程', category: 'construction', defaultEnabled: false },
  { id: 'inventory', name: '在庫管理', category: 'construction', defaultEnabled: false },
  { id: 'materialSlip', name: '材料伝票', category: 'construction', defaultEnabled: false },
  { id: 'carManagement', name: '車両管理', category: 'construction', defaultEnabled: false },
  // 事務（経費精算・請求入出金・承認・マスタ）
  { id: 'expenseNew', name: '経費申請', category: 'office', defaultEnabled: true },
  { id: 'expenseList', name: '経費一覧', category: 'office', defaultEnabled: false },
  { id: 'invoiceAI', name: '請求書AI', category: 'office', defaultEnabled: false },
  { id: 'income', name: '入金管理', category: 'office', defaultEnabled: false },
  { id: 'expensePay', name: '支払管理', category: 'office', defaultEnabled: false },
  { id: 'approval', name: '承認センター', category: 'office', defaultEnabled: false },
  { id: 'subcontractor', name: '業者マスタ', category: 'office', defaultEnabled: false },
  // 経営（ダッシュボード）
  { id: 'analytics', name: '経営ダッシュボード', category: 'management', defaultEnabled: true },
]

// ダッシュボードカテゴリ定義
export const dashboardCategories = [
  { id: 'sales', name: '営業', description: '現場台帳・顧客管理', color: '#3A6AAF' },
  { id: 'construction', name: '工事', description: '段取り・安全・現場', color: '#3D9968' },
  { id: 'office', name: '事務', description: '経費・請求・承認', color: '#7A5A9D' },
  { id: 'management', name: '経営', description: 'ダッシュボード', color: '#C4823B' },
]

// ダッシュボード設定ストア
export const useDashboardStore = create(
  persist(
    (set, get) => ({
      // 有効なウィジェット（ID配列）
      enabledWidgets: dashboardWidgets.filter(w => w.defaultEnabled).map(w => w.id),

      // ウィジェットの順序
      widgetOrder: dashboardWidgets.filter(w => w.defaultEnabled).map(w => w.id),

      // 有効なKPI（ID配列、4つまで）
      enabledKpis: ['activeProjects', 'monthlySales', 'unpaidAmount', 'profitRate'],

      // ウィジェットを有効/無効にする
      toggleWidget: (widgetId) => {
        const state = get()
        const isEnabled = state.enabledWidgets.includes(widgetId)

        if (isEnabled) {
          // 無効にする
          set({
            enabledWidgets: state.enabledWidgets.filter(id => id !== widgetId),
            widgetOrder: state.widgetOrder.filter(id => id !== widgetId),
          })
        } else {
          // 有効にする（末尾に追加）
          set({
            enabledWidgets: [...state.enabledWidgets, widgetId],
            widgetOrder: [...state.widgetOrder, widgetId],
          })
        }
      },

      // KPIを有効/無効にする（最大4つ）
      toggleKpi: (kpiId) => {
        const state = get()
        const isEnabled = state.enabledKpis.includes(kpiId)

        if (isEnabled) {
          // 無効にする（最低1つは必要）
          if (state.enabledKpis.length > 1) {
            set({ enabledKpis: state.enabledKpis.filter(id => id !== kpiId) })
          }
        } else {
          // 有効にする（最大4つ）
          if (state.enabledKpis.length < 4) {
            set({ enabledKpis: [...state.enabledKpis, kpiId] })
          }
        }
      },

      // KPIの順序を変更
      setKpiOrder: (newOrder) => {
        set({ enabledKpis: newOrder })
      },

      // ウィジェットの順序を変更
      reorderWidgets: (newOrder) => {
        set({ widgetOrder: newOrder })
      },

      // デフォルトにリセット
      resetToDefault: () => {
        const defaultEnabled = dashboardWidgets.filter(w => w.defaultEnabled).map(w => w.id)
        set({
          enabledWidgets: defaultEnabled,
          widgetOrder: defaultEnabled,
          enabledKpis: ['activeProjects', 'monthlySales', 'unpaidAmount', 'profitRate'],
        })
      },
    }),
    {
      name: 'sanyutech-dashboard-settings',
    }
  )
)

// 認証ストア
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 認証状態
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      _hasHydrated: false,

      // ハイドレーション完了をセット
      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      // ログイン
      login: async (username, password) => {
        set({ loading: true, error: null })
        try {
          const { API_BASE } = await import('./config/api')
          const response = await fetch(`${API_BASE}/auth/login-json`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'ログインに失敗しました')
          }

          const data = await response.json()
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.access_token,
            loading: false,
            error: null,
          })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // 新規登録
      register: async (userData) => {
        set({ loading: true, error: null })
        try {
          const { API_BASE } = await import('./config/api')
          const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || '登録に失敗しました')
          }

          const data = await response.json()
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.access_token,
            loading: false,
            error: null,
          })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // LINE WORKSログイン
      loginWithLineWorks: async (code) => {
        set({ loading: true, error: null })
        try {
          const { API_BASE } = await import('./config/api')
          const response = await fetch(`${API_BASE}/auth/lineworks/callback?code=${code}`, {
            method: 'GET',
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.detail || 'LINE WORKSログインに失敗しました')
          }

          const data = await response.json()
          set({
            isAuthenticated: true,
            user: data.user,
            token: data.access_token,
            loading: false,
            error: null,
          })
          return { success: true }
        } catch (error) {
          set({ loading: false, error: error.message })
          return { success: false, error: error.message }
        }
      },

      // ログアウト
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          error: null,
        })
      },

      // トークンを取得（API呼び出し用）
      getAuthHeaders: () => {
        const state = get()
        if (state.token) {
          return { Authorization: `Bearer ${state.token}` }
        }
        return {}
      },

      // エラーをクリア
      clearError: () => set({ error: null }),
    }),
    {
      name: 'sanyutech-auth',
      onRehydrateStorage: () => (state) => {
        // ハイドレーション完了時にフラグをセット
        state?.setHasHydrated(true)
      },
    }
  )
)
