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
    voice: 'Voice',
    speed: 'Speed',
    upgradeToPro: 'Upgrade to Pro',
    unlockFeatures: 'Unlock all voices, themes & features!',
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

    // Learn Tab
    learnTitle: 'Learn & Play',
    spellChallenge: '🔤 Spelling Challenge',
    spellInstruction: 'Can you spell the name of this object?',
    typeHere: 'Type here...',
    checkSpelling: 'Check',
    correct: '✅ Correct!',
    wrong: '❌ Try again!',
    hint: 'Hint',
    showHint: 'Show Hint',
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
    achSpellingBee: 'Spelling Bee',
    achChattyKid: 'Chatty Kid',
    achHelper: 'Helper',
    achFirstScanDesc: 'Identify your very first object',
    achExplorerDesc: 'Identify 5 different objects',
    achScientistDesc: 'Identify 10 different objects',
    achProfessorDesc: 'Identify 20 different objects',
    achPerfectScoreDesc: 'Get a perfect score on a quiz',
    achPuzzleMasterDesc: 'Complete a puzzle correctly',
    achSpellingBeeDesc: 'Spell an object name correctly',
    achChattyKidDesc: 'Send your first chat message',
    achHelperDesc: 'Submit app feedback',

    // Voice messages (for TTS)
    ttsFunFact: 'Fun fact: {fact}',
    ttsSpellCorrect:
      'Great job! You spelled {word} correctly!',
    ttsSpellWrong:
      "Not quite! The word is {word}. Try again!",
    ttsPuzzleComplete:
      'Amazing! You completed the puzzle!',
    ttsPuzzleAlmost:
      'Almost! Try rearranging the pieces.',

    // Theme names
    themeDefault: 'Default',
    themeOcean: 'Ocean',
    themeForest: 'Forest',
    themeSunset: 'Sunset',
    themeNight: 'Night',
    themeCandy: 'Candy',

    // Additional UI strings
    speaking: 'Speaking...',
    learnPractice: 'Learn & Practice',
    spellTheWord: 'Spell the Word',
    correctAmazing: 'Correct! Amazing!',
    wrongNotQuite: 'Not quite! The word is "{word}"',
    identifyFirstSpell: 'Identify an object first to practice spelling!',
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
    spellIt: 'Spell It',
    quizBtn: 'Quiz',
    puzzleBtn: 'Puzzle',
    identifyFirstPuzzle: 'Upload an image first',

    // Guest
    guest: 'Guest',
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
    voice: 'Suara',
    speed: 'Kecepatan',
    upgradeToPro: 'Tingkatkan ke Pro',
    unlockFeatures: 'Buka semua suara, tema & fitur!',
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

    // Learn Tab
    learnTitle: 'Belajar & Bermain',
    spellChallenge: '🔤 Tantangan Ejaan',
    spellInstruction: 'Bisakah kamu mengeja nama objek ini?',
    typeHere: 'Ketik di sini...',
    checkSpelling: 'Periksa',
    correct: '✅ Benar!',
    wrong: '❌ Coba lagi!',
    hint: 'Petunjuk',
    showHint: 'Tampilkan Petunjuk',
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
    achSpellingBee: 'Ahli Ejaan',
    achChattyKid: 'Anak Pembicara',
    achHelper: 'Pembantu',
    achFirstScanDesc: 'Kenali objek pertamamu',
    achExplorerDesc: 'Kenali 5 objek berbeda',
    achScientistDesc: 'Kenali 10 objek berbeda',
    achProfessorDesc: 'Kenali 20 objek berbeda',
    achPerfectScoreDesc: 'Dapatkan nilai sempurna di kuis',
    achPuzzleMasterDesc: 'Selesaikan puzzle dengan benar',
    achSpellingBeeDesc: 'Eja nama objek dengan benar',
    achChattyKidDesc: 'Kirim pesan obrolan pertamamu',
    achHelperDesc: 'Kirim masukan aplikasi',

    // Voice messages (for TTS)
    ttsFunFact: 'Fakta menarik: {fact}',
    ttsSpellCorrect:
      'Bagus sekali! Kamu mengeja {word} dengan benar!',
    ttsSpellWrong:
      'Kurang tepat! Katanya adalah {word}. Coba lagi!',
    ttsPuzzleComplete:
      'Luar biasa! Kamu menyelesaikan puzzlenya!',
    ttsPuzzleAlmost:
      'Hampir! Coba susun ulang potongannya.',

    // Theme names
    themeDefault: 'Default',
    themeOcean: 'Lautan',
    themeForest: 'Hutan',
    themeSunset: 'Senja',
    themeNight: 'Malam',
    themeCandy: 'Permen',

    // Additional UI strings
    speaking: 'Berbicara...',
    learnPractice: 'Belajar & Berlatih',
    spellTheWord: 'Eja Kata Ini',
    correctAmazing: 'Benar! Luar biasa!',
    wrongNotQuite: 'Kurang tepat! Katanya adalah "{word}"',
    identifyFirstSpell: 'Kenali objek terlebih dahulu untuk berlatih mengeja!',
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
    spellIt: 'Eja',
    quizBtn: 'Kuis',
    puzzleBtn: 'Puzzle',
    identifyFirstPuzzle: 'Unggah gambar terlebih dahulu',

    // Guest
    guest: 'Tamu',
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
    voice: '语音',
    speed: '语速',
    upgradeToPro: '升级到专业版',
    unlockFeatures: '解锁所有语音、主题和功能！',
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

    // Learn Tab
    learnTitle: '学习与游戏',
    spellChallenge: '🔤 拼写挑战',
    spellInstruction: '你能拼出这个物体的名字吗？',
    typeHere: '在这里输入...',
    checkSpelling: '检查',
    correct: '✅ 正确！',
    wrong: '❌ 再试一次！',
    hint: '提示',
    showHint: '显示提示',
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
    achSpellingBee: '拼写达人',
    achChattyKid: '健谈小达人',
    achHelper: '热心小助手',
    achFirstScanDesc: '识别你的第一个物体',
    achExplorerDesc: '识别5个不同的物体',
    achScientistDesc: '识别10个不同的物体',
    achProfessorDesc: '识别20个不同的物体',
    achPerfectScoreDesc: '在测验中获得满分',
    achPuzzleMasterDesc: '正确完成拼图',
    achSpellingBeeDesc: '正确拼写物体名称',
    achChattyKidDesc: '发送第一条聊天消息',
    achHelperDesc: '提交应用反馈',

    // Voice messages (for TTS)
    ttsFunFact: '趣味知识：{fact}',
    ttsSpellCorrect: '太棒了！你拼对了 {word}！',
    ttsSpellWrong: '不太对！正确答案是 {word}，再试试！',
    ttsPuzzleComplete: '太厉害了！你完成了拼图！',
    ttsPuzzleAlmost: '差一点！试试重新排列拼图块。',

    // Theme names
    themeDefault: '默认',
    themeOcean: '海洋',
    themeForest: '森林',
    themeSunset: '日落',
    themeNight: '夜晚',
    themeCandy: '糖果',

    // Additional UI strings
    speaking: '播放中...',
    learnPractice: '学习与练习',
    spellTheWord: '拼写单词',
    correctAmazing: '正确！太棒了！',
    wrongNotQuite: '不太对！答案是 "{word}"',
    identifyFirstSpell: '先识别一个物体来练习拼写！',
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
    spellIt: '拼写',
    quizBtn: '测验',
    puzzleBtn: '拼图',
    identifyFirstPuzzle: '先上传一张图片',

    // Guest
    guest: '游客',
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
