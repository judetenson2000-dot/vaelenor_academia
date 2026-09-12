import React, { useState, useEffect } from 'react';
import { useFirebase } from '../lib/FirebaseContext';
import { PaperData } from '../types';
import {
  Cloud,
  Save,
  FolderOpen,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  User as UserIcon,
  LogOut,
  Sparkles,
  FileText
} from 'lucide-react';

interface CloudPaperItem {
  id: string;
  title: string;
  author: string;
  date: string;
  updatedAt: string;
  data: PaperData;
}

interface CloudPapersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaper: PaperData;
  onLoadPaper: (paper: PaperData) => void;
}

export const CloudPapersModal: React.FC<CloudPapersModalProps> = ({
  isOpen,
  onClose,
  currentPaper,
  onLoadPaper,
}) => {
  const { user, signIn, signInWithEmail, signOut, saveCurrentPaperToCloud, loadUserPapers, deleteCloudPaper, isFirebaseConnected } = useFirebase();

  const [papers, setPapers] = useState<CloudPaperItem[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Fetch list whenever modal opens and user is logged in
  useEffect(() => {
    if (isOpen && user) {
      fetchPapers();
    }
  }, [isOpen, user]);

  const fetchPapers = async () => {
    setIsLoadingList(true);
    try {
      const items = await loadUserPapers();
      setPapers(items);
    } catch (err: unknown) {
      console.warn('Failed to load cloud papers:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleSaveCurrent = async () => {
    if (!user) return;
    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await saveCurrentPaperToCloud(currentPaper);
      if (res.success) {
        setStatusMessage({ type: 'success', text: `Saved "${currentPaper.title || 'Untitled Draft'}" to your Firebase Vault!` });
        await fetchPapers();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to save paper.' });
      }
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error saving to Firestore' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoad = (paper: CloudPaperItem) => {
    onLoadPaper(paper.data);
    setStatusMessage({ type: 'success', text: `Loaded "${paper.title}" into active workspace!` });
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleDelete = async (paperId: string) => {
    try {
      await deleteCloudPaper(paperId);
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
      setStatusMessage({ type: 'success', text: 'Paper draft removed from cloud.' });
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: 'Failed to delete paper draft.' });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      await signIn();
    } catch (err: unknown) {
      setStatusMessage({
        type: 'error',
        text: 'Sign-in popup was closed or blocked. You can also sign in below using your Student Email.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !passwordInput.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter both email and password.' });
      return;
    }
    setIsSigningIn(true);
    setStatusMessage(null);
    try {
      await signInWithEmail(emailInput.trim(), passwordInput.trim());
      setStatusMessage({ type: 'success', text: 'Signed in successfully! Vault is ready.' });
    } catch (err: unknown) {
      const fbErr = err as { message?: string };
      setStatusMessage({
        type: 'error',
        text: fbErr?.message || 'Authentication failed. Please verify credentials or use Google sign-in.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-900">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Cloud Paper Vault</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 border border-amber-200">
                  vaelenor-5f619
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sync, store, and access your IEEE research drafts across devices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* User Auth Section */}
          {!user ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Sign in to sync your research</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Connect your Google account to back up your LaTeX formulas, citations, and draft chapters to Google Cloud Firestore.
                </p>
              </div>
              <button
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition flex items-center justify-center gap-2 mx-auto shadow-md disabled:opacity-50"
              >
                {isSigningIn && !showEmailAuth ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailAuth(!showEmailAuth)}
                  className="text-xs text-amber-800 hover:text-amber-900 underline font-medium"
                >
                  {showEmailAuth ? 'Hide Email Sign-In' : 'Or Sign in with Student Email'}
                </button>
              </div>

              {showEmailAuth && (
                <form onSubmit={handleEmailSignIn} className="max-w-xs mx-auto space-y-2.5 pt-2 text-left">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Student Email
                    </label>
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="scholar@university.edu"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSigningIn}
                    className="w-full py-2 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSigningIn ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Sign In to Vault</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{user.displayName || 'Google Scholar'}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 hover:text-slate-900 text-xs font-medium transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}

          {/* Save Current Workspace to Cloud */}
          {user && (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  Active Document
                </span>
                <h5 className="text-xs font-bold text-slate-900 mt-0.5">
                  {currentPaper.title || 'Untitled Thesis Draft'}
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Author: {currentPaper.author || 'Anonymous'} • {currentPaper.boundResearch?.length || 0} citations • {currentPaper.equations?.length || 0} equations
                </p>
              </div>
              <button
                onClick={handleSaveCurrent}
                disabled={isSaving}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save to Firebase Vault</span>
              </button>
            </div>
          )}

          {/* User's Stored Papers in Firestore */}
          {user && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Your Cloud Documents ({papers.length})
                </h4>
                <button
                  onClick={fetchPapers}
                  className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline transition"
                >
                  Refresh
                </button>
              </div>

              {isLoadingList ? (
                <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                  <span>Loading cloud repository from Firestore...</span>
                </div>
              ) : papers.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-1">
                  <FileText className="w-6 h-6 mx-auto text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">No saved papers in your vault yet</p>
                  <p className="text-[11px] text-slate-500">
                    Click "Save to Firebase Vault" above to back up your current work.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {papers.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 bg-white transition space-y-2 shadow-2xs group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition">
                            {p.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span>{p.author}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(p.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Delete from cloud"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2">
                        {p.data.abstract || 'No abstract provided'}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleLoad(p)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-amber-600 hover:text-white text-slate-800 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Load into Workspace</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>Firestore: <strong>{isFirebaseConnected ? 'Connected' : 'Offline'}</strong></span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
