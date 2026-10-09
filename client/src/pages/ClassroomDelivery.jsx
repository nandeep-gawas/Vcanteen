import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bike,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Clock,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  UserCheck,
  Check,
  Edit2,
  UtensilsCrossed,
  X,
  CloudRain,
  Zap,
  Coins,
  Wallet
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function ClassroomDelivery() {
  const { user, token, refreshUser } = useAuth();
  const { addToast } = useToast();
  const isVolunteerOrStaff = ['volunteer', 'staff', 'admin'].includes(user?.role);
  const isAdminOrStaff = ['staff', 'admin'].includes(user?.role);

  // Active Tab: 'menu' | 'my-orders' | 'pool' | 'manage-menu'
  const [activeTab, setActiveTab] = useState(isVolunteerOrStaff ? 'pool' : 'menu');

  // ==========================================
  // 1. MENU, PRICING & CART STATE
  // ==========================================
  const [menu, setMenu] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState({}); // { [itemId]: { ...item, quantity: 1 } }
  const [cartOpen, setCartOpen] = useState(false);

  // Delivery Pricing, Surge & Rain state
  const [pricing, setPricing] = useState({
    baseDeliveryFee: 10,
    surgeFee: 15,
    isSurgeActive: false,
    rainFee: 15,
    isRainActive: false,
    courierBonusCoins: 5,
    totalCourierReward: 15
  });
  const [togglingPricing, setTogglingPricing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' | 'coins'

  // Checkout inputs
  const [classroomLocation, setClassroomLocation] = useState('');
  const [studentYear, setStudentYear] = useState(user?.year ? user.year.toString() : '3');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState(null);

  // ==========================================
  // 2. MY ORDERS STATE (Student)
  // ==========================================
  const [myOrders, setMyOrders] = useState([]);
  const [loadingMyOrders, setLoadingMyOrders] = useState(false);

  // ==========================================
  // 3. DELIVERY POOL STATE (Volunteer/Staff)
  // ==========================================
  const [poolOrders, setPoolOrders] = useState([]);
  const [loadingPool, setLoadingPool] = useState(false);

  // OTP Verification Modal state
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // ==========================================
  // 4. MENU MANAGEMENT STATE (Admin/Staff)
  // ==========================================
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    category: 'Rolls & Wraps',
    price: '',
    image_url: '',
    description: '',
    preparation_time: '15'
  });

  const categories = ['All', 'Rolls & Wraps', 'South Indian', 'Snacks', 'Meals', 'Beverages', 'Rice Bowls'];

  // Fetch Menu Items
  const fetchMenu = async () => {
    setLoadingMenu(true);
    try {
      const res = await fetch('/api/delivery/menu');
      if (res.ok) {
        const json = await res.json();
        setMenu(json.menu || []);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setLoadingMenu(false);
    }
  };

  // Fetch Student's Orders
  const fetchMyOrders = async () => {
    setLoadingMyOrders(true);
    try {
      const res = await fetch('/api/delivery/orders/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setMyOrders(json.orders || []);
      }
    } catch (err) {
      console.error('Failed to load my orders:', err);
    } finally {
      setLoadingMyOrders(false);
    }
  };

  // Fetch Delivery Pool (Volunteer/Staff)
  const fetchPool = async () => {
    setLoadingPool(true);
    try {
      const res = await fetch('/api/delivery/orders/pool', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setPoolOrders(json.orders || []);
      }
    } catch (err) {
      console.error('Failed to load delivery pool:', err);
    } finally {
      setLoadingPool(false);
    }
  };

  // Fetch Pricing & Active Conditions
  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/delivery/pricing');
      if (res.ok) {
        const json = await res.json();
        setPricing(json);
      }
    } catch (err) {
      console.error('Failed to load delivery pricing:', err);
    }
  };

  // Staff / Admin toggle surge or rain conditions
  const handleTogglePricingCondition = async (conditionKey, currentValue) => {
    setTogglingPricing(true);
    try {
      const res = await fetch('/api/delivery/pricing/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [conditionKey]: !currentValue })
      });
      if (res.ok) {
        const json = await res.json();
        setPricing(json.pricing);
        addToast(json.message, 'success');
      } else {
        const err = await res.json();
        addToast(err.message || 'Failed to update condition.', 'error');
      }
    } catch (err) {
      addToast('Error communicating with pricing service.', 'error');
    } finally {
      setTogglingPricing(false);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchPricing();
    if (token) {
      if (activeTab === 'my-orders') fetchMyOrders();
      if (activeTab === 'pool') fetchPool();
    }
  }, [activeTab, token]);

  // Cart Operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.id];
      if (existing) {
        return { ...prev, [item.id]: { ...existing, quantity: existing.quantity + 1 } };
      }
      return { ...prev, [item.id]: { ...item, quantity: 1 } };
    });
    setCartOpen(true);
    addToast(`${item.name} added to cart!`, 'info', 2000);
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const newQty = existing.quantity + delta;
      if (newQty <= 0) {
        const clone = { ...prev };
        delete clone[itemId];
        return clone;
      }
      return { ...prev, [itemId]: { ...existing, quantity: newQty } };
    });
  };

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

  // Dynamic fee calculation
  const deliveryFee = pricing.baseDeliveryFee || 10;
  const surgeFee = pricing.isSurgeActive ? (pricing.surgeFee || 15) : 0;
  const rainFee = pricing.isRainActive ? (pricing.rainFee || 15) : 0;
  const totalOrderAmount = cartTotal > 0 ? (cartTotal + deliveryFee + surgeFee + rainFee) : 0;

  // Place Order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!classroomLocation.trim()) {
      alert('Please specify your classroom or lab location.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    if (paymentMethod === 'coins' && (user?.coin_balance || 0) < totalOrderAmount) {
      alert(`Insufficient Campus Coins! This order requires ${totalOrderAmount} coins, but your balance is ${user?.coin_balance || 0} coins.`);
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await fetch('/api/delivery/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          classroom_location: classroomLocation.trim(),
          student_year: studentYear,
          pay_with_coins: paymentMethod === 'coins',
          items: cartItems.map((it) => ({
            id: it.id,
            name: it.name,
            price: it.price,
            quantity: it.quantity
          }))
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Order failed.');

      setPlacedOrderInfo(json);
      setCart({});
      setCartOpen(false);
      addToast(`Order placed! Your 4-digit OTP is ${json.deliveryOtp}`, 'success', 6000);
      if (refreshUser) refreshUser();
      fetchMyOrders();
      setActiveTab('my-orders');
    } catch (err) {
      addToast(err.message || 'Order failed.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Volunteer Accepts Order
  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        addToast('Order accepted! Student notified.', 'success');
        fetchPool();
      } else {
        const err = await res.json();
        addToast(err.message || 'Could not accept order.', 'error');
      }
    } catch (err) {
      addToast('Network error accepting delivery order.', 'error');
    }
  };

  // Volunteer Marks Out for Delivery
  const handleOutForDelivery = async (orderId) => {
    try {
      const res = await fetch(`/api/delivery/orders/${orderId}/out-for-delivery`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchPool();
      } else {
        const err = await res.json();
        alert(err.message || 'Could not update status.');
      }
    } catch (err) {
      alert('Network error updating status.');
    }
  };

  // Volunteer Submits Student OTP to Complete Delivery
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!inputOtp.trim()) return;

    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');

    try {
      const res = await fetch(`/api/delivery/orders/${otpModalOrder.id}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ otp: inputOtp.trim() })
      });

      const json = await res.json();
      if (!res.ok) {
        setOtpError(json.message || 'Invalid OTP code.');
      } else {
        setOtpSuccess(json.message);
        if (refreshUser) refreshUser();
        setTimeout(() => {
          setOtpModalOrder(null);
          setInputOtp('');
          setOtpSuccess('');
          fetchPool();
        }, 1800);
      }
    } catch (err) {
      setOtpError('Network error verifying OTP.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Admin/Staff Menu Item Form Submit
  const handleSaveMenuItem = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem ? `/api/delivery/menu/${editingItem.id}` : '/api/delivery/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(menuFormData)
      });

      if (res.ok) {
        setMenuModalOpen(false);
        fetchMenu();
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to save menu item.');
      }
    } catch (err) {
      alert('Network error saving menu item.');
    }
  };

  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Out for delivery':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Placed':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const filteredMenu = selectedCategory === 'All'
    ? menu
    : menu.filter((it) => it.category === selectedCategory);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Classroom Food Delivery
            </h1>
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
              Peer Courier
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Student volunteers deliver fresh hot meals directly to your lecture hall or lab. Does not count toward canteen occupancy!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/60 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'menu'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Order Menu
          </button>

          <button
            onClick={() => setActiveTab('my-orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'my-orders'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>My Active Orders & OTP</span>
          </button>

          {isVolunteerOrStaff && (
            <button
              onClick={() => setActiveTab('pool')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'pool'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Courier Pool ({poolOrders.filter(o => o.status === 'Placed').length})</span>
            </button>
          )}

          {isAdminOrStaff && (
            <button
              onClick={() => setActiveTab('manage-menu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'manage-menu'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Manage Menu
            </button>
          )}
        </div>
      </div>

      {/* Notice about Canteen Occupancy */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          💡 <strong>Zero Canteen Wait:</strong> Classroom delivery orders bypass turnstiles entirely and do not count toward dining hall occupancy limits.
        </span>
      </div>

      {/* Dynamic Delivery Rates, Rain Mode & Surge Incentive Panel */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-orange-500" />
              Delivery Rates:
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
              Base Fee: ₹{pricing.baseDeliveryFee}
            </span>

            {/* Surge Status Badge */}
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                pricing.isSurgeActive
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>{pricing.isSurgeActive ? `Surge Active (+₹${pricing.surgeFee})` : 'Normal Demand'}</span>
            </span>

            {/* Rain Status Badge */}
            <span
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                pricing.isRainActive
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              <span>{pricing.isRainActive ? `Rain Mode Active (+₹${pricing.rainFee})` : 'Clear Weather'}</span>
            </span>
          </div>

          {/* Admin / Staff Dynamic Toggles */}
          {isAdminOrStaff && (
            <div className="flex items-center gap-2 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Staff Controls:
              </span>
              <button
                type="button"
                disabled={togglingPricing}
                onClick={() => handleTogglePricingCondition('surge_active', pricing.isSurgeActive)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  pricing.isSurgeActive
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Rush Surge (+₹15)"
              >
                <Zap className="w-3 h-3" />
                <span>{pricing.isSurgeActive ? 'Surge ON' : 'Toggle Surge'}</span>
              </button>
              <button
                type="button"
                disabled={togglingPricing}
                onClick={() => handleTogglePricingCondition('rain_active', pricing.isRainActive)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                  pricing.isRainActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
                title="Toggle Rain Mode (+₹15)"
              >
                <CloudRain className="w-3 h-3" />
                <span>{pricing.isRainActive ? 'Rain ON' : 'Toggle Rain'}</span>
              </button>
            </div>
          )}
        </div>

        {(pricing.isSurgeActive || pricing.isRainActive) && (
          <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <Coins className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Peer Courier Mobilization:</strong> Couriers currently earn{' '}
              <strong className="text-amber-600 dark:text-amber-400">
                +{pricing.totalCourierReward} Campus Coins
              </strong>{' '}
              per delivered meal to ensure fast deliveries during peak rush and bad weather.
            </span>
          </div>
        )}
      </div>

      {/* ========================================== */}
      {/* TAB 1: CAMPUS MENU & CART (Student)        */}
      {/* ========================================== */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          {loadingMenu ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredMenu.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg hover:border-orange-300 transition-all flex flex-col justify-between group"
                >
                  <div className="relative">
                    <img
                      src={item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>{item.preparation_time || 15}m prep</span>
                    </div>

                    {!item.is_available && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center text-white font-black text-xs uppercase tracking-wider">
                        Sold Out Today
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-0.5 leading-snug">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-black text-slate-900 font-mono">
                        ₹{item.price}
                      </span>

                      {cart[item.id] ? (
                        <div className="flex items-center gap-2 bg-orange-50 px-2 py-1 rounded-xl border border-orange-200">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-orange-600 font-bold flex items-center justify-center shadow-xs hover:bg-orange-600 hover:text-white transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-black text-orange-700 w-4 text-center">
                            {cart[item.id].quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white text-orange-600 font-bold flex items-center justify-center shadow-xs hover:bg-orange-600 hover:text-white transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          disabled={!item.is_available}
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Floating Cart Pill (when items in cart) */}
          {cartItems.length > 0 && !cartOpen && (
            <div className="fixed bottom-6 right-6 z-30">
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-900/40 hover:bg-orange-600 transition transform hover:scale-105"
              >
                <div className="w-6 h-6 rounded-lg bg-orange-500 text-white text-xs font-black flex items-center justify-center">
                  {cartItems.reduce((a, b) => a + b.quantity, 0)}
                </div>
                <span className="text-xs font-bold">View Cart (₹{cartTotal})</span>
                <ChevronRight className="w-4 h-4 text-orange-400" />
              </button>
            </div>
          )}

          {/* Slide-over Cart Drawer */}
          {cartOpen && (
            <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs">
              <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-black text-slate-900">Your Classroom Order</h2>
                      </div>
                      <button
                        onClick={() => setCartOpen(false)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto my-4 pr-1">
                      {cartItems.map((item) => (
                        <div key={item.id} className="py-3 flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                            <p className="text-[11px] text-slate-400 font-mono">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="font-mono text-xs font-bold w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold flex items-center justify-center hover:bg-slate-200"
                            >
                              +
                            </button>
                            <span className="text-xs font-bold font-mono text-slate-900 w-12 text-right">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery Destination Form */}
                    <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-3 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-500" />
                          Delivery Classroom / Lab Location
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lab 304, IT Block, 3rd Floor"
                          value={classroomLocation}
                          onChange={(e) => setClassroomLocation(e.target.value)}
                          className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Your Academic Year
                          </label>
                          <select
                            value={studentYear}
                            onChange={(e) => setStudentYear(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="1">1st Year</option>
                            <option value="2">2nd Year</option>
                            <option value="3">3rd Year</option>
                            <option value="4">4th Year</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                            Payment Mode
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('cash')}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left flex items-center gap-1.5 ${
                                paymentMethod === 'cash'
                                  ? 'border-orange-500 bg-orange-50 text-orange-800'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <span className="w-2 h-2 rounded-full bg-orange-500" />
                              <span>Cash / UPI</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('coins')}
                              disabled={(user?.coin_balance || 0) < totalOrderAmount}
                              className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-left flex items-center gap-1.5 ${
                                paymentMethod === 'coins'
                                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                              title={`Available: ${user?.coin_balance || 0} Coins`}
                            >
                              <Coins className="w-3.5 h-3.5 text-amber-500" />
                              <span>Coins ({user?.coin_balance || 0})</span>
                            </button>
                          </div>
                          {paymentMethod === 'coins' && (user?.coin_balance || 0) < totalOrderAmount && (
                            <p className="text-[10px] text-red-600 mt-1">
                              Insufficient coins (Need {totalOrderAmount}, have {user?.coin_balance || 0}).
                            </p>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>

                  {/* Checkout Footer & Detailed Fee Breakdown */}
                  <div className="pt-4 border-t border-slate-100 space-y-2.5">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-medium">₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Courier Delivery Charge:</span>
                        <span className="font-mono font-medium">₹{deliveryFee}</span>
                      </div>
                      {surgeFee > 0 && (
                        <div className="flex justify-between text-amber-800">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Rush Surge Charge:</span>
                          </span>
                          <span className="font-mono font-bold">+₹{surgeFee}</span>
                        </div>
                      )}
                      {rainFee > 0 && (
                        <div className="flex justify-between text-blue-800">
                          <span className="flex items-center gap-1">
                            <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                            <span>Monsoon Rain Allowance:</span>
                          </span>
                          <span className="font-mono font-bold">+₹{rainFee}</span>
                        </div>
                      )}
                      <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 leading-snug">
                        💡 <strong>100% Peer Reward:</strong> All ₹{deliveryFee + surgeFee + rainFee} delivery charges are directly converted into Campus Coins for your student courier upon arrival.
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold text-slate-900 pt-1 border-t border-slate-100">
                      <span>Total Payable:</span>
                      <div className="text-right">
                        <span className="text-xl font-mono font-black text-orange-600">
                          {paymentMethod === 'coins' ? `🪙 ${totalOrderAmount} Coins` : `₹${totalOrderAmount}`}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      form="checkout-form"
                      disabled={placingOrder || (paymentMethod === 'coins' && (user?.coin_balance || 0) < totalOrderAmount)}
                      className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-orange-500/25 flex items-center justify-center gap-2"
                    >
                      {placingOrder
                        ? 'Confirming Order...'
                        : paymentMethod === 'coins'
                        ? 'Pay with Coins & Place Order'
                        : 'Place Classroom Order (Get OTP)'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: MY ACTIVE ORDERS & OTP (Student)    */}
      {/* ========================================== */}
      {activeTab === 'my-orders' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              My Classroom Orders & Delivery OTP
            </h2>
            <button
              onClick={fetchMyOrders}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Refresh Status
            </button>
          </div>

          {loadingMyOrders ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              <Bike className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">No classroom orders yet</p>
              <button
                onClick={() => setActiveTab('menu')}
                className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
              >
                Browse Menu & Order
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myOrders.map((order) => {
                const isDelivered = order.status === 'Delivered';

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                          {order.order_number}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getOrderStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Middle: Items & Destination */}
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900 mb-1">
                          {order.items_summary}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          <span>Delivering to: <strong className="text-slate-800">{order.classroom_location}</strong></span>
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span>
                            Total: <strong className="font-mono text-slate-900 font-bold">₹{order.total_amount}</strong>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            (Food ₹{order.subtotal || order.total_amount} + Delivery ₹{order.delivery_fee || 10}{order.surge_fee > 0 ? ` + Surge ₹${order.surge_fee}` : ''}{order.rain_fee > 0 ? ` + Rain ₹${order.rain_fee}` : ''})
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            order.paid_with_coins
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}>
                            {order.paid_with_coins ? '🪙 Paid with Coins' : 'Cash / UPI on Delivery'}
                          </span>
                        </div>
                      </div>

                      {/* 4-DIGIT DELIVERY OTP BOX (Shown ONLY to Student!) */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <KeyRound className="w-3 h-3 text-orange-600" />
                          Delivery Verification OTP
                        </span>

                        {isDelivered ? (
                          <div className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Verified & Completed</span>
                          </div>
                        ) : (
                          <>
                            <div className="font-mono text-3xl font-black tracking-widest text-slate-900 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-inner">
                              {order.delivery_otp}
                            </div>
                            <span className="text-[10px] text-slate-500 mt-1.5 leading-snug">
                              Share this 4-digit code with the courier at your classroom door to receive your meal.
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer: Courier attribution */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      {order.volunteer_name ? (
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Delivered by: {order.volunteer_name} ({order.volunteer_role === 'volunteer' ? 'Student Volunteer' : 'Staff'})</span>
                        </div>
                      ) : (
                        <span className="text-amber-700 font-medium">
                          ⏳ Waiting for an available student volunteer to accept your run...
                        </span>
                      )}

                      <span className="font-bold text-slate-700">Year {order.student_year}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 3: COURIER DELIVERY POOL (Volunteers)  */}
      {/* ========================================== */}
      {activeTab === 'pool' && isVolunteerOrStaff && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bike className="w-4 h-4 text-orange-500" />
                Active Campus Delivery Pool
              </h2>
              <p className="text-xs text-slate-500">Accept classroom orders, deliver to lecture rooms, and enter student OTP.</p>
            </div>
            <button
              onClick={fetchPool}
              className="text-xs text-orange-600 font-bold hover:underline"
            >
              Refresh Orders
            </button>
          </div>

          {/* Peer Courier Earnings & Incentives Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                My Courier Wallet
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
                  {user?.coin_balance ?? 0}
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Coins</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Earn Per Run Right Now
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  +{pricing.totalCourierReward}
                </span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Coins / Delivery</span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Courier Earnings Rate
              </span>
              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 font-mono leading-tight">
                Base ₹{pricing.baseDeliveryFee} {pricing.isRainActive ? `+ Rain ₹${pricing.rainFee}` : ''} {pricing.isSurgeActive ? `+ Surge ₹${pricing.surgeFee}` : ''} + 5 Bonus Coins
              </div>
            </div>
          </div>

          {loadingPool ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-slate-200 rounded-3xl"></div>
              ))}
            </div>
          ) : poolOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-500">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm text-slate-700">All delivery runs complete!</p>
              <p className="text-xs text-slate-400 mt-1">New student classroom requests will appear here in real-time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {poolOrders.map((order) => {
                const isMyRun = order.volunteer_id === user.id;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800">
                          {order.order_number}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{order.student_name}</span>
                        <span className="text-[11px] text-slate-400">({order.student_roll.toUpperCase()} • Yr {order.student_year})</span>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getOrderStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-orange-600 font-bold mb-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span>Destination: {order.classroom_location}</span>
                        </div>
                        <p className="text-sm font-black text-slate-800">{order.items_summary}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 text-xs font-bold font-mono flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>Earn +{order.courier_reward_coins || pricing.totalCourierReward} Coins</span>
                          </span>
                          {order.paid_with_coins === 1 ? (
                            <span className="text-[11px] text-slate-500 font-medium">Prepaid with Coins</span>
                          ) : (
                            <span className="text-[11px] text-slate-500 font-mono">Collect ₹{order.total_amount} at door</span>
                          )}
                        </div>
                      </div>

                      {/* Volunteer Action Buttons */}
                      <div className="flex items-center gap-2 self-end md:self-center">
                        {order.status === 'Placed' && (
                          <button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                          >
                            Accept Delivery Run
                          </button>
                        )}

                        {order.status === 'Accepted' && (
                          <button
                            onClick={() => handleOutForDelivery(order.id)}
                            className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm"
                          >
                            Heading to Classroom
                          </button>
                        )}

                        {order.status === 'Out for delivery' && (
                          <button
                            onClick={() => {
                              setOtpModalOrder(order);
                              setInputOtp('');
                              setOtpError('');
                              setOtpSuccess('');
                            }}
                            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm flex items-center gap-1.5"
                          >
                            <KeyRound className="w-4 h-4" />
                            <span>Verify Student OTP</span>
                          </button>
                        )}

                        {order.status === 'Delivered' && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                            Delivered at {new Date(order.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 4: MANAGE MENU (Admin / Staff)         */}
      {/* ========================================== */}
      {activeTab === 'manage-menu' && isAdminOrStaff && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Canteen Delivery Menu Items</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setMenuFormData({
                  name: '',
                  category: 'Rolls & Wraps',
                  price: '',
                  image_url: '',
                  description: '',
                  preparation_time: '15'
                });
                setMenuModalOpen(true);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add Menu Item
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menu.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{item.category}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.is_available ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_available ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">₹{item.price} • {item.preparation_time} min prep</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setMenuFormData({
                        name: item.name,
                        category: item.category,
                        price: item.price.toString(),
                        image_url: item.image_url || '',
                        description: item.description || '',
                        preparation_time: item.preparation_time ? item.preparation_time.toString() : '15'
                      });
                      setMenuModalOpen(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* OTP VERIFICATION MODAL (Volunteer)         */}
      {/* ========================================== */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black text-slate-900">Enter Student Delivery OTP</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ask the student at <strong>{otpModalOrder.classroom_location}</strong> for the 4-digit code shown on their VCanteen screen.
            </p>

            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 font-mono">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>You will earn +{otpModalOrder.courier_reward_coins || pricing.totalCourierReward} Campus Coins!</span>
            </div>

            {otpError && (
              <p className="mt-3 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {otpError}
              </p>
            )}

            {otpSuccess && (
              <p className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                {otpSuccess}
              </p>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-4 space-y-4">
              <input
                type="text"
                maxLength={4}
                required
                autoFocus
                placeholder="• • • •"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                className="w-40 mx-auto text-center font-mono text-3xl font-black tracking-widest py-2.5 border-2 border-slate-300 rounded-2xl focus:outline-none focus:border-emerald-500"
              />

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpModalOrder(null)}
                  className="w-1/2 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyingOtp || inputOtp.length !== 4}
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  {verifyingOtp ? 'Checking...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Create / Edit Modal (Admin/Staff) */}
      {menuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6">
            <h2 className="text-lg font-black text-slate-900 mb-4">
              {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
            </h2>

            <form onSubmit={handleSaveMenuItem} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={menuFormData.name}
                  onChange={(e) => setMenuFormData({ ...menuFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    value={menuFormData.category}
                    onChange={(e) => setMenuFormData({ ...menuFormData, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs bg-white"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={menuFormData.price}
                    onChange={(e) => setMenuFormData({ ...menuFormData, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={menuFormData.image_url}
                  onChange={(e) => setMenuFormData({ ...menuFormData, image_url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Description</label>
                <textarea
                  rows={2}
                  value={menuFormData.description}
                  onChange={(e) => setMenuFormData({ ...menuFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setMenuModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
