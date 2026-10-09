import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Coins,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Bike,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function WalletModal({ isOpen, onClose }) {
  const { user, token, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toppingUp, setToppingUp] = useState(false);
  const [topupAmount, setTopupAmount] = useState('50');
  const [message, setMessage] = useState('');

  const fetchTransactions = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/wallet/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTransactions();
      setMessage('');
    }
  }, [isOpen]);

  const handleTopup = async (amount) => {
    setToppingUp(true);
    setMessage('');
    try {
      const res = await fetch('/api/wallet/topup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`+${amount} Campus Coins credited to your wallet.`);
        refreshUser();
        fetchTransactions();
      } else {
        setMessage(data.message || 'Top-up failed.');
      }
    } catch (err) {
      setMessage('Network error processing top-up.');
    } finally {
      setToppingUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Campus Coins Wallet
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Digital campus currency for cafeteria orders & peer courier earnings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Available Balance
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {user?.coin_balance ?? 0}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Campus Coins
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                1 Coin = ₹1 canteen meal credit
              </p>
            </div>

            {/* Quick Top-up Button for Demo */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => handleTopup(50)}
                disabled={toppingUp}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+50 Demo</span>
              </button>
              <button
                onClick={() => handleTopup(100)}
                disabled={toppingUp}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:border-amber-500 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center gap-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+100 Demo</span>
              </button>
            </div>
          </div>

          {message && (
            <div className="mt-3 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {message}
            </div>
          )}
        </div>

        {/* Courier Incentive Explainer */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <Bike className="w-3.5 h-3.5 text-amber-500" />
              How Couriers Earn Coins
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Deliver classroom orders. You earn the base delivery fee (₹10) + surge fee + rain fee on every verified OTP.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              How to Spend Coins
            </span>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              Use coins at checkout to pay for food delivery, or redeem them directly for free cafeteria meals and beverages.
            </p>
          </div>
        </div>

        {/* Transactions Ledger */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <div className="flex items-center justify-between pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Transactions
            </h3>
            <button
              onClick={fetchTransactions}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No transactions recorded yet. Complete a delivery run or top up to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCredit
                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {tx.description}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {new Date(tx.created_at).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`text-xs font-mono font-bold ${
                        isCredit
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {isCredit ? `+${tx.amount}` : tx.amount} Coins
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
