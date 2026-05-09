import { useMemo } from 'react';

export type Lang = 'en' | 'id' | 'zh';

type TranslationMap = Record<string, string>;

export type Translations = TranslationMap;

const translations: Record<Lang, TranslationMap> = {
  en: {
    // Auth Screen
    appTitle: "What's This?",
    appSubtitle: 'AI-Powered Object Learning for Kids',
    welcomeBack: 'Welcome Back!',
    joinTheFun: 'Join the Fun! 🎉',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    createAccount: 'Create Account',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    register: 'Register',
    cancel: 'Cancel',
    continueAsGuest: 'Continue as Guest →',
    authFailed: 'Auth failed',
    networkError: 'Network error',

    // Header
    hiUser: 'Hi, {name}! 👋',

    // Tabs
    home: 'Home',
    learn: 'Learn',
    games: 'Games',
    chat: 'Chat',
    me: 'Me',

    // Settings
    settings: 'Settings',
    theme: 'Theme',
    languageLabel: 'Language',
    upgradeToPro: 'Upgrade to Pro',
    upgrading: '⏳ Upgrading...',
    getPro: '🚀 Get Pro',

    // Camera
    readyToExplore: 'Ready to Explore?',
    useCameraOrUpload: 'Use camera or upload',
    uploadAnImage: 'Upload an image',
    camera: 'Camera',
    upload: 'Upload',
    identifying: 'Identifying...',
    cameraNotAvailable:
      'Camera not available. Upload an image instead!',
    couldNotIdentify: 'Could not identify. Try again!',

    // Result Card
    description: 'Description',
    funFact: 'Fun Fact',
    category: 'Category',
    listen: 'Listen',
    noResults: 'No results yet',
    scanSomething:
      'Take a photo or upload to start learning!',
    discoveryLog: 'Discovery Log',
    historyEmpty: 'No discoveries yet. Start exploring!',
    clearHistory: 'Clear All',
    confirmClearAll: 'Clear all history?',

    // Learn Tab
    learnTitle: 'Learn & Play',
    listenChallenge: '👂 Listening Challenge',
    listenInstruction: 'Listen and pick the right picture!',
    playSound: 'Play Sound',
    replay: 'Replay',
    listenCorrect: 'Correct! Great listening!',
    listenWrong: 'Not quite! Try again!',
    nextWord: 'Next Word',
    identifyFirstListen: 'Identify an object first to play!',
    listenBtn: 'Listen',
    quizChallenge: '🧠 Quiz Time!',
    quizQuestion: 'What is in this picture?',
    correctAnswer: '🎉 Correct!',
    wrongAnswer: '😊 Not quite! It\'s a {name}',
    startQuiz: 'Start Quiz',
    startSpelling: 'Start Spelling',
    quizCompleted: 'Quiz completed! You got {score}/{total}!',

    // Puzzle
    puzzleChallenge: '🧩 Puzzle',
    startPuzzle: 'Start Puzzle',
    puzzleInstruction: 'Tap a piece, then tap a slot to place it',
    puzzleComplete: '🎉 Puzzle Complete!',
    puzzleWrong: 'Almost! Try rearranging.',
    puzzleCorrect: 'Great job! Puzzle solved!',
    puzzleIncorrect: 'Not quite right. Try again!',

    // Chat
    chatTitle: '💬 Ask Anything!',
    chatPlaceholder: 'Ask me anything...',
    send: 'Send',
    chatWelcome:
      "Hi there! 👋 I'm your learning buddy. Ask me anything about the world!",
    chatError: 'Oops! Something went wrong. Try again! 🙈',

    // Profile
    profile: 'Profile',
    achievements: '🏆 Achievements',
    noAchievements: 'No achievements yet. Keep exploring!',
    feedback: 'Send Feedback',
    feedbackTitle: 'How do you like the app?',
    feedbackPlaceholder: 'Tell us what you think...',
    feedbackSent: 'Thank you for your feedback! 🎉',
    submitFeedback: 'Submit',

    // Achievement descriptions
    achFirstScan: 'First Discovery!',
    achExplorer: 'Explorer',
    achScientist: 'Scientist',
    achProfessor: 'Professor',
    achPerfectScore: 'Perfect Score!',
    achPuzzleMaster: 'Puzzle Master',
    achGoodListener: 'Good Listener',
    achChattyKid: 'Chatty Kid',
    achHelper: 'Helper',
    achFirstScanDesc: 'Identify your very first object',
    achExplorerDesc: 'Identify 5 different objects',
    achScientistDesc: 'Identify 10 different objects',
    achProfessorDesc: 'Identify 20 different objects',
    achPerfectScoreDesc: 'Get a perfect score on a quiz',
    achPuzzleMasterDesc: 'Complete a puzzle correctly',
    achGoodListenerDesc: 'Listen and identify an object correctly',
    achChattyKidDesc: 'Send your first chat message',
    achHelperDesc: 'Submit app feedback',

    // Voice messages (for TTS)
    ttsFunFact: 'Fun fact: {fact}',
    ttsListenCorrect:
      'Great job! You identified {word} correctly!',
    ttsListenWrong:
      "Not quite! That was {word}. Try again!",
    ttsPuzzleComplete:
      'Amazing! You completed the puzzle!',
    ttsPuzzleAlmost:
      'Almost! Try rearranging the pieces.',

    // Theme names
    themeRainbowGarden: 'Rainbow Garden',
    themeOceanExplorer: 'Ocean Explorer',
    themeEnchantedForest: 'Enchanted Forest',
    themeSunsetSky: 'Sunset Sky',
    themeStarryNight: 'Starry Night',
    themeCandyKingdom: 'Candy Kingdom',

    // Portal strings
    chooseWorld: 'Choose Your World!',
    enterWorld: 'Enter',
    unlockWorld: 'Unlock',
    tryProThemes: 'Try PRO Themes',

    // Additional UI strings
    learnPractice: 'Learn & Practice',
    listenChallengeTitle: 'Listen to the Word',
    correctAmazing: 'Correct! Amazing!',
    wrongNotQuite: 'Not quite! The word is "{word}"',
    identifyFirstListen: 'Identify an object first to play!',
    miniGames: 'Mini Games',
    quizCardTitle: 'Quiz Challenge',
    testKnowledge: 'Test your knowledge!',
    identifyFirst: 'Identify an object first',
    close: 'Close',
    puzzleGameTitle: 'Puzzle Game',
    solvePuzzle: 'Solve the puzzle!',
    aiBuddy: 'AI Buddy',
    online: 'Online',
    chatThinking: 'Thinking...',
    proMember: 'Pro Member',
    freeMember: 'Free Member',
    tryAgain: 'Try Again',
    listenBtn: 'Listen',
    quizBtn: 'Quiz',
    puzzleBtn: 'Puzzle',
    identifyFirstPuzzle: 'Upload an image first',
    generating: 'Generating options...',
    quizError: 'Oops! The quiz could not load. Want to try again? 🔄',
    revealAnswer: 'Reveal Answer',
    nextQuestion: 'Next Question',
    tryAnother: 'Try Another',
    newImage: 'New Image',

    // Guest
    guest: 'Guest',

    // Celebration overlay
    continue: 'Continue',
  },

  id: {
    // Auth Screen
    appTitle: 'Ini Apa?',
    appSubtitle:
      'Belajar Mengenali Objek dengan AI untuk Anak',
    welcomeBack: 'Selamat Datang Kembali!',
    joinTheFun: 'Gabung Serunya! 🎉',
    username: 'Nama Pengguna',
    email: 'Email',
    password: 'Kata Sandi',
    login: 'Masuk',
    createAccount: 'Buat Akun',
    dontHaveAccount: 'Belum punya akun?',
    alreadyHaveAccount: 'Sudah punya akun?',
    register: 'Daftar',
    cancel: 'Batal',
    continueAsGuest: 'Lanjut sebagai Tamu →',
    authFailed: 'Gagal masuk',
    networkError: 'Kesalahan jaringan',

    // Header
    hiUser: 'Halo, {name}! 👋',

    // Tabs
    home: 'Beranda',
    learn: 'Belajar',
    games: 'Permainan',
    chat: 'Obrolan',
    me: 'Saya',

    // Settings
    settings: 'Pengaturan',
    theme: 'Tema',
    languageLabel: 'Bahasa',
    upgradeToPro: 'Tingkatkan ke Pro',
    upgrading: '⏳ Meningkatkan...',
    getPro: '🚀 Dapatkan Pro',

    // Camera
    readyToExplore: 'Siap Menjelajah?',
    useCameraOrUpload: 'Gunakan kamera atau unggah',
    uploadAnImage: 'Unggah gambar',
    camera: 'Kamera',
    upload: 'Unggah',
    identifying: 'Mengenali...',
    cameraNotAvailable:
      'Kamera tidak tersedia. Unggah gambar saja!',
    couldNotIdentify: 'Tidak bisa mengenali. Coba lagi!',

    // Result Card
    description: 'Deskripsi',
    funFact: 'Fakta Menarik',
    category: 'Kategori',
    listen: 'Dengarkan',
    noResults: 'Belum ada hasil',
    scanSomething:
      'Ambil foto atau unggah untuk mulai belajar!',
    discoveryLog: 'Log Penemuan',
    historyEmpty: 'Belum ada penemuan. Mulai menjelajah!',
    clearHistory: 'Hapus Semua',
    confirmClearAll: 'Hapus semua riwayat?',

    // Learn Tab
    learnTitle: 'Belajar & Bermain',
    listenChallenge: '👂 Tantangan Mendengarkan',
    listenInstruction: 'Dengarkan dan pilih gambar yang tepat!',
    playSound: 'Mainkan Suara',
    replay: 'Putar Ulang',
    listenCorrect: 'Benar! Pendengaran hebat!',
    listenWrong: 'Kurang tepat! Coba lagi!',
    nextWord: 'Kata Berikutnya',
    identifyFirstListen: 'Kenali objek terlebih dahulu untuk bermain!',
    listenBtn: 'Dengarkan',
    quizChallenge: '🧠 Waktu Kuis!',
    quizQuestion: 'Apa yang ada di gambar ini?',
    correctAnswer: '🎉 Benar!',
    wrongAnswer: '😊 Kurang tepat! Itu {name}',
    startQuiz: 'Mulai Kuis',
    startSpelling: 'Mulai Ejaan',
    quizCompleted: 'Kuis selesai! Kamu dapat {score}/{total}!',

    // Puzzle
    puzzleChallenge: '🧩 Puzzle',
    startPuzzle: 'Mulai Puzzle',
    puzzleInstruction:
      'Ketuk potongan, lalu ketuk slot untuk menempatkannya',
    puzzleComplete: '🎉 Puzzle Selesai!',
    puzzleWrong: 'Hampir! Coba susun ulang.',
    puzzleCorrect: 'Puzzle berhasil dipecahkan!',
    puzzleIncorrect: 'Belum tepat. Coba lagi!',

    // Chat
    chatTitle: '💬 Tanya Apa Saja!',
    chatPlaceholder: 'Tanyakan apa saja...',
    send: 'Kirim',
    chatWelcome:
      'Hai! 👋 Aku teman belajarmu. Tanyakan apa saja tentang dunia!',
    chatError: 'Oops! Ada yang salah. Coba lagi! 🙈',

    // Profile
    profile: 'Profil',
    achievements: '🏆 Pencapaian',
    noAchievements: 'Belum ada pencapaian. Terus menjelajah!',
    feedback: 'Kirim Masukan',
    feedbackTitle:
      'Bagaimana menurutmu tentang aplikasi ini?',
    feedbackPlaceholder: 'Ceritakan pendapatmu...',
    feedbackSent: 'Terima kasih atas masukanmu! 🎉',
    submitFeedback: 'Kirim',

    // Achievement descriptions
    achFirstScan: 'Penemuan Pertama!',
    achExplorer: 'Penjelajah',
    achScientist: 'Ilmuwan',
    achProfessor: 'Profesor',
    achPerfectScore: 'Nilai Sempurna!',
    achPuzzleMaster: 'Master Puzzle',
    achGoodListener: 'Pendengar Baik',
    achChattyKid: 'Anak Pembicara',
    achHelper: 'Pembantu',
    achFirstScanDesc: 'Kenali objek pertamamu',
    achExplorerDesc: 'Kenali 5 objek berbeda',
    achScientistDesc: 'Kenali 10 objek berbeda',
    achProfessorDesc: 'Kenali 20 objek berbeda',
    achPerfectScoreDesc: 'Dapatkan nilai sempurna di kuis',
    achPuzzleMasterDesc: 'Selesaikan puzzle dengan benar',
    achGoodListenerDesc: 'Dengarkan dan kenali objek dengan benar',
    achChattyKidDesc: 'Kirim pesan obrolan pertamamu',
    achHelperDesc: 'Kirim masukan aplikasi',

    // Voice messages (for TTS)
    ttsFunFact: 'Fakta menarik: {fact}',
    ttsListenCorrect:
      'Bagus sekali! Kamu mengenali {word} dengan benar!',
    ttsListenWrong:
      'Kurang tepat! Itu {word}. Coba lagi!',
    ttsPuzzleComplete:
      'Luar biasa! Kamu menyelesaikan puzzlenya!',
    ttsPuzzleAlmost:
      'Hampir! Coba susun ulang potongannya.',

    // Theme names
    themeRainbowGarden: 'Taman Pelangi',
    themeOceanExplorer: 'Penjelajah Samudera',
    themeEnchantedForest: 'Hutan Ajaib',
    themeSunsetSky: 'Langit Senja',
    themeStarryNight: 'Malam Berbintang',
    themeCandyKingdom: 'Kerajaan Permen',

    // Portal strings
    chooseWorld: 'Pilih Duniamu!',
    enterWorld: 'Masuk',
    unlockWorld: 'Buka',
    tryProThemes: 'Coba Tema PRO',

    // Additional UI strings
    learnPractice: 'Belajar & Berlatih',
    listenChallengeTitle: 'Dengarkan Kata Ini',
    correctAmazing: 'Benar! Luar biasa!',
    wrongNotQuite: 'Kurang tepat! Katanya adalah "{word}"',
    identifyFirstListen: 'Kenali objek terlebih dahulu untuk bermain!',
    miniGames: 'Mini Permainan',
    quizCardTitle: 'Tantangan Kuis',
    testKnowledge: 'Uji pengetahuanmu!',
    identifyFirst: 'Kenali objek terlebih dahulu',
    close: 'Tutup',
    puzzleGameTitle: 'Permainan Puzzle',
    solvePuzzle: 'Selesaikan puzzle!',
    aiBuddy: 'Teman AI',
    online: 'Online',
    chatThinking: 'Berpikir...',
    proMember: 'Anggota Pro',
    freeMember: 'Anggota Gratis',
    tryAgain: 'Coba Lagi',
    listenBtn: 'Dengarkan',
    quizBtn: 'Kuis',
    puzzleBtn: 'Puzzle',
    identifyFirstPuzzle: 'Unggah gambar terlebih dahulu',
    generating: 'Menghasilkan opsi...',
    quizError: 'Ups! Kuis tidak bisa dimuat. Coba lagi ya! 🔄',
    revealAnswer: 'Tampilkan Jawaban',
    nextQuestion: 'Pertanyaan Berikutnya',
    tryAnother: 'Coba Lagi',
    newImage: 'Gambar Baru',

    // Guest
    guest: 'Tamu',

    // Celebration overlay
    continue: 'Lanjutkan',
  },

  zh: {
    // Auth Screen
    appTitle: '这是什么？',
    appSubtitle: 'AI 驱动的儿童物体学习',
    welcomeBack: '欢迎回来！',
    joinTheFun: '加入乐趣！🎉',
    username: '用户名',
    email: '邮箱',
    password: '密码',
    login: '登录',
    createAccount: '创建账户',
    dontHaveAccount: '还没有账户？',
    alreadyHaveAccount: '已有账户？',
    register: '注册',
    cancel: '取消',
    continueAsGuest: '以游客身份继续 →',
    authFailed: '认证失败',
    networkError: '网络错误',

    // Header
    hiUser: '你好，{name}！👋',

    // Tabs
    home: '首页',
    learn: '学习',
    games: '游戏',
    chat: '聊天',
    me: '我的',

    // Settings
    settings: '设置',
    theme: '主题',
    languageLabel: '语言',
    upgradeToPro: '升级到专业版',
    upgrading: '⏳ 升级中...',
    getPro: '🚀 获取专业版',

    // Camera
    readyToExplore: '准备好探索了吗？',
    useCameraOrUpload: '使用相机或上传',
    uploadAnImage: '上传图片',
    camera: '相机',
    upload: '上传',
    identifying: '识别中...',
    cameraNotAvailable: '相机不可用，请上传图片！',
    couldNotIdentify: '无法识别，请重试！',

    // Result Card
    description: '描述',
    funFact: '趣味知识',
    category: '分类',
    listen: '听一听',
    noResults: '还没有结果',
    scanSomething: '拍照或上传图片开始学习！',
    discoveryLog: '发现记录',
    historyEmpty: '还没有发现，开始探索吧！',
    clearHistory: '清空全部',
    confirmClearAll: '清空所有历史记录？',

    // Learn Tab
    learnTitle: '学习与游戏',
    listenChallenge: '👂 听力挑战',
    listenInstruction: '听一听，选出正确的图片！',
    playSound: '播放声音',
    replay: '重播',
    listenCorrect: '正确！听力真棒！',
    listenWrong: '不太对！再试试！',
    nextWord: '下一个',
    identifyFirstListen: '先识别一个物体来玩！',
    listenBtn: '听一听',
    quizChallenge: '🧠 测验时间！',
    quizQuestion: '图片里是什么？',
    correctAnswer: '🎉 正确！',
    wrongAnswer: '😊 不太对！答案是 {name}',
    startQuiz: '开始测验',
    startSpelling: '开始拼写',
    quizCompleted: '测验完成！你得了 {score}/{total} 分！',

    // Puzzle
    puzzleChallenge: '🧩 拼图',
    startPuzzle: '开始拼图',
    puzzleInstruction: '点击拼图块，然后点击位置放置',
    puzzleComplete: '🎉 拼图完成！',
    puzzleWrong: '差一点！试试重新排列。',
    puzzleCorrect: '拼图完成啦！',
    puzzleIncorrect: '还不对哦，再试试！',

    // Chat
    chatTitle: '💬 随便问！',
    chatPlaceholder: '问我任何问题...',
    send: '发送',
    chatWelcome:
      '你好！👋 我是你的学习伙伴，关于世界有什么问题都可以问我！',
    chatError: '糟糕！出错了，请重试！🙈',

    // Profile
    profile: '个人资料',
    achievements: '🏆 成就',
    noAchievements: '还没有成就，继续探索吧！',
    feedback: '发送反馈',
    feedbackTitle: '你觉得这个应用怎么样？',
    feedbackPlaceholder: '告诉我们你的想法...',
    feedbackSent: '感谢你的反馈！🎉',
    submitFeedback: '提交',

    // Achievement descriptions
    achFirstScan: '首次发现！',
    achExplorer: '探索者',
    achScientist: '科学家',
    achProfessor: '教授',
    achPerfectScore: '完美得分！',
    achPuzzleMaster: '拼图大师',
    achGoodListener: '听力小达人',
    achChattyKid: '健谈小达人',
    achHelper: '热心小助手',
    achFirstScanDesc: '识别你的第一个物体',
    achExplorerDesc: '识别5个不同的物体',
    achScientistDesc: '识别10个不同的物体',
    achProfessorDesc: '识别20个不同的物体',
    achPerfectScoreDesc: '在测验中获得满分',
    achPuzzleMasterDesc: '正确完成拼图',
    achGoodListenerDesc: '正确听出物体名称',
    achChattyKidDesc: '发送第一条聊天消息',
    achHelperDesc: '提交应用反馈',

    // Voice messages (for TTS)
    ttsFunFact: '趣味知识：{fact}',
    ttsListenCorrect: '太棒了！你听出了 {word}！',
    ttsListenWrong: '不太对！那是 {word}，再试试！',
    ttsPuzzleComplete: '太厉害了！你完成了拼图！',
    ttsPuzzleAlmost: '差一点！试试重新排列拼图块。',

    // Theme names
    themeRainbowGarden: '彩虹花园',
    themeOceanExplorer: '海洋探险',
    themeEnchantedForest: '魔法森林',
    themeSunsetSky: '夕阳天空',
    themeStarryNight: '星空之夜',
    themeCandyKingdom: '糖果王国',

    // Portal strings
    chooseWorld: '选择你的世界！',
    enterWorld: '进入',
    unlockWorld: '解锁',
    tryProThemes: '试试PRO主题',

    // Additional UI strings
    learnPractice: '学习与练习',
    listenChallengeTitle: '听单词',
    correctAmazing: '正确！太棒了！',
    wrongNotQuite: '不太对！答案是 "{word}"',
    identifyFirstListen: '先识别一个物体来玩！',
    miniGames: '小游戏',
    quizCardTitle: '测验挑战',
    testKnowledge: '测试你的知识！',
    identifyFirst: '先识别一个物体',
    close: '关闭',
    puzzleGameTitle: '拼图游戏',
    solvePuzzle: '完成拼图！',
    aiBuddy: 'AI 伙伴',
    online: '在线',
    chatThinking: '思考中...',
    proMember: '专业版会员',
    freeMember: '免费会员',
    tryAgain: '再试一次',
    listenBtn: '听一听',
    quizBtn: '测验',
    puzzleBtn: '拼图',
    identifyFirstPuzzle: '先上传一张图片',
    generating: '正在生成选项...',
    quizError: '哎呀！测验加载失败了。要再试一次吗？🔄',
    revealAnswer: '揭晓答案',
    nextQuestion: '下一题',
    tryAnother: '再试一次',
    newImage: '新图片',

    // Guest
    guest: '游客',

    // Celebration overlay
    continue: '继续',
  },
};

/**
 * Returns a translation function `t` for the given language.
 *
 * Usage:
 *   const { t } = useTranslation(lang);
 *   t('appTitle')                           // static key
 *   t('hiUser', { name: 'Alice' })          // with interpolation
 */
export function useTranslation(lang: string) {
  const t = useMemo(() => {
    return (
      key: string,
      params?: Record<string, string | number>
    ): string => {
      const langKey = (lang as Lang) || 'en';
      let text =
        translations[langKey]?.[key] ||
        translations.en[key] ||
        key;

      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }

      return text;
    };
  }, [lang]);

  return { t };
}

