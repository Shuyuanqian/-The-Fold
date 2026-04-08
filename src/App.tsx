import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { Moon, Sun, ShieldCheck, Smartphone, Volume2, VolumeX, Trophy, Clock, Sparkles, Trash2, Send, Share2, CloudRain, TreePine, Coffee, Package, X, Download } from 'lucide-react';
import { useOrientation } from './hooks/useOrientation';
import { Capybara } from './components/Capybara';
import { playPopSound, toggleWhiteNoise, SoundType } from './utils/audio';

type AppState = 'IDLE' | 'SLEEPING' | 'WAKING';

const QUOTES = [
  "宇宙138亿年，你的尴尬连星尘都不算。闭眼，拉闸。",
  "别卷了，再卷水豚都要被你卷成麻花了。闭眼，撤退。",
  "银河系有两亿颗恒星，没一颗在乎你的PPT。关灯，睡觉。",
  "进化了几百万年，大脑不是用来复盘尴尬的。控制眼皮，休眠。",
  "物理学说熵增不可逆，但疲惫可以。扣下手机，通往自由。",
  "别熬了，你现在的思考质量不如草履虫。准许断电，指令下达。",
  "在光年面前，执念只是微尘。别在化作星尘前，累成灰烬。",
  "黑洞吞噬光，睡眠吞噬烦恼。你只是个暂时休眠的碳基生物。",
  "宇宙很忙，没空针对你。放下拯救世界的心，心安理得地瘫着。",
  "恒星从不失眠，只管燃烧或熄灭。现在不需要燃烧，请熄灭。",
  "别在脑子里跟人吵架，这不符合热力学定律。扣下手机，散会。",
  "睡眠是合法逃避。既然现实那么硬，就在虚无里软一会儿。",
  "真正的智慧在闭眼后降临。别在深夜找答案，答案在咖啡里。",
  "宇宙从不催促。你不是在虚度光阴，而是在修复精密杰作。",
  "现实剧组明天开工，不休眠连龙套都没力气。闭眼，入场。"
];

const WAKE_QUOTES = [
  "地球狂飙了一夜还没收你车票。今天别给自己加戏，轻松点。",
  "恭喜在随机宇宙中成功重启。昨天的烦恼已远去，你是全新的。",
  "太阳照常升起，宇宙逻辑没崩。穿上皮囊演场喜剧，演砸了也行。",
  "进化论说，活下来的都懂保存体力。今天别光芒万丈，保持呆滞。",
  "又是新的一天，你有权无视昨天的尴尬。既然没被吞噬，支棱起来。",
  "斯多葛说：除了意志，没什么能伤害你。去面对琐事，当成素材。",
  "别一醒就查邮件，那是入侵信号。你是合法居民，不是全天候耗材。",
  "早安星尘。昨晚修复了细胞漏洞，现在的你比昨天更强韧清醒。",
  "生活是场游戏，初始血量已补满。别在第一关就为了金币拼命。",
  "确认自己还活着，世界还没毁灭。大事搞定了，剩下都是小闹。",
  "宇宙不需要完美齿轮，需要感受风的叶子。允许卡顿，允许存在。",
  "光子狂奔三十万公里只为让你看见世界。宇宙这么努力，别丧。",
  "英雄主义是看清真相后依然能笑出声。保持呼吸，蔑视内卷。",
  "世界很吵，你可以调低音量。去面对琐事吧，当成免费脱口秀。",
  "别急着把生活熨平，起伏才是证据。只要你不急，没人催得动你。"
];

const DREAM_FRAGMENTS = [
  "Email", "KPI", "Deadline", "Meeting", "Bug", "Report", "Feedback", "Overtime", "Traffic", "Noise"
];

const DREAM_TALK = [
  "草...好香...", "老板...别追了...", "这水...温正好...", "再睡...五分钟...", "KPI...是什么...能吃吗...", "我是...一只...快乐的...大橘子..."
];

