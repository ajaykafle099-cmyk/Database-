import React, { useState, useEffect } from 'react';
import { account, handleAppwriteError, ID } from './services/appwrite';
import { ViewState, UserProfile } from './types';
import { Sidebar } from './components/Sidebar';
import { Notes } from './components/Notes';
import { Accounts } from './components/Accounts';
import { StorageManager } from './components/Storage';
import { Lock, Mail, Loader2, ArrowRight, AlertTriangle, WifiOff, Globe } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LOADING);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [hostname, setHostname] = useState('');

  // Check Session
  useEffect(() => {
    setHostname(window.location.hostname);
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser({
        $id: session.$id,
        name: session.name,
        email: session.email
      });
      setView(ViewState.DASHBOARD);
    } catch (e: any) {
      // If network error (failed to fetch), likely CORS or wrong endpoint
      if (e.message === 'Failed to fetch') {
        const currentHost = window.location.hostname;
        setAuthError(`Connection Failed. Please add "${currentHost}" to your Appwrite Console > Overview > Platforms.`);
      }
      setView(ViewState.LOGIN);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegister) {
        // Create Account
        await account.create(ID.unique(), email, password, email.split('@')[0]);
        // Then Login
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.createEmailPasswordSession(email, password);
      }
      checkSession();
    } catch (e: any) {
      console.error(e);
      if (e.message === 'Failed to fetch') {
        const currentHost = window.location.hostname;
        setAuthError(`Connection Failed. Please add "${currentHost}" to your Appwrite Console > Overview > Platforms.`);
      } else {
        setAuthError(e.message || "Authentication failed. Please check credentials.");
      }
    }
  };

  const handleDemoLogin = () => {
    setUser({
      $id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com'
    });
    setView(ViewState.DASHBOARD);
    setAuthError('');
  };

  const handleLogout = async () => {
    try {
      if (user?.$id !== 'demo-user') {
        await account.deleteSession('current');
      }
      setUser(null);
      setView(ViewState.LOGIN);
    } catch (e) {
      handleAppwriteError(e);
      setUser(null);
      setView(ViewState.LOGIN);
    }
  };

  // Login View
  if (view === ViewState.LOGIN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 z-10">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Lock className="text-white" size={24} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-white mb-2">CloudVault</h2>
          <p className="text-center text-slate-400 mb-8">{isRegister ? 'Create your secure space' : 'Welcome back'}</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            {authError && (
              <div className="space-y-3">
                <div className="text-red-400 text-sm bg-red-950/20 p-3 rounded-lg border border-red-900/50 flex items-start">
                  <AlertTriangle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <span className="break-all">{authError}</span>
                </div>
                
                {/* Demo Mode Button for when connection fails */}
                <button 
                  type="button" 
                  onClick={handleDemoLogin}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm flex items-center justify-center transition-colors border border-slate-700"
                >
                  <WifiOff size={16} className="mr-2" />
                  Continue in Offline Demo Mode
                </button>
              </div>
            )}

            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex justify-center items-center group">
              {isRegister ? 'Create Account' : 'Sign In'}
              <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegister(!isRegister); setAuthError(''); }} 
              className="text-sm text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Register"}
            </button>
          </div>
        </div>

        {/* Debug Hostname Display */}
        <div className="absolute bottom-4 left-0 right-0 text-center opacity-50 hover:opacity-100 transition-opacity">
            <p className="text-xs text-slate-600 font-mono flex items-center justify-center gap-2">
                <Globe size={12} />
                Current Host: <span className="text-slate-400 select-all">{hostname}</span>
            </p>
        </div>
      </div>
    );
  }

  // Loading View
  if (view === ViewState.LOADING) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={48} />
        <p className="text-slate-400 text-sm tracking-wider">INITIALIZING SECURE VAULT...</p>
      </div>
    );
  }

  // Dashboard / App View
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        onLogout={handleLogout} 
        userName={user?.name || 'User'} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-950">
        {view === ViewState.DASHBOARD && (
          <div className="p-8 md:p-12 flex-1 overflow-y-auto">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Hello, {user?.name}</h1>
              <p className="text-slate-400">Here is what's happening in your vault.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div onClick={() => setView(ViewState.NOTES)} className="bg-gradient-to-br from-indigo-900/50 to-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-indigo-500/50 cursor-pointer transition-all group">
                <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Notes</h3>
                <p className="text-sm text-slate-400">Capture your ideas instantly with rich text support.</p>
              </div>
              
              <div onClick={() => setView(ViewState.ACCOUNTS)} className="bg-gradient-to-br from-emerald-900/50 to-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-emerald-500/50 cursor-pointer transition-all group">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Passwords</h3>
                <p className="text-sm text-slate-400">Securely manage credentials for all your accounts.</p>
              </div>
              
              <div onClick={() => setView(ViewState.STORAGE)} className="bg-gradient-to-br from-blue-900/50 to-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-blue-500/50 cursor-pointer transition-all group">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Storage</h3>
                <p className="text-sm text-slate-400">Organize photos and files in secure categories.</p>
              </div>
            </div>
          </div>
        )}
        
        {view === ViewState.NOTES && <Notes />}
        {view === ViewState.ACCOUNTS && <Accounts />}
        {view === ViewState.STORAGE && <StorageManager />}
      </main>
    </div>
  );
};

export default App;