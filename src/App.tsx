import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Bell, 
  HelpCircle, 
  Home,
  PiggyBank,
  Eye, 
  EyeOff, 
  Copy, 
  Send, 
  Smartphone, 
  Zap, 
  PhoneCall, 
  FileText, 
  MoreHorizontal,
  ChevronRight,
  Fingerprint,
  CheckCircle2,
  Search,
  AlertCircle,
  User as UserIcon,
  Settings,
  Users,
  Trophy,
  History,
  Tv,
  Gamepad2,
  X,
  TrendingUp,
  Bitcoin,
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ShoppingBag,
  CreditCard,
  Package,
  Clock,
  ShieldCheck,
  MessageSquare,
  Gift,
  LayoutGrid,
  Plus,
  XCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button, Input, Card } from './components/UI';
import { BottomNav } from './components/BottomNav';
import { User, Transaction, Saving } from './types';

type Screen = 'onboarding' | 'login' | 'register' | 'dashboard' | 'savings' | 'account' | 'send' | 'data' | 'electricity' | 'edit_profile' | 'create_savings' | 'crypto' | 'store' | 'airtime' | 'tv' | 'transactions' | 'notifications' | 'help' | 'referral' | 'settings' | 'view_more' | 'biometrics';

export default function App() {
  const [screen, setScreen] = useState<Screen>('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [showBalance, setShowBalance] = useState(false);
  const [showBiometrics, setShowBiometrics] = useState(false);
  const [showOtherBills, setShowOtherBills] = useState(false);
  const [notifications, setNotifications] = useState<{ id: number; title: string; message: string; type: 'success' | 'info' | 'alert' }[]>([]);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [transactionMessage, setTransactionMessage] = useState('');
  const [productImageIndex, setProductImageIndex] = useState(0);

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'alert' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [{ id, title, message, type }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };
  const [showViewMore, setShowViewMore] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [savingsTab, setSavingsTab] = useState<'All' | 'Active' | 'Matured'>('All');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cryptoConvert, setCryptoConvert] = useState({
    amount: '',
    currency: 'BTC',
    rate: 16500000,
    showConfirm: false,
    isConverting: false
  });

  // Form states
  const [phone, setPhone] = useState('7018024702');
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: ''
  });

  const [savingsData, setSavingsData] = useState({
    title: '',
    targetAmount: '',
    recurringAmount: '',
    schedule: 'daily'
  });

  const onboardingSlides = [
    {
      title: "Send & Receive Money Instantly",
      description: "Transfer funds conveniently with high success rates and no failed transactions.",
      image: "https://picsum.photos/seed/fintech1/800/800"
    },
    {
      title: "Automated Savings Goals",
      description: "Set your goals and let us help you save automatically with daily, weekly or monthly plans.",
      image: "https://picsum.photos/seed/savings/800/800"
    },
    {
      title: "Crypto to Naira Conversion",
      description: "Receive crypto and convert it instantly to Naira at the best market rates.",
      image: "https://picsum.photos/seed/crypto/800/800"
    }
  ];

  const chartData = [
    { name: 'Mon', income: 4000, outgoing: 2400 },
    { name: 'Tue', income: 3000, outgoing: 1398 },
    { name: 'Wed', income: 2000, outgoing: 9800 },
    { name: 'Thu', income: 2780, outgoing: 3908 },
    { name: 'Fri', income: 1890, outgoing: 4800 },
    { name: 'Sat', income: 2390, outgoing: 3800 },
    { name: 'Sun', income: 3490, outgoing: 4300 },
  ];

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchTransactions();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/transactions/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBuyProduct = async (productId: number, amount: number, type: 'full' | 'installment') => {
    if (!user) return;
    setTransactionStatus('processing');
    setTransactionMessage('Processing your order...');
    
    try {
      const res = await fetch('/api/store/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, productId, amount, type })
      });
      if (res.ok) {
        setTransactionStatus('success');
        setTransactionMessage(type === 'full' ? 'Product purchased successfully!' : 'Installment plan activated successfully!');
        addNotification('Order Success', `Your order for ${selectedProduct?.name} has been placed.`, 'success');
        fetchTransactions();
        setSelectedProduct(null);
      } else {
        const data = await res.json();
        setTransactionStatus('error');
        setTransactionMessage(data.error || 'Failed to place order');
      }
    } catch (e) {
      setTransactionStatus('error');
      setTransactionMessage('A network error occurred. Please try again.');
      console.error(e);
    }
  };
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTransactionStatus('processing');
    setTransactionMessage('Logging you in safely...');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone || '7018024702' })
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setTransactionStatus('idle');
        setScreen('dashboard');
        addNotification('Security Alert', 'New login detected from this device.', 'alert');
        setTimeout(() => setShowBiometrics(true), 1000);
      } else {
        // If demo phone, auto register then login
        if (phone === '7018024702') {
           const regRes = await fetch('/api/auth/register', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               firstName: 'Saheed',
               lastName: 'Adekunle',
               email: 'demo@save2get.com',
               phone: '7018024702',
               occupation: 'Engineer'
             })
           });
           if (regRes.ok) {
             const userData = await regRes.json();
             setUser(userData);
             setTransactionStatus('idle');
             setScreen('dashboard');
             addNotification('Security Alert', 'New login detected from this device.', 'alert');
           }
        } else {
          setTransactionStatus('error');
          setTransactionMessage('User not found. Please register.');
        }
      }
    } catch (e) {
      setTransactionStatus('error');
      setTransactionMessage('Network error. Please try again.');
      console.error(e);
    }
  };

  const fetchRate = (currency: string) => {
    const rates: Record<string, number> = {
      'BTC': 16500000,
      'ETH': 1200000,
      'USDT': 1650
    };
    setCryptoConvert(prev => ({ ...prev, currency, rate: rates[currency] || 1650 }));
  };

  const handleConvertCrypto = async () => {
    if (!user) return;
    setTransactionStatus('processing');
    setTransactionMessage(`Converting ${cryptoConvert.amount} ${cryptoConvert.currency} to Naira...`);
    
    try {
      const res = await fetch('/api/crypto/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: parseFloat(cryptoConvert.amount),
          currency: cryptoConvert.currency,
          rate: cryptoConvert.rate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, balance: prev.balance + (parseFloat(cryptoConvert.amount) * cryptoConvert.rate) } : null);
        setCryptoConvert(prev => ({ ...prev, showConfirm: false, amount: '' }));
        setTransactionStatus('success');
        setTransactionMessage(`Successfully converted ${cryptoConvert.amount} ${cryptoConvert.currency} to Naira.`);
        addNotification('Crypto Success', `Received ₦ ${(parseFloat(cryptoConvert.amount) * cryptoConvert.rate).toLocaleString()} from conversion.`, 'success');
        fetchTransactions();
      } else {
        setTransactionStatus('error');
        setTransactionMessage('Conversion failed. Please check your balance.');
      }
    } catch (e) {
      setTransactionStatus('error');
      setTransactionMessage('Network error during conversion.');
      console.error(e);
    }
  };

  const handleRegister = async () => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        setScreen('dashboard');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: regData.firstName,
          lastName: regData.lastName,
          email: regData.email,
          occupation: regData.occupation
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setScreen('account');
      } else {
        alert('Failed to update profile');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateSavings = async () => {
    if (!user) return;
    setTransactionStatus('processing');
    setTransactionMessage('Setting up your savings goal...');
    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...savingsData
        })
      });
      if (res.ok) {
        setTransactionStatus('success');
        setTransactionMessage(`Savings goal "${savingsData.title}" created successfully!`);
        addNotification('Goal Created', `You've started a new journey towards ${savingsData.title}.`, 'success');
        setScreen('savings');
      } else {
        setTransactionStatus('error');
        setTransactionMessage('Failed to create savings goal.');
      }
    } catch (e) {
      setTransactionStatus('error');
      setTransactionMessage('Network error. Please try again.');
      console.error(e);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderOnboarding = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col px-6 pt-12 pb-10 bg-white"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <div className="relative w-full max-w-sm aspect-square overflow-hidden rounded-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={onboardingIndex}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className="absolute inset-0"
            >
              <img 
                src={onboardingSlides[onboardingIndex].image} 
                alt="Hero" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        <div className="space-y-4 min-h-[160px]">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {onboardingSlides[onboardingIndex].title}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed max-w-xs mx-auto">
            {onboardingSlides[onboardingIndex].description}
          </p>
        </div>

        <div className="flex gap-2">
          {onboardingSlides.map((_, i) => (
            <button 
              key={i}
              onClick={() => setOnboardingIndex(i)}
              className={`h-2 rounded-none transition-all ${onboardingIndex === i ? 'w-8 bg-brand-pink' : 'w-2 bg-pink-100'}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={() => setScreen('register')}>
            Register
          </Button>
          <Button fullWidth onClick={() => setScreen('login')}>
            Login
          </Button>
        </div>
        <button 
          onClick={() => {
            setPhone('7018024702');
            handleLogin();
          }}
          className="w-full py-3 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-brand-pink transition-colors"
        >
          Demo Login (Test Dashboard)
        </button>
      </div>
    </motion.div>
  );

  const renderLogin = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col px-6 pt-6 pb-10 bg-white"
    >
      <div className="flex justify-between items-center mb-12">
        <button onClick={() => setScreen('onboarding')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <button className="text-brand-pink font-semibold">Need Help?</button>
      </div>

      <div className="flex-1 space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 gradient-brand rounded-none flex items-center justify-center text-white shadow-lg">
            <Zap size={32} fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold">Log In</h2>
          <p className="text-slate-400">Kindly input your phone number to continue</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 ml-1">Phone Number</label>
            <div className="flex gap-0">
              <div className="flex items-center gap-2 px-4 py-4 bg-slate-50 border-2 border-slate-100 border-r-0 rounded-none">
                <img src="https://flagcdn.com/w40/ng.png" alt="NG" className="w-6 h-4 rounded-none" />
                <span className="font-medium text-slate-600">234</span>
                <ChevronRight size={16} className="rotate-90 text-slate-400" />
              </div>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none focus:border-primary-green/30 focus:bg-white transition-all font-medium shadow-sm shadow-slate-200/50"
                placeholder="8012345678"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 rounded-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fully Licensed by the CBN</span>
          <div className="w-px h-3 bg-slate-200" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Deposits Insured by NDIC</span>
        </div>
        <div className="space-y-3">
          <Button fullWidth onClick={() => handleLogin()}>Log In Now</Button>
          <button 
            onClick={() => {
              setPhone('7018024702');
              handleLogin();
            }}
            className="w-full py-3 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-pink transition-colors"
          >
            Quick Demo Login
          </button>
        </div>
        <p className="text-center text-slate-500">
          Don't have an account? <button onClick={() => setScreen('register')} className="text-brand-pink font-bold">Create an account</button>
        </p>
      </div>
    </motion.div>
  );

  const renderRegister = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen flex flex-col px-6 pt-6 pb-10 bg-white"
    >
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setScreen('onboarding')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold text-brand-pink uppercase tracking-widest">Step 1 of 5</span>
          <div className="flex gap-1 mt-1">
            <div className="w-6 h-1 bg-brand-pink rounded-none" />
            <div className="w-6 h-1 bg-slate-100 rounded-none" />
            <div className="w-6 h-1 bg-slate-100 rounded-none" />
            <div className="w-6 h-1 bg-slate-100 rounded-none" />
            <div className="w-6 h-1 bg-slate-100 rounded-none" />
          </div>
        </div>
        <button className="text-brand-pink font-semibold">Need Help?</button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto py-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 gradient-brand rounded-none flex items-center justify-center text-white shadow-md">
            <Zap size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold">Create an Account</h2>
          <p className="text-slate-400 text-sm">Kindly input your details to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First Name" 
            placeholder="e.g John" 
            value={regData.firstName}
            onChange={e => setRegData({...regData, firstName: e.target.value})}
          />
          <Input 
            label="Last Name" 
            placeholder="e.g Doe" 
            value={regData.lastName}
            onChange={e => setRegData({...regData, lastName: e.target.value})}
          />
        </div>
        <Input 
          label="Email Address" 
          placeholder="e.g johndoe89@gmail.com" 
          type="email"
          value={regData.email}
          onChange={e => setRegData({...regData, email: e.target.value})}
        />
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 ml-1">Phone Number</label>
          <div className="flex gap-0">
            <div className="flex items-center gap-2 px-4 py-4 bg-slate-50 border-2 border-slate-100 border-r-0 rounded-none">
              <img src="https://flagcdn.com/w40/ng.png" alt="NG" className="w-6 h-4 rounded-none" />
              <span className="font-medium text-slate-600">234</span>
              <ChevronRight size={16} className="rotate-90 text-slate-400" />
            </div>
            <input 
              type="tel"
              className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none focus:border-primary-green/30 focus:bg-white transition-all font-medium shadow-sm shadow-slate-200/50"
              placeholder="8012345678"
              value={regData.phone}
              onChange={e => setRegData({...regData, phone: e.target.value})}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 tracking-tight uppercase text-[10px]">Occupation</label>
          <div className="relative group">
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none focus:border-primary-green/30 focus:bg-white focus:shadow-lg focus:shadow-green-500/5 transition-all appearance-none shadow-sm shadow-slate-200/50 font-medium"
              value={regData.occupation}
              onChange={e => setRegData({...regData, occupation: e.target.value})}
            >
              <option value="">Select Occupation</option>
              <option value="Engineer">Engineer</option>
              <option value="Designer">Designer</option>
              <option value="Student">Student</option>
            </select>
            <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <Input label="Referral Code (Optional)" placeholder="e.g EXP001" />

        <div className="flex items-start gap-3 px-1">
          <input type="checkbox" className="mt-1 w-5 h-5 rounded-none border-2 border-slate-200 text-brand-pink focus:ring-brand-pink" />
          <p className="text-xs text-slate-500 leading-relaxed">
            By clicking Continue, you agree to KongaPay's <span className="text-brand-pink font-bold">Terms of Use</span> and <span className="text-brand-pink font-bold">Privacy Policy</span>
          </p>
        </div>
      </div>

      <div className="pt-6 space-y-4">
        <Button fullWidth onClick={handleRegister}>Continue</Button>
        <p className="text-center text-slate-500 text-sm">
          Already have an account? <button onClick={() => setScreen('login')} className="text-brand-pink font-bold">Sign In</button>
        </p>
      </div>
    </motion.div>
  );

  const renderDashboard = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-100 rounded-none flex items-center justify-center">
            <Home size={24} className="text-slate-900" />
          </div>
          <span className="text-xl font-bold">Home</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setScreen('help')} className="text-brand-pink"><HelpCircle size={28} /></button>
          <button onClick={() => setScreen('notifications')} className="text-slate-900 relative">
            <Bell size={28} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-none" />
            )}
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6 mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-none flex items-center justify-center text-white font-black text-lg">
              {user?.first_name?.[0] || 'S'}
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Welcome back</p>
              <h2 className="text-sm font-bold text-slate-900">{user?.first_name || 'Saheed'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setScreen('notifications')} className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <Bell size={20} />
            </button>
            <button onClick={() => setScreen('account')} className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
              <UserIcon size={20} />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        <Card className="bg-slate-900 p-8 space-y-8 relative overflow-hidden border-none shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-none -mr-20 -mt-20 blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Total Balance</span>
                <button onClick={() => setShowBalance(!showBalance)} className="p-1 hover:bg-white/10 rounded-none transition-colors">
                  {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
              <div className="flex items-baseline gap-2 text-white">
                <span className="text-4xl font-black tracking-tighter">{showBalance ? (user?.balance.toFixed(2) || '0.00') : '****'}</span>
                <span className="text-sm font-bold opacity-60">NGN</span>
              </div>
            </div>
            <div className="text-right space-y-3 relative z-10">
              <div className="flex items-center gap-2 justify-end text-white/60">
                <span className="text-[9px] font-black uppercase tracking-widest">A/C: {user?.account_number || '1003450051'}</span>
                <Copy size={12} className="cursor-pointer hover:text-white transition-colors" />
              </div>
              <button 
                onClick={() => setScreen('transactions')}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-white/10"
              >
                History <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </Card>

        {/* Loyalty Rewards */}
        <Card className="bg-white p-6 flex justify-between items-center border-none shadow-xl shadow-slate-200/40 group overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-pink" />
          <div className="space-y-1.5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loyalty Rewards</span>
              <span className="bg-pink-50 text-brand-pink text-[8px] font-black px-2 py-0.5 rounded-none uppercase">6% P.A</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp size={16} />
              <span className="text-sm font-black tracking-tight">0.00 NGN Earned</span>
            </div>
          </div>
          <button 
            onClick={() => setScreen('savings')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-slate-200 hover:bg-black relative z-10"
          >
            K-SAVE <ChevronRight size={12} className="inline ml-1" />
          </button>
        </Card>

        {/* Analytics Chart */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Cash Flow Analytics</h3>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-none bg-primary-green" />
                <span className="text-[9px] font-black text-slate-400 uppercase">In</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-none bg-brand-pink" />
                <span className="text-[9px] font-black text-slate-400 uppercase">Out</span>
              </div>
            </div>
          </div>
          <Card className="p-6 h-72 bg-white border-none shadow-2xl shadow-slate-200/50">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00A859" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00A859" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF69B4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#FF69B4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="income" stroke="#00A859" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={4} />
                <Area type="monotone" dataKey="outgoing" stroke="#FF69B4" fillOpacity={1} fill="url(#colorOutgoing)" strokeWidth={4} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Quick Services</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { id: 'send', label: 'Transfer', icon: Send, color: 'text-brand-pink bg-pink-50' },
              { id: 'airtime', label: 'Airtime', icon: Smartphone, color: 'text-primary-green bg-green-50' },
              { id: 'data', label: 'Data', icon: PhoneCall, color: 'text-blue-500 bg-blue-50' },
              { id: 'electricity', label: 'Power', icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
              { id: 'tv', label: 'TV Cable', icon: Tv, color: 'text-indigo-500 bg-indigo-50' },
              { id: 'store', label: 'Store', icon: ShoppingBag, color: 'text-purple-500 bg-purple-50' },
              { id: 'crypto', label: 'Crypto', icon: Bitcoin, color: 'text-orange-500 bg-orange-50' },
              { id: 'more', label: 'More', icon: LayoutGrid, color: 'text-slate-900 bg-slate-50' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button 
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'more') setScreen('view_more');
                    else setScreen(action.id as Screen);
                  }}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-none flex items-center justify-center shadow-sm border border-slate-100 transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-active:scale-90 ${action.color}`}>
                    <Icon size={24} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 text-center leading-tight uppercase tracking-wider group-hover:text-slate-900 transition-colors">{action.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Promo Banner */}
        <Card className="relative h-40 overflow-hidden gradient-brand p-8 flex items-center justify-between border-none shadow-2xl shadow-orange-500/30 group cursor-pointer">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-none -mr-20 -mt-20 blur-3xl group-hover:scale-110 transition-transform duration-700" />
          <div className="space-y-2 relative z-10 max-w-[200px]">
            <h3 className="text-white font-black text-2xl leading-tight uppercase tracking-tighter">Pay Bills with Zero Charges</h3>
            <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Limited Time Offer</p>
          </div>
          <div className="relative z-10 w-20 h-20 bg-white/20 rounded-none flex items-center justify-center backdrop-blur-md border border-white/20">
            <Zap size={32} className="text-white" />
          </div>
        </Card>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Recent Activity</h3>
            <button onClick={() => setScreen('transactions')} className="text-brand-pink font-black text-[10px] uppercase tracking-widest hover:underline">See All</button>
          </div>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300 space-y-4 bg-white rounded-none border-2 border-dashed border-slate-100">
                <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center">
                  <History size={32} strokeWidth={1.5} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest">No recent activity</p>
              </div>
            ) : (
              transactions.slice(0, 5).map((tx) => (
                <Card key={tx.id} className="p-4 flex items-center justify-between bg-white border-none shadow-lg shadow-slate-200/30 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-none flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-primary-green' : 'bg-red-50 text-red-500'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 text-sm truncate max-w-[150px]">{tx.description}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{tx.category} • {new Date(tx.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-primary-green' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'} ₦ {tx.amount.toLocaleString()}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNav activeTab="dashboard" onTabChange={(tab) => setScreen(tab as Screen)} />

      {/* Biometrics Modal */}
      <AnimatePresence>
        {showBiometrics && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowBiometrics(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-none p-8 flex flex-col items-center text-center space-y-8 shadow-2xl"
            >
              <div className="w-24 h-24 bg-pink-50 rounded-none flex items-center justify-center text-brand-pink animate-pulse">
                <Fingerprint size={64} strokeWidth={1.5} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  You can also sign in to KongaPay with your biometrics
                </h3>
              </div>
              <div className="w-full space-y-4">
                <Button fullWidth onClick={() => setShowBiometrics(false)}>Enable Biometrics</Button>
                <button 
                  onClick={() => setShowBiometrics(false)}
                  className="text-slate-400 font-bold uppercase tracking-widest text-sm"
                >
                  Maybe later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Other Bills Modal */}
      <AnimatePresence>
        {showOtherBills && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowOtherBills(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-lg rounded-none p-8 flex flex-col space-y-8 shadow-2xl safe-area-bottom"
            >
              <div className="flex justify-center">
                <div className="w-12 h-1.5 bg-slate-100 rounded-none" />
              </div>
              <h3 className="text-2xl font-bold text-center">Other Bills</h3>
              <div className="space-y-2">
                {[
                  { label: 'Airtime', icon: PhoneCall },
                  { label: 'Data', icon: Smartphone },
                  { label: 'Electricity', icon: Zap },
                  { label: 'TV', icon: Tv },
                  { label: 'Sports Betting', icon: Gamepad2 },
                ].map((item, i) => (
                  <button 
                    key={i}
                    className="w-full flex items-center gap-4 p-5 rounded-none hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-none flex items-center justify-center text-slate-900">
                      <item.icon size={24} />
                    </div>
                    <span className="text-lg font-bold text-slate-900">{item.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setShowOtherBills(false)}
                  className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center text-slate-400 border border-slate-100"
                >
                  <X size={32} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  const renderSavings = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40 border-b border-slate-100">
        <div className="w-10 h-10 bg-slate-50 rounded-none flex items-center justify-center border border-slate-100">
          <PiggyBank size={24} className="text-slate-900" />
        </div>
        <span className="text-xl font-bold">Savings</span>
      </div>

      <div className="px-6 mt-6">
        <div className="flex bg-white p-1.5 rounded-none border border-slate-100 mb-8 shadow-sm">
          {(['All', 'Active', 'Matured'] as const).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setSavingsTab(tab)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-none ${savingsTab === tab ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <Card className="flex flex-col items-center text-center space-y-3 mb-8 bg-white border-none shadow-2xl shadow-slate-200/50">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Savings Balance</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowBalance(!showBalance)} className="p-2 bg-slate-50 rounded-none text-slate-400">
              {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black tracking-tighter">{showBalance ? '0.00' : '****'}</span>
              <span className="text-sm font-bold text-slate-400">NGN</span>
            </div>
          </div>
          <div className="px-4 py-1.5 bg-green-50 rounded-none">
            <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Total Earnings: + 0.00</p>
          </div>
        </Card>

        <Card className="bg-slate-900 p-6 flex justify-between items-center text-white mb-8 border-none shadow-2xl shadow-slate-900/20">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">Loyalty Rewards</span>
              <span className="bg-brand-pink text-[8px] font-black px-2 py-0.5 rounded-none uppercase">6% P.A</span>
            </div>
            <p className="text-[10px] text-white/50 font-medium leading-relaxed max-w-[200px]">Earn monetary rewards on your balance daily</p>
            <div className="flex items-center gap-1 text-green-400 mt-2">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">0.00 NGN Earned</span>
            </div>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-none flex items-center justify-center backdrop-blur-md">
            <ChevronRight size={20} className="text-white/60" />
          </div>
        </Card>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Your Saving Goals</h3>
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-none border-2 border-dashed border-slate-100 text-slate-300 space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-none flex items-center justify-center">
              <PiggyBank size={32} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest">No {savingsTab.toLowerCase()} goals</p>
          </div>
        </div>

        <div className="mt-10">
          <Button variant="secondary" fullWidth onClick={() => setScreen('create_savings')}>
            Create New Goal
          </Button>
        </div>
      </div>

      <BottomNav activeTab="savings" onTabChange={(tab) => setScreen(tab as Screen)} />
    </motion.div>
  );

  const renderCreateSavings = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('savings')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Create Savings Goal</h1>
      </div>

      <div className="space-y-6">
        <Input 
          label="What are you saving for?" 
          placeholder="e.g. New Laptop" 
          value={savingsData.title}
          onChange={e => setSavingsData({...savingsData, title: e.target.value})}
        />
        <Input 
          label="Target Amount (NGN)" 
          placeholder="500,000" 
          type="number"
          value={savingsData.targetAmount}
          onChange={e => setSavingsData({...savingsData, targetAmount: e.target.value})}
        />
        <Input 
          label="Recurring Amount (NGN)" 
          placeholder="5,000" 
          type="number"
          value={savingsData.recurringAmount}
          onChange={e => setSavingsData({...savingsData, recurringAmount: e.target.value})}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-500 ml-1">Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {['daily', 'weekly', 'monthly'].map((freq) => (
              <button
                key={freq}
                onClick={() => setSavingsData({...savingsData, schedule: freq})}
                className={`py-3 rounded-none text-xs font-bold uppercase tracking-wider border-2 transition-all ${savingsData.schedule === freq ? 'border-brand-pink bg-pink-50 text-brand-pink' : 'border-slate-100 bg-slate-50 text-slate-400'}`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <Card className="bg-slate-50 border-none p-4 flex items-start gap-3">
          <Calendar className="text-brand-pink mt-1" size={20} />
          <p className="text-xs text-slate-500 leading-relaxed">
            Your first transfer will be processed immediately. Subsequent transfers will be automated based on your selected schedule.
          </p>
        </Card>

        <div className="pt-6">
          <Button fullWidth onClick={handleCreateSavings}>Create Goal</Button>
        </div>
      </div>
    </motion.div>
  );

  const renderCrypto = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40 border-b border-slate-100">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2 hover:bg-slate-50 rounded-none transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Crypto Wallet</h1>
      </div>

      <div className="p-6 space-y-6">
        <div className="gradient-brand rounded-none p-8 text-white space-y-8 shadow-2xl shadow-orange-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-none -mr-20 -mt-20 blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="space-y-1">
              <p className="text-white/70 text-[10px] font-black uppercase tracking-[0.2em]">Total Portfolio Value</p>
              <h2 className="text-4xl font-black tracking-tighter">$1,240.50</h2>
            </div>
            <div className="w-14 h-14 bg-white/20 rounded-none flex items-center justify-center backdrop-blur-xl border border-white/20">
              <Bitcoin size={32} />
            </div>
          </div>
          <div className="flex gap-4 relative z-10">
            <button className="flex-1 bg-white/15 hover:bg-white/25 py-4 rounded-none flex items-center justify-center gap-3 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
              <ArrowDownLeft size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Receive</span>
            </button>
            <button className="flex-1 bg-white/15 hover:bg-white/25 py-4 rounded-none flex items-center justify-center gap-3 backdrop-blur-xl border border-white/10 transition-all active:scale-95">
              <ArrowUpRight size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Send</span>
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Your Assets</h3>
          <div className="space-y-3">
            {[
              { name: 'Bitcoin', symbol: 'BTC', balance: '0.024', value: '$1,020.00', color: 'bg-orange-100 text-orange-600' },
              { name: 'Ethereum', symbol: 'ETH', balance: '0.12', value: '$220.50', color: 'bg-blue-100 text-blue-600' },
            ].map((asset, i) => (
              <Card key={i} className="p-5 flex items-center justify-between bg-white border-none shadow-xl shadow-slate-200/40">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${asset.color} rounded-none flex items-center justify-center font-black text-lg`}>
                    {asset.symbol[0]}
                  </div>
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{asset.name}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{asset.balance} {asset.symbol}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-black text-slate-900">{asset.value}</p>
                  <button 
                    onClick={() => {
                      setCryptoConvert(prev => ({ ...prev, currency: asset.symbol }));
                      fetchRate(asset.symbol);
                    }}
                    className="px-3 py-1.5 bg-pink-50 text-[9px] font-black text-brand-pink uppercase tracking-widest rounded-none hover:bg-brand-pink hover:text-white transition-all"
                  >
                    Convert
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Conversion Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest ml-1">Quick Conversion</h3>
          <Card className="p-8 space-y-8 bg-white border-none shadow-2xl shadow-slate-200/50">
            <div className="space-y-3">
              <Input 
                label={`Amount in ${cryptoConvert.currency}`}
                type="number"
                value={cryptoConvert.amount}
                onChange={e => setCryptoConvert({...cryptoConvert, amount: e.target.value})}
                placeholder="0.00"
                className="text-2xl font-black tracking-tight h-16"
                icon={<Bitcoin size={24} className="text-orange-500" />}
              />
            </div>

            <div className="flex justify-between items-center p-5 bg-slate-50 rounded-none border border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">You Receive</p>
                <p className="text-2xl font-black text-primary-green tracking-tighter">
                  ₦ {(parseFloat(cryptoConvert.amount || '0') * cryptoConvert.rate).toLocaleString()}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Rate</p>
                <p className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-none border border-slate-100">
                  1 {cryptoConvert.currency} = ₦ {cryptoConvert.rate.toLocaleString()}
                </p>
              </div>
            </div>

            <Button 
              variant="secondary"
              fullWidth 
              disabled={!cryptoConvert.amount || parseFloat(cryptoConvert.amount) <= 0}
              onClick={() => setCryptoConvert({...cryptoConvert, showConfirm: true})}
              className="h-16 text-lg"
            >
              Convert to Naira
            </Button>
          </Card>
        </div>

        {/* Confirmation Modal */}
        <AnimatePresence>
          {cryptoConvert.showConfirm && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setCryptoConvert({...cryptoConvert, showConfirm: false})}
              />
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative bg-white w-full max-w-sm rounded-none p-10 flex flex-col items-center text-center space-y-8 shadow-3xl"
              >
                <div className="w-24 h-24 bg-green-50 rounded-none flex items-center justify-center text-primary-green relative">
                  <div className="absolute inset-0 bg-green-100 rounded-none animate-ping opacity-20" />
                  <Bitcoin size={48} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Confirm Conversion</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    You are about to convert <span className="font-black text-slate-900">{cryptoConvert.amount} {cryptoConvert.currency}</span> to <span className="font-black text-primary-green">₦ {(parseFloat(cryptoConvert.amount) * cryptoConvert.rate).toLocaleString()}</span>
                  </p>
                </div>
                <div className="w-full space-y-4">
                  <Button fullWidth onClick={handleConvertCrypto} isLoading={cryptoConvert.isConverting} className="h-16">
                    Confirm & Convert
                  </Button>
                  <button 
                    onClick={() => setCryptoConvert({...cryptoConvert, showConfirm: false})}
                    className="w-full py-2 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <Card className="bg-white border-none p-6 space-y-4 shadow-xl shadow-slate-200/40">
          <div className="flex items-center gap-3 text-primary-orange">
            <TrendingUp size={24} />
            <h3 className="font-black text-sm uppercase tracking-widest">Market Insights</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            BTC is up 2.4% in the last 24 hours. Current conversion rate: 1 USDT = 1,650 NGN. Best time to convert!
          </p>
        </Card>
      </div>
    </motion.div>
  );

  const renderAccount = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 sticky top-0 z-40">
        <h1 className="text-xl font-bold">Account</h1>
      </div>

      <div className="px-0 py-8 flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 bg-slate-200 rounded-none flex items-center justify-center text-4xl font-black text-slate-400">
            {user?.first_name?.[0] || 'S'}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-pink rounded-none border-4 border-white flex items-center justify-center text-white">
            <Smartphone size={14} />
          </button>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">{user?.first_name} {user?.last_name || 'Saheed Adekunle'}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-[10px] font-black text-brand-pink uppercase tracking-widest">Tier 1</span>
            <div className="w-1 h-1 bg-slate-300 rounded-none" />
            <span className="text-[10px] font-bold text-slate-400 tracking-wider">{user?.phone || '07018024702'}</span>
          </div>
        </div>
      </div>

      <div className="px-0">
        <Card className="p-0 border-x-0">
          {[
            { label: 'Personal Details', icon: UserIcon, color: 'bg-pink-50 text-brand-pink', action: () => {
              if (user) {
                setRegData({
                  firstName: user.first_name,
                  lastName: user.last_name,
                  email: user.email,
                  phone: user.phone,
                  occupation: user.occupation
                });
                setScreen('edit_profile');
              }
            }},
            { label: 'Settings', icon: Settings, color: 'bg-pink-50 text-brand-pink', action: () => setScreen('settings') },
            { label: 'Security & Biometrics', icon: ShieldCheck, color: 'bg-pink-50 text-brand-pink', action: () => setScreen('biometrics') },
            { label: 'Beneficiaries', icon: Users, color: 'bg-pink-50 text-brand-pink' },
            { label: 'Account Statement', icon: FileText, color: 'bg-pink-50 text-brand-pink' },
            { label: 'Help & Support', icon: HelpCircle, color: 'bg-pink-50 text-brand-pink', action: () => setScreen('help') },
          ].map((item, i) => (
            <button 
              key={i}
              onClick={item.action}
              className="w-full flex items-center justify-between p-6 rounded-none hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-b-0"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${item.color} rounded-none flex items-center justify-center`}>
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-slate-700">{item.label}</span>
              </div>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          ))}
        </Card>
      </div>

      <BottomNav activeTab="account" onTabChange={(tab) => setScreen(tab as Screen)} />
    </motion.div>
  );

  const renderSendMoney = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Send Money</h1>
      </div>

      <div className="p-6 space-y-6">
        <Card className="space-y-4">
          <Input label="Account Number" placeholder="1234567890" type="tel" maxLength={10} />
        </Card>

        <Card className="space-y-6 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Send to Beneficiaries</h3>
            <button className="text-brand-pink font-bold text-sm">View All</button>
          </div>
          <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-none pl-12 pr-4 py-4 outline-none focus:border-primary-green/30 focus:bg-white transition-all"
              placeholder="Search name or account number"
            />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 text-slate-400">
            <div className="w-24 h-24 bg-pink-50 rounded-none flex items-center justify-center text-brand-pink relative">
              <div className="absolute inset-0 bg-pink-100 rounded-none scale-125 opacity-20" />
              <AlertCircle size={48} />
            </div>
            <p className="font-bold text-slate-500">No Recent Beneficiaries Yet</p>
          </div>
          <Button fullWidth onClick={() => {
            setTransactionStatus('processing');
            setTransactionMessage('Sending money securely...');
            setTimeout(() => {
              setTransactionStatus('success');
              setTransactionMessage('Money sent successfully!');
              addNotification('Transfer Success', '₦ 5,000 sent to Saheed Adekunle.', 'success');
              fetchTransactions();
            }, 2000);
          }}>Send Money</Button>
        </Card>
      </div>
    </motion.div>
  );

  const renderStore = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40 border-b border-slate-100">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2 hover:bg-slate-50 rounded-none transition-colors">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Save2Get Store</h1>
      </div>

      <div className="p-6 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="relative aspect-[3/4] rounded-none overflow-hidden group cursor-pointer shadow-xl shadow-slate-200/40"
              onClick={() => {
                setSelectedProduct(product);
                setProductImageIndex(0);
              }}
            >
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90" />
              <div className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md bg-white/10 border-t border-white/10">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1 truncate">{product.category}</p>
                <h4 className="font-bold text-sm text-white truncate mb-2">{product.name}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-primary-green font-black text-xs">₦ {product.price.toLocaleString()}</span>
                  <div className="w-6 h-6 bg-white/20 rounded-none flex items-center justify-center">
                    <Plus size={12} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setSelectedProduct(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative bg-white w-full max-w-md rounded-none p-8 space-y-6 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-100 rounded-none" />
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedProduct.name}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedProduct.category}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-2 bg-slate-100 rounded-none hover:bg-slate-200 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Image Slider */}
              <div className="relative rounded-none overflow-hidden shadow-2xl shadow-slate-200 group">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={productImageIndex}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    src={productImageIndex === 0 ? selectedProduct.image : `https://picsum.photos/seed/${selectedProduct.id + productImageIndex}/800/600`}
                    alt={selectedProduct.name} 
                    className="w-full h-64 object-cover" 
                    referrerPolicy="no-referrer" 
                  />
                </AnimatePresence>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {[0, 1, 2].map(i => (
                    <button 
                      key={i} 
                      onClick={() => setProductImageIndex(i)}
                      className={`w-2 h-2 rounded-none transition-all ${productImageIndex === i ? 'bg-white w-6' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
                <button 
                  onClick={() => setProductImageIndex(prev => (prev + 1) % 3)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-none flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</h4>
                <p className="text-slate-600 text-sm leading-relaxed font-medium">
                  {selectedProduct.description}
                </p>
              </div>

              <div className="flex justify-between items-center p-6 bg-slate-50 rounded-none border border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Full Price</p>
                  <p className="text-2xl font-black text-primary-green tracking-tighter">₦ {selectedProduct.price.toLocaleString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Installment</p>
                  <p className="text-xs font-black text-slate-900">₦ {(selectedProduct.price / 12).toLocaleString()} / mo</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  fullWidth 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyProduct(selectedProduct.id, selectedProduct.price / 10, 'installment');
                  }}
                  className="h-16"
                >
                  Pay Small Small
                </Button>
                <Button 
                  variant="secondary"
                  fullWidth 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuyProduct(selectedProduct.id, selectedProduct.price, 'full');
                  }}
                  className="h-16"
                >
                  Buy Now
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav activeTab="store" onTabChange={(tab) => setScreen(tab as Screen)} />
    </motion.div>
  );

  const renderTransactions = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Transaction History</h1>
      </div>

      <div className="p-6 space-y-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <History size={64} strokeWidth={1} />
            <p className="font-bold">No transactions yet</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-none flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-primary-green' : 'bg-red-50 text-red-500'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-sm">{tx.description}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {tx.category} • {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <p className={`font-black text-sm ${tx.type === 'credit' ? 'text-primary-green' : 'text-red-500'}`}>
                {tx.type === 'credit' ? '+' : '-'} ₦ {tx.amount.toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </motion.div>
  );

  const renderAirtime = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Buy Airtime</h1>
      </div>
      <div className="space-y-6">
        <Input label="Phone Number" placeholder="08012345678" type="tel" />
        <div className="grid grid-cols-4 gap-2">
          {['MTN', 'Airtel', 'Glo', '9mobile'].map(net => (
            <button key={net} className="p-3 bg-slate-50 border-2 border-slate-100 rounded-none text-[10px] font-black uppercase tracking-widest text-slate-600 hover:border-primary-green transition-all">
              {net}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[100, 200, 500, 1000, 2000, 5000].map(amt => (
            <button key={amt} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-none font-black text-slate-900 hover:bg-white hover:border-primary-green transition-all">
              ₦ {amt}
            </button>
          ))}
        </div>
        <Button fullWidth onClick={() => {
          setTransactionStatus('processing');
          setTransactionMessage('Processing airtime purchase...');
          setTimeout(() => {
            setTransactionStatus('success');
            setTransactionMessage('Airtime purchase successful!');
            addNotification('Airtime Success', 'Your airtime top-up was successful.', 'success');
          }, 2000);
        }}>Proceed</Button>
      </div>
    </motion.div>
  );
  const renderEditProfile = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('account')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Edit Profile</h1>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-slate-100 rounded-none flex items-center justify-center text-4xl font-black text-slate-300 border-2 border-slate-50">
              {regData.firstName?.[0] || 'S'}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-none flex items-center justify-center border-2 border-white">
              <Plus size={16} />
            </button>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Change Profile Picture</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="First Name" 
            value={regData.firstName}
            onChange={e => setRegData({...regData, firstName: e.target.value})}
          />
          <Input 
            label="Last Name" 
            value={regData.lastName}
            onChange={e => setRegData({...regData, lastName: e.target.value})}
          />
        </div>
        <Input 
          label="Email Address" 
          type="email"
          value={regData.email}
          onChange={e => setRegData({...regData, email: e.target.value})}
        />
        <Input 
          label="Phone Number" 
          type="tel"
          value={regData.phone}
          onChange={e => setRegData({...regData, phone: e.target.value})}
        />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 tracking-tight uppercase text-[10px]">Occupation</label>
          <div className="relative group">
            <select 
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none focus:border-primary-green/30 focus:bg-white focus:shadow-lg focus:shadow-green-500/5 transition-all appearance-none shadow-sm shadow-slate-200/50 font-medium"
              value={regData.occupation}
              onChange={e => setRegData({...regData, occupation: e.target.value})}
            >
              <option value="">Select Occupation</option>
              <option value="Engineer">Engineer</option>
              <option value="Designer">Designer</option>
              <option value="Student">Student</option>
              <option value="Entrepreneur">Entrepreneur</option>
              <option value="Other">Other</option>
            </select>
            <ChevronRight size={20} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
          </div>
        </div>
        
        <div className="pt-6">
          <Button fullWidth onClick={handleUpdateProfile} isLoading={isUpdating}>
            Save Changes
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderData = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Buy Data</h1>
      </div>
      <div className="space-y-6">
        <Input label="Phone Number" placeholder="08012345678" type="tel" />
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Plan</h4>
          {[
            { label: '1GB - 1 Day', price: 300 },
            { label: '2GB - 2 Days', price: 500 },
            { label: '5GB - 7 Days', price: 1500 },
            { label: '10GB - 30 Days', price: 3000 },
          ].map(plan => (
            <button key={plan.label} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-none flex justify-between items-center hover:border-primary-green transition-all">
              <span className="font-bold text-slate-700">{plan.label}</span>
              <span className="font-black text-primary-green">₦ {plan.price}</span>
            </button>
          ))}
        </div>
        <Button fullWidth onClick={() => {
          setTransactionStatus('processing');
          setTransactionMessage('Processing data purchase...');
          setTimeout(() => {
            setTransactionStatus('success');
            setTransactionMessage('Data purchase successful!');
            addNotification('Data Success', 'Your data top-up was successful.', 'success');
          }, 2000);
        }}>Proceed</Button>
      </div>
    </motion.div>
  );

  const renderElectricity = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Electricity Bill</h1>
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 uppercase text-[10px]">Select Provider</label>
          <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none font-medium">
            <option>IKEDC (Ikeja Electric)</option>
            <option>EKEDC (Eko Electric)</option>
            <option>AEDC (Abuja Electric)</option>
          </select>
        </div>
        <Input label="Meter Number" placeholder="01234567890" type="tel" />
        <Input label="Amount" placeholder="₦ 0.00" type="number" />
        <Button fullWidth onClick={() => {
          setTransactionStatus('processing');
          setTransactionMessage('Generating electricity token...');
          setTimeout(() => {
            setTransactionStatus('success');
            setTransactionMessage('Electricity token generated successfully!');
            addNotification('Power Success', 'Your electricity token has been generated.', 'success');
          }, 2000);
        }}>Proceed</Button>
      </div>
    </motion.div>
  );

  const renderTVCable = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">TV Cable</h1>
      </div>
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {['DSTV', 'GOTV', 'StarTimes'].map(tv => (
            <button key={tv} className="p-4 bg-slate-50 border-2 border-slate-100 rounded-none font-black text-slate-900 hover:border-primary-green transition-all">
              {tv}
            </button>
          ))}
        </div>
        <Input label="Smart Card Number" placeholder="1234567890" type="tel" />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-500 ml-1 uppercase text-[10px]">Select Package</label>
          <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-none px-4 py-4 outline-none font-medium">
            <option>Premium Package - ₦ 24,500</option>
            <option>Compact Plus - ₦ 16,600</option>
            <option>Compact - ₦ 10,500</option>
          </select>
        </div>
        <Button fullWidth onClick={() => {
          setTransactionStatus('processing');
          setTransactionMessage('Renewing TV subscription...');
          setTimeout(() => {
            setTransactionStatus('success');
            setTransactionMessage('TV subscription renewed successfully!');
            addNotification('TV Success', 'Your TV subscription has been renewed.', 'success');
          }, 2000);
        }}>Proceed</Button>
      </div>
    </motion.div>
  );

  const renderViewMore = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">All Services</h1>
      </div>
      <div className="p-6 grid grid-cols-4 gap-6">
        {[
          { icon: Send, label: 'Transfer', screen: 'send' },
          { icon: Smartphone, label: 'Airtime', screen: 'airtime' },
          { icon: PhoneCall, label: 'Data', screen: 'data' },
          { icon: Zap, label: 'Electricity', screen: 'electricity' },
          { icon: Tv, label: 'TV Cable', screen: 'tv' },
          { icon: ShoppingBag, label: 'Store', screen: 'store' },
          { icon: Bitcoin, label: 'Crypto', screen: 'crypto' },
          { icon: PiggyBank, label: 'Savings', screen: 'savings' },
          { icon: History, label: 'History', screen: 'transactions' },
          { icon: Bell, label: 'Alerts', screen: 'notifications' },
          { icon: Gift, label: 'Referral', screen: 'referral' },
          { icon: ShieldCheck, label: 'Security', screen: 'biometrics' },
        ].map((item, i) => (
          <button 
            key={i}
            onClick={() => setScreen(item.screen as Screen)}
            className="flex flex-col items-center gap-2"
          >
            <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center text-slate-900 shadow-sm border border-slate-100">
              <item.icon size={24} />
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );

  const renderNotifications = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>
      <div className="space-y-4">
        {[
          { title: 'Security Alert', desc: 'New login detected from iPhone 13', time: '2 mins ago' },
          { title: 'Cashback Received', desc: 'You earned ₦ 50.00 from your last airtime purchase', time: '1 hour ago' },
          { title: 'Savings Goal Met', desc: 'Congratulations! You reached your Rent goal', time: 'Yesterday' },
        ].map((n, i) => (
          <div key={i} className="p-4 bg-slate-50 rounded-none space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-900">{n.title}</h4>
              <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
            </div>
            <p className="text-xs text-slate-500">{n.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderHelp = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Help & Support</h1>
      </div>
      <div className="space-y-6">
        <Card className="p-6 flex items-center gap-4 bg-green-50 border-none">
          <div className="w-12 h-12 bg-primary-green rounded-none flex items-center justify-center text-white">
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Live Chat</h4>
            <p className="text-xs text-slate-500">Average response time: 2 mins</p>
          </div>
        </Card>
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">FAQs</h4>
          {['How to reset PIN?', 'How to upgrade tier?', 'Transaction failed?'].map(faq => (
            <button key={faq} className="w-full p-4 bg-slate-50 rounded-none flex justify-between items-center">
              <span className="font-bold text-slate-700">{faq}</span>
              <ChevronRight size={20} className="text-slate-300" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderReferral = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10"
    >
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setScreen('dashboard')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Refer & Earn</h1>
      </div>
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-32 h-32 bg-pink-50 rounded-none flex items-center justify-center text-brand-pink">
          <Gift size={64} />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Earn ₦ 500.00</h2>
          <p className="text-slate-500 text-sm">For every friend you refer to Save2Get who completes their first transaction.</p>
        </div>
        <Card className="w-full p-6 bg-slate-50 border-dashed border-2 border-slate-200 flex justify-between items-center">
          <span className="text-xl font-black tracking-widest">SAVE2GET-500</span>
          <Copy size={24} className="text-brand-pink" />
        </Card>
        <Button fullWidth>Share Referral Link</Button>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-slate-50/50 pb-24"
    >
      <div className="bg-white px-6 pt-6 pb-4 flex items-center gap-4 sticky top-0 z-40 border-b border-slate-100">
        <button onClick={() => setScreen('account')} className="p-2 -ml-2">
          <ArrowLeft size={28} />
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>
      
      <div className="p-0 space-y-8">
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6 mt-6">Notifications</h3>
          <Card className="p-0 border-x-0 bg-transparent shadow-none">
            {[
              { label: 'Push Notifications', value: true },
              { label: 'Email Alerts', value: true },
              { label: 'SMS Notifications', value: false },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-6 bg-white border-b border-slate-50 last:border-0">
                <span className="font-bold text-slate-700">{item.label}</span>
                <div className={`w-12 h-6 ${item.value ? 'bg-primary-green' : 'bg-slate-200'} rounded-none relative cursor-pointer transition-colors`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-none shadow-sm transition-all ${item.value ? 'right-1' : 'left-1'}`} />
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Security</h3>
          <Card className="p-0 border-x-0 bg-transparent shadow-none">
            {[
              { label: 'Change Transaction PIN', icon: ShieldCheck },
              { label: 'Biometric Login', icon: Fingerprint, action: () => setScreen('biometrics') },
              { label: 'Two-Factor Authentication', icon: ShieldCheck },
            ].map((item, i) => (
              <button key={i} onClick={item.action} className="w-full flex justify-between items-center p-6 bg-white border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-4">
                  <item.icon size={20} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </button>
            ))}
          </Card>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-6">Support</h3>
          <Card className="p-0 border-x-0 bg-transparent shadow-none">
            {[
              { label: 'About Save2Get', icon: HelpCircle },
              { label: 'Terms of Service', icon: FileText },
              { label: 'Privacy Policy', icon: ShieldCheck },
            ].map((item, i) => (
              <button key={i} className="w-full flex justify-between items-center p-6 bg-white border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-4">
                  <item.icon size={20} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{item.label}</span>
                </div>
                <ChevronRight size={20} className="text-slate-300" />
              </button>
            ))}
          </Card>
        </div>

        <button className="w-full p-6 bg-white text-red-500 font-black uppercase tracking-widest text-xs border-y border-slate-100">
          Sign Out
        </button>
      </div>
    </motion.div>
  );

  const renderBiometrics = () => (
    <motion.div 
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-white px-6 pt-6 pb-10 flex flex-col items-center justify-center text-center space-y-8"
    >
      <div className="w-24 h-24 bg-green-50 rounded-none flex items-center justify-center text-primary-green">
        <Fingerprint size={64} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black">Biometric Security</h2>
        <p className="text-slate-500 text-sm max-w-xs">Use your fingerprint or face ID to secure your transactions and login.</p>
      </div>
      <div className="w-full max-w-xs space-y-4">
        <div className="flex justify-between items-center p-4 bg-slate-50 rounded-none">
          <span className="font-bold text-slate-700">Enable Biometrics</span>
          <div className="w-12 h-6 bg-primary-green rounded-none relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-none shadow-sm" />
          </div>
        </div>
        <Button fullWidth onClick={() => setScreen('dashboard')}>Done</Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-0 md:p-8 lg:p-12">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[850px] md:h-[850px] shadow-2xl relative overflow-hidden md:rounded-none border-[8px] border-slate-900/5">
        <AnimatePresence mode="wait">
        {screen === 'onboarding' && renderOnboarding()}
        {screen === 'login' && renderLogin()}
        {screen === 'register' && renderRegister()}
        {screen === 'dashboard' && renderDashboard()}
        {screen === 'savings' && renderSavings()}
        {screen === 'account' && renderAccount()}
        {screen === 'send' && renderSendMoney()}
        {screen === 'data' && renderSendMoney()} {/* Reusing for demo */}
        {screen === 'electricity' && renderSendMoney()} {/* Reusing for demo */}
        {screen === 'edit_profile' && renderEditProfile()}
        {screen === 'create_savings' && renderCreateSavings()}
        {screen === 'crypto' && renderCrypto()}
        {screen === 'store' && renderStore()}
        {screen === 'airtime' && renderAirtime()}
        {screen === 'tv' && renderTVCable()}
        {screen === 'transactions' && renderTransactions()}
        {screen === 'notifications' && renderNotifications()}
        {screen === 'help' && renderHelp()}
        {screen === 'referral' && renderReferral()}
        {screen === 'settings' && renderSettings()}
        {screen === 'view_more' && renderViewMore()}
        {screen === 'biometrics' && renderBiometrics()}
        {screen === 'data' && renderData()}
        {screen === 'electricity' && renderElectricity()}
      </AnimatePresence>

      {/* Push Notifications Overlay */}
      <div className="fixed top-0 left-0 right-0 z-[200] p-6 pointer-events-none flex flex-col gap-4 items-center">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              key={n.id}
              initial={{ y: -100, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm bg-white/90 backdrop-blur-xl border border-slate-100 p-4 rounded-none shadow-2xl pointer-events-auto flex items-center gap-4"
            >
              <div className={`w-10 h-10 rounded-none flex items-center justify-center ${
                n.type === 'success' ? 'bg-green-50 text-primary-green' : 
                n.type === 'alert' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
              }`}>
                {n.type === 'success' ? <CheckCircle2 size={20} /> : n.type === 'alert' ? <AlertCircle size={20} /> : <Bell size={20} />}
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{n.title}</p>
                <p className="text-[10px] font-bold text-slate-500">{n.message}</p>
              </div>
              <button onClick={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} className="text-slate-300 hover:text-slate-900 transition-colors">
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Transaction Feedback Modal */}
      <AnimatePresence>
        {transactionStatus !== 'idle' && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-none p-10 flex flex-col items-center text-center space-y-8 shadow-3xl"
            >
              {transactionStatus === 'processing' && (
                <div className="w-24 h-24 border-4 border-slate-100 border-t-brand-pink rounded-none animate-spin" />
              )}
              {transactionStatus === 'success' && (
                <div className="w-24 h-24 bg-green-50 text-primary-green rounded-none flex items-center justify-center">
                  <CheckCircle2 size={64} strokeWidth={1.5} />
                </div>
              )}
              {transactionStatus === 'error' && (
                <div className="w-24 h-24 bg-red-50 text-red-500 rounded-none flex items-center justify-center">
                  <XCircle size={64} strokeWidth={1.5} />
                </div>
              )}
              
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {transactionStatus === 'processing' ? 'Processing...' : 
                   transactionStatus === 'success' ? 'Success!' : 'Transaction Failed'}
                </h3>
                <p className="text-slate-500 font-bold text-sm leading-relaxed">
                  {transactionMessage}
                </p>
              </div>

              {transactionStatus !== 'processing' && (
                <Button fullWidth onClick={() => {
                  setTransactionStatus('idle');
                  if (transactionStatus === 'success') setScreen('dashboard');
                }}>
                  {transactionStatus === 'success' ? 'Great, Thanks!' : 'Try Again'}
                </Button>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  </div>
);
}