const GIFTS = [
  { id: 'pebble', name: '圆润的鹅卵石', icon: '🪨', desc: '水豚在溪边为你捡到的，象征着坚韧。' },
  { id: 'leaf', name: '发光的树叶', icon: '🍃', desc: '森林深处的馈赠，能照亮深夜的焦虑。' },
  { id: 'chime', name: '小风铃', icon: '🎐', desc: '微风吹过时，会响起自由的声音。' },
  { id: 'shell', name: '贝壳', icon: '🐚', desc: '大海的耳语，提醒你世界很大。' },
  { id: 'mushroom', name: '森林小菇', icon: '🍄', desc: '静静生长的力量，不争不抢。' }
];

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [sleepStartTime, setSleepStartTime] = useState<number | null>(null);
  const [sleepDuration, setSleepDuration] = useState<number>(0);
  const [isWhiteNoiseOn, setIsWhiteNoiseOn] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SoundType>('BROWN');
  const [totalRestTime, setTotalRestTime] = useState<number>(() => {
    return Number(localStorage.getItem('total_rest_time') || 0);
  });
  const [totalWorriesCrushed, setTotalWorriesCrushed] = useState<number>(() => {
    return Number(localStorage.getItem('total_worries_crushed') || 0);
  });
  const [collection, setCollection] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('zen_collection') || '[]');
  });
  const [lastGift, setLastGift] = useState<typeof GIFTS[0] | null>(null);
  const [showCollection, setShowCollection] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedImage, setExportedImage] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(QUOTES[0]);
  const posterRef = useRef<HTMLDivElement>(null);
  const [worry, setWorry] = useState('');
  const [isWorrying, setIsWorrying] = useState(false);
  const [onlineRebels, setOnlineRebels] = useState(12403);
  const [isPressing, setIsPressing] = useState(false);
  const [canWakeUp, setCanWakeUp] = useState(false);
  const [dreamTalk, setDreamTalk] = useState('');
  const lastFaceDown = useRef(false);
  const { orientation, requestPermission, permissionGranted } = useOrientation();

  // Simulate online rebels fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineRebels(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Delay before allowing wake up to prevent accidental triggers
  useEffect(() => {
    if (appState === 'SLEEPING') {
      const timer = setTimeout(() => setCanWakeUp(true), 1000);
      return () => {
        clearTimeout(timer);
        setCanWakeUp(false);
      };
    }
  }, [appState]);

  // Capybara dream talk during sleep
  useEffect(() => {
    if (appState === 'SLEEPING') {
      const interval = setInterval(() => {
        setDreamTalk(DREAM_TALK[Math.floor(Math.random() * DREAM_TALK.length)]);
        setTimeout(() => setDreamTalk(''), 3000);
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const isLateNight = useMemo(() => {
    const hour = new Date().getHours();
    return hour >= 22 || hour < 5;
  }, []);

  const randomQuote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, [appState]);

  const randomWakeQuote = useMemo(() => {
    return WAKE_QUOTES[Math.floor(Math.random() * WAKE_QUOTES.length)];
  }, [appState]);

  const startSleeping = useCallback(() => {
    if (appState !== 'SLEEPING') {
      setAppState('SLEEPING');
      setSleepStartTime(Date.now());
      playPopSound();
      if (isWhiteNoiseOn) toggleWhiteNoise(true, selectedSound);
      if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
      }
      // Dissolve worry if exists
      if (worry) {
        const newWorriesCount = totalWorriesCrushed + 1;
        setTotalWorriesCrushed(newWorriesCount);
        localStorage.setItem('total_worries_crushed', String(newWorriesCount));
        setTimeout(() => setWorry(''), 2000);
      }
    }
  }, [appState, isWhiteNoiseOn, worry, selectedSound, totalWorriesCrushed]);

  const wakeUp = useCallback(() => {
    if (appState === 'SLEEPING' && sleepStartTime) {
      const duration = Math.floor((Date.now() - sleepStartTime) / 1000);
      setSleepDuration(duration);
      const newTotal = totalRestTime + duration;
      setTotalRestTime(newTotal);
      localStorage.setItem('total_rest_time', String(newTotal));
      
      // Award gift if duration > 10s (Lowered for better experience)
      if (duration > 10) {
        setCollection(prev => {
          const uncollected = GIFTS.filter(g => !prev.includes(g.id));
          if (uncollected.length > 0) {
            const gift = uncollected[Math.floor(Math.random() * uncollected.length)];
            const newCollection = [...prev, gift.id];
            localStorage.setItem('zen_collection', JSON.stringify(newCollection));
            setLastGift(gift);
            return newCollection;
          }
          setLastGift(null);
          return prev;
        });
      } else {
        setLastGift(null);
      }

      setAppState('WAKING');
      toggleWhiteNoise(false);
      setIsWorrying(false);
    }
  }, [appState, sleepStartTime, totalRestTime, collection]);

  useEffect(() => {
    if (permissionGranted) {
      if (orientation.isFaceDown) {
        startSleeping();
        lastFaceDown.current = true;
      } else if (appState === 'SLEEPING' && lastFaceDown.current) {
        wakeUp();
        lastFaceDown.current = false;
      }
    }
  }, [orientation.isFaceDown, permissionGranted, startSleeping, wakeUp, appState]);

  useEffect(() => {
    const handleDemoSleep = () => startSleeping();
    window.addEventListener('demo-sleep', handleDemoSleep);
    return () => window.removeEventListener('demo-sleep', handleDemoSleep);
  }, [startSleeping]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}时${mins}分`;
    if (mins > 0) return `${mins}分${secs}秒`;
    return `${secs}秒`;
  };

  const handlePoke = () => {
    setCurrentQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  };

  const handleSavePoster = async () => {
    if (!posterRef.current) return;
    
    setIsExporting(true);
    // Wait for DOM to update with exporting-mode class
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#F5F2ED',
        useCORS: true,
        logging: false
      });
      
      const image = canvas.toDataURL('image/jpeg', 0.9);
      setExportedImage(image);
    } catch (err) {
      console.error('Failed to generate poster:', err);
      alert('海报生成失败，请稍后再试');
    } finally {
      setIsExporting(false);
    }
  };

  // Demo Mode: Long press to simulate sleep, then click to wake
  const simulateSleep = () => {
    if (appState === 'IDLE') {
      startSleeping();
    } else if (appState === 'SLEEPING') {
      wakeUp();
    }
  };

  return (
    <div 
      className={`min-h-screen ${appState === 'SLEEPING' ? 'bg-[#050505]' : (isLateNight ? 'bg-[#1C1917] text-[#D4C4B5]' : 'bg-[#F5F2ED] text-[#3D2B1F]')} font-sans selection:bg-[#A68B6D]/30 overflow-hidden relative transition-colors duration-1000`}
      onClick={() => appState === 'SLEEPING' && canWakeUp && wakeUp()}
    >
      {/* Background Breathing Effect */}
      <motion.div 
        className="fixed inset-0 pointer-events-none opacity-20"
        animate={{
          background: isLateNight 
            ? [
                'radial-gradient(circle at 50% 50%, #3D2B1F 0%, transparent 70%)',
                'radial-gradient(circle at 60% 40%, #3D2B1F 0%, transparent 70%)',
                'radial-gradient(circle at 40% 60%, #3D2B1F 0%, transparent 70%)',
              ]
            : [
                'radial-gradient(circle at 50% 50%, #A68B6D 0%, transparent 70%)',
                'radial-gradient(circle at 60% 40%, #A68B6D 0%, transparent 70%)',
                'radial-gradient(circle at 40% 60%, #A68B6D 0%, transparent 70%)',
              ]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* Dimming Overlay for Long Press */}
      <AnimatePresence>
        {isPressing && appState === 'IDLE' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="fixed inset-0 bg-black z-[60] pointer-events-none flex items-center justify-center"
          >
            <motion.p 
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-white/40 text-xs font-mono tracking-[0.5em] uppercase"
            >
              Entering The Fold...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* IDLE STATE */}
        {appState === 'IDLE' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center min-h-screen p-8 text-center relative z-10"
          >
            {/* Top Bar Stats */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
                  <Trophy size={14} className="text-amber-600" />
                  <span className="text-xs font-bold font-mono">{formatDuration(totalRestTime)}</span>
                </div>
                <button 
                  onClick={() => setShowCollection(true)}
                  className="p-3 bg-white/60 backdrop-blur-md rounded-full border border-amber-200 shadow-lg shadow-amber-900/5 active:scale-90 transition-all hover:bg-amber-50 relative group"
                >
                  <Package size={18} className="text-amber-700" />
                  <motion.span 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-amber-400/20 pointer-events-none"
                  />
                  {collection.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                      {collection.length}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/40 backdrop-blur-md p-1 rounded-full border border-white/20">
                  {(['BROWN', 'RAIN', 'FOREST', 'CHEW'] as SoundType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedSound(type);
                        if (isWhiteNoiseOn) {
                          toggleWhiteNoise(false);
                          toggleWhiteNoise(true, type);
                        }
                      }}
                      className={`p-2 rounded-full transition-all ${selectedSound === type ? 'bg-[#A68B6D] text-white' : 'hover:bg-white/40'}`}
                    >
                      {type === 'BROWN' && <Volume2 size={14} />}
                      {type === 'RAIN' && <CloudRain size={14} />}
                      {type === 'FOREST' && <TreePine size={14} />}
                      {type === 'CHEW' && <Coffee size={14} />}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => {
                    const newState = !isWhiteNoiseOn;
                    setIsWhiteNoiseOn(newState);
                    toggleWhiteNoise(newState, selectedSound);
                  }}
                  className="p-3 bg-white/40 backdrop-blur-md rounded-full border border-white/20 shadow-sm active:scale-90 transition-transform"
                >
                  {isWhiteNoiseOn ? <Volume2 size={18} /> : <VolumeX size={18} className="opacity-40" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 mb-8">
              <div className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest bg-white/40 px-3 py-1 rounded-full ${isLateNight ? 'text-white/80' : 'text-[#A68B6D]'}`}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {onlineRebels.toLocaleString()} 位反抗者正在撤退
              </div>
              <div className={`text-[9px] font-mono opacity-40 ${isLateNight ? 'text-white' : 'text-[#A68B6D]'}`}>
                已共同粉碎 { (124042 + totalWorriesCrushed).toLocaleString() } 个烦恼
              </div>
            </div>

            <div className="mb-4">
              <Capybara 
                onPoke={handlePoke} 
                totalRestTime={totalRestTime} 
                onPressStart={() => setIsPressing(true)}
                onPressEnd={() => setIsPressing(false)}
              />
            </div>

            <AnimatePresence mode="wait">
              {!isWorrying ? (
                <motion.div
                  key="quote"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`max-w-xs ${isLateNight ? 'bg-black/40 border-white/5' : 'bg-white/60 border-[#A68B6D]/10'} backdrop-blur-md p-6 rounded-[2.5rem] border shadow-xl shadow-[#A68B6D]/5 mb-10 relative`}
                >
                  <Sparkles className="absolute -top-2 -right-2 text-[#A68B6D] opacity-40" size={20} />
                  <p className="text-sm leading-relaxed font-medium">
                    “{currentQuote}”
                  </p>
                  <button 
                    onClick={() => setIsWorrying(true)}
                    className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity mx-auto"
                  >
                    <Trash2 size={12} />
                    把烦恼丢给水豚
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="worry"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="max-w-xs w-full bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl mb-10 border border-[#A68B6D]/20"
                >
                  <textarea
                    value={worry}
                    onChange={(e) => setWorry(e.target.value)}
                    placeholder="写下此刻让你焦虑的事..."
                    className="w-full h-24 bg-transparent border-none focus:ring-0 text-sm resize-none placeholder:opacity-30"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button onClick={() => setIsWorrying(false)} className="text-xs opacity-40">取消</button>
                    <div className="flex items-center gap-2 text-[#A68B6D] text-xs font-bold">
                      <Send size={14} />
                      反扣手机即刻粉碎
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!permissionGranted ? (
              <button
                onClick={requestPermission}
                className="group relative flex items-center gap-3 px-10 py-5 bg-[#A68B6D] text-white rounded-full font-bold shadow-2xl shadow-[#A68B6D]/40 hover:bg-[#8C7358] transition-all active:scale-95 overflow-hidden"
              >
                <motion.div 
                  className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"
                />
                <ShieldCheck size={22} />
                开启休眠结界
              </button>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Smartphone className="text-[#A68B6D]" size={40} strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#A68B6D] tracking-widest uppercase">
                    反扣手机 · 闭眼撤退
                  </p>
                  <p className="text-[10px] opacity-40 font-mono uppercase">
                    Detection Active / Z-Axis Monitoring
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-16 flex flex-col items-center gap-4 opacity-60">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-px ${isLateNight ? 'bg-white/20' : 'bg-[#3D2B1F]/20'}`} />
                <span className={`text-[10px] font-mono tracking-[0.3em] ${isLateNight ? 'text-white/40' : 'text-[#3D2B1F]/40'}`}>THE FOLD v1.3</span>
                <div className={`w-12 h-px ${isLateNight ? 'bg-white/20' : 'bg-[#3D2B1F]/20'}`} />
              </div>
            </div>
          </motion.div>
        )}

        {/* SLEEPING STATE */}
        {appState === 'SLEEPING' && (
          <motion.div
            key="sleeping"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="fixed inset-0 bg-[#050505] z-50 flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Dream Talk */}
            <AnimatePresence>
              {dreamTalk && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 0.3, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-white text-sm font-medium absolute top-1/3 italic tracking-widest"
                >
                  “{dreamTalk}”
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dream Fragments */}
            <AnimatePresence>
              {worry && (
                <motion.div
                  initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  animate={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  className="text-white/40 text-xl font-bold absolute"
                >
                  {worry}
                </motion.div>
              )}
            </AnimatePresence>

            {DREAM_FRAGMENTS.map((frag, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0, 
                  x: Math.random() * 400 - 200, 
                  y: Math.random() * 400 - 200 
                }}
                animate={{ 
                  opacity: [0, 0.1, 0],
                  y: [200, -200],
                  x: (Math.random() * 400 - 200) + (Math.random() * 50 - 25)
                }}
                transition={{ 
                  duration: 10 + Math.random() * 10, 
                  repeat: Infinity,
                  delay: Math.random() * 10
                }}
                className="absolute text-white/5 text-xs font-mono tracking-widest pointer-events-none"
              >
                {frag}
              </motion.div>
            ))}

            <motion.div
              animate={{ 
                opacity: [0.05, 0.2, 0.05],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 6, repeat: Infinity }}
              className="flex flex-col items-center gap-8 relative z-10"
            >
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
              <div className="text-white/20 text-[10px] font-mono uppercase tracking-[1em] pl-[1em]">
                Deep Rest Mode
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* WAKING STATE */}
        {appState === 'WAKING' && (
          <motion.div
            key="waking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#F5F2ED] relative z-10 overflow-y-auto"
          >
            {/* Poster Container */}
            <motion.div 
              ref={posterRef}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border border-white/40 overflow-hidden flex flex-col relative ${isExporting ? 'exporting-mode' : ''}`}
            >
              {/* Poster Header */}
              <div className="h-40 bg-[#3D2B1F] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0, 50 0, 100 100 Z" fill="white" />
                  </svg>
                </div>
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 text-[#F5F2ED] flex flex-col items-center"
                >
                  <Sun size={40} strokeWidth={1} />
                  <p className="text-[9px] uppercase tracking-[0.6em] mt-4 font-mono opacity-60">Morning Rebel</p>
                </motion.div>
              </div>

              {/* Poster Content */}
              <div className="p-8 pb-12 flex flex-col items-center poster-content">
                <div className="flex items-center gap-2 text-[#A68B6D] font-mono text-[9px] uppercase tracking-widest mb-4 opacity-60">
                  <Clock size={10} />
                  <span>{new Date().toLocaleDateString()} · {formatDuration(sleepDuration)}</span>
                </div>

                <div className="quote-section">
                  “{randomWakeQuote}”
                </div>

                {/* Gift Reveal */}
                {lastGift && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.5 }}
                    className="mb-10 p-6 bg-[#F5F2ED]/50 rounded-[2rem] border border-[#A68B6D]/10 flex flex-col items-center gap-3 relative w-full"
                  >
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#A68B6D] text-white text-[7px] px-3 py-1 rounded-full font-bold uppercase tracking-[0.2em] ui-only">
                      New Gift
                    </div>
                    <span className="text-4xl">{lastGift.icon}</span>
                    <div className="text-center">
                      <p className="font-bold text-[#3D2B1F] text-xs">{lastGift.name}</p>
                      <p className="text-[9px] text-[#A68B6D] mt-1 italic">{lastGift.desc}</p>
                    </div>
                  </motion.div>
                )}

                <div className="data-panel">
                  <div className="data-item">
                    <p className="data-label">累计撤退</p>
                    <p className="data-value">{formatDuration(totalRestTime)}</p>
                  </div>
                  <div className="data-item">
                    <p className="data-label">粉碎烦恼</p>
                    <p className="data-value">{totalWorriesCrushed}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full ui-only">
                  <button 
                    onClick={() => {
                      setAppState('IDLE');
                      setLastGift(null);
                    }}
                    className="w-full py-4 bg-[#3D2B1F] text-[#F5F2ED] rounded-2xl font-bold shadow-xl shadow-[#3D2B1F]/20 active:scale-95 transition-transform text-sm tracking-widest"
                  >
                    收下勋章，继续生活
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setShowCollection(true)}
                      className="py-4 bg-[#F5F2ED] text-[#3D2B1F] rounded-2xl font-bold border border-[#3D2B1F]/10 flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs"
                    >
                      <Package size={16} />
                      查看收藏
                    </button>
                    <button 
                      onClick={handleSavePoster}
                      className="py-4 bg-white text-[#3D2B1F] rounded-2xl font-bold border border-[#3D2B1F]/10 flex items-center justify-center gap-2 active:scale-95 transition-transform text-xs"
                    >
                      <Share2 size={16} />
                      保存海报
                    </button>
                  </div>
                </div>

                {/* Export Only: Branding */}
                <div className="export-only mt-4 pt-8 border-t border-dashed border-[#A68B6D]/20 w-full text-center">
                  <p className="text-[9px] text-[#A68B6D] font-bold tracking-[0.2em] mb-2 opacity-60">
                    昨夜，有千万人在「褶皱」里一起结束了这一天
                  </p>
                  <p className="text-[7px] text-[#A68B6D]/40 font-mono uppercase tracking-widest">
                    SCAN TO FIND YOUR ZEN / THE FOLD APP
                  </p>
                </div>
              </div>

              {/* Poster Footer */}
              <div className="bg-[#F5F2ED] py-3 text-center border-t border-[#A68B6D]/5 ui-only">
                <p className="text-[7px] font-mono text-[#A68B6D]/30 tracking-[0.4em] uppercase">The Fold · Zen Collection v1.5</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXPORTED IMAGE OVERLAY */}
      <AnimatePresence>
        {exportedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="relative w-full max-w-sm"
            >
              <img src={exportedImage} className="w-full rounded-3xl shadow-2xl" alt="Zen Poster" />
              <button 
                onClick={() => setExportedImage(null)}
                className="absolute -top-4 -right-4 p-3 bg-white rounded-full shadow-xl text-black"
              >
                <X size={24} />
              </button>
            </motion.div>
            <div className="mt-8 text-white text-center">
              <p className="text-lg font-bold mb-2">海报已生成</p>
              <p className="text-sm opacity-60">请长按上方图片保存到相册</p>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = `TheFold_Poster_${Date.now()}.jpg`;
                  link.href = exportedImage;
                  link.click();
                }}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-white/10 rounded-full border border-white/20 text-xs font-bold"
              >
                <Download size={16} />
                直接下载
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COLLECTION SHELF - Moved outside main AnimatePresence to bypass mode="wait" */}
      <AnimatePresence>
        {showCollection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#F5F2ED] w-full max-w-md rounded-[3rem] p-8 relative shadow-2xl"
            >
              <button 
                onClick={() => setShowCollection(false)}
                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h3 className="text-xl font-black text-[#3D2B1F]">禅意收藏匣</h3>
                <p className="text-[10px] text-[#A68B6D] uppercase tracking-widest mt-1">Zen Collection Shelf</p>
              </div>

              {collection.length === 0 ? (
                <div className="py-20 text-center opacity-30">
                  <Package size={48} className="mx-auto mb-4" />
                  <p className="text-sm">空空如也，去深空里带点东西回来吧</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto pr-2">
                  {GIFTS.map((gift) => {
                    const isCollected = collection.includes(gift.id);
                    return (
                      <div 
                        key={gift.id}
                        className={`aspect-square rounded-3xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${isCollected ? 'bg-white border-amber-200 shadow-sm' : 'bg-gray-100/50 border-dashed border-gray-300 opacity-40'}`}
                      >
                        <span className={`text-3xl ${!isCollected ? 'grayscale' : ''}`}>
                          {isCollected ? gift.icon : '?'}
                        </span>
                        <span className="text-[10px] font-bold text-[#A68B6D]">
                          {isCollected ? gift.name : '未解锁'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#A68B6D] uppercase tracking-widest">
                  <span>解锁进度</span>
                  <span>{collection.length} / {GIFTS.length}</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(collection.length / GIFTS.length) * 100}%` }}
                    className="h-full bg-amber-500"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
