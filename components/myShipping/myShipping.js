// components/myShipping/myShipping.js - সম্পূর্ণ আপডেটেড with Return Request

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  getMyShipments,
  getMyShipmentById,
  getMyShipmentTimeline,
  trackShipmentByNumber,
  getShipmentStatusDisplayText,
  getShipmentProgress,
  formatShipmentDate,
  formatWeight,
  formatVolume,
  calculateTotalWeight,
  calculateTotalVolume,
  getShipmentSummary,
  requestReturn,
  getReturnRequestStatus,
  canRequestReturn,
  getReturnReasonText,
  getReturnStatusText,
  customerConfirmReturn,
  customerRejectReturn,
  formatReturnCost
} from '@/services/shipping';
import { trackByNumber } from '@/services/booking';
import { getMyNewShipments } from '@/services/newShipping';

// Icons
import {
  Package, Search, Filter, ChevronDown, ChevronLeft, ChevronRight,
  Eye, Download, Plus, Calendar, MapPin, User,
  Truck, Ship, Plane, Clock, CheckCircle, XCircle,
  AlertCircle, RefreshCw, Loader2, MoreVertical,
  ArrowUpDown, Filter as FilterIcon,
  X, Globe, Hash, DollarSign,
  ChevronsLeft, ChevronsRight,
  FileText, Box, Activity, Navigation,
  CheckCircle as CheckCircleSolid,
  XCircle as XCircleSolid, Clock as ClockSolid,
  Send, Flag, Shield, Award, Pause, RotateCcw,
  Layers, Train, Undo2, MessageCircle, ThumbsUp, ThumbsDown,Info 
} from 'lucide-react';

// ==================== COLOR CONSTANTS ====================
const COLORS = {
  primary: '#F91616',
  secondary: '#3C719D',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  purple: '#8b5cf6',
  red: '#f97316',
  cyan: '#06b6d4',
  emerald: '#10b981',
  teal: '#14b8a6'
};

// ==================== COMPLETE STATUS CONFIGURATION ====================
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: Clock,
    progress: 10
  },
  received_at_warehouse: {
    label: 'Received at Warehouse',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: Package,
    progress: 20
  },
  picked_up_from_warehouse: {
    label: 'Picked Up',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Truck,
    progress: 45
  },
  inspected: {
    label: 'Inspected',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircle,
    progress: 25
  },
  consolidating: {
    label: 'Consolidating',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Layers,
    progress: 30
  },
  consolidated: {
    label: 'Consolidated',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Layers,
    progress: 35
  },
  ready_for_dispatch: {
    label: 'Ready for Dispatch',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CheckCircle,
    progress: 40
  },
  loaded_in_container: {
    label: 'Loaded in Container',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Package,
    progress: 50
  },
  dispatched: {
    label: 'Dispatched',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: Send,
    progress: 55
  },
  departed_port_of_origin: {
    label: 'Departed Origin Port',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Ship,
    progress: 50
  },
  in_transit_sea_freight: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Ship,
    progress: 55
  },
  in_transit: {
    label: 'In Transit',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Truck,
    progress: 60
  },
  arrived_at_destination_port: {
    label: 'Arrived at Port',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: Flag,
    progress: 70
  },
  customs_cleared: {
    label: 'Customs Cleared',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Shield,
    progress: 80
  },
  out_for_delivery: {
    label: 'Out for Delivery',
    color: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: Navigation,
    progress: 90
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-50 text-green-700 border-green-200',
    icon: CheckCircleSolid,
    progress: 100
  },
  completed: {
    label: 'Completed',
    color: 'bg-emerald-600 text-white border-emerald-600',
    icon: Award,
    progress: 100
  },
  damage_reported: {
    label: 'Damage Reported',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: AlertCircle,
    progress: 0
  },
  on_hold: {
    label: 'On Hold',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Pause,
    progress: 0
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: XCircleSolid,
    progress: 0
  },
  returned: {
    label: 'Returned',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: RotateCcw,
    progress: 0
  },
};

const SHIPMENT_JOURNEY_STAGES = [
  { id: 'confirmed', label: 'Booking confirmed', statuses: ['booking_requested', 'price_quoted', 'booking_confirmed', 'pending'], icon: Package },
  { id: 'warehouse', label: 'Received at warehouse', statuses: ['received_at_warehouse'], icon: MapPin },
  { id: 'inspection', label: 'Inspection complete', statuses: ['inspected', 'damage_reported'], icon: CheckCircle },
  { id: 'consolidation', label: 'Consolidated', statuses: ['consolidating', 'consolidated'], icon: Layers },
  { id: 'dispatch-ready', label: 'Prepared for dispatch', statuses: ['ready_for_dispatch', 'picked_up_from_warehouse', 'loaded_in_container', 'loaded_into_container', 'container_sealed'], icon: Package },
  { id: 'departed', label: 'Departed origin', statuses: ['departed_port_of_origin', 'dispatched', 'departed'], icon: Ship },
  { id: 'in-transit', label: 'In transit', statuses: ['in_transit', 'in_transit_sea_freight', 'in_transit_air_freight'], icon: Truck },
  { id: 'arrived', label: 'Arrived at destination', statuses: ['arrived', 'arrived_at_destination_port'], icon: Flag },
  { id: 'customs', label: 'Customs and unloading', statuses: ['under_customs_clearance', 'under_customs_cleared', 'customs_clearance', 'customs_cleared', 'unloaded_from_vessel'], icon: Shield },
  { id: 'delivery', label: 'Out for delivery', statuses: ['out_for_delivery'], icon: Navigation },
  { id: 'delivered', label: 'Delivered', statuses: ['delivered', 'completed'], icon: CheckCircleSolid }
];

// ==================== SHIPMENT MODE CONFIG ====================
const SHIPMENT_MODE_CONFIG = {
  air_freight: { icon: Plane, label: 'Air Freight', color: COLORS.info },
  sea_freight: { icon: Ship, label: 'Sea Freight', color: COLORS.secondary },
  road_freight: { icon: Truck, label: 'Road Freight', color: COLORS.success },
  rail_freight: { icon: Train, label: 'Rail Freight', color: COLORS.purple },
  express_courier: { icon: Package, label: 'Express', color: COLORS.red }
};

// ==================== BUTTON COMPONENT ====================
// Button Component - আপডেটেড ভার্সন
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  onClick, 
  className = '', 
  icon: Icon,
  iconClassName = '',
  ariaLabel,
  title,
  disabled 
}) => {
  const variants = {
    primary: 'bg-amber-700 text-white hover:bg-amber-800',
    booking: 'bg-red-600 text-white hover:bg-red-600',
    secondary: 'bg-[#3C719D] text-white hover:bg-[#2c5a8c]',
    outline: 'border-2 border-[#F91616] text-[#F91616] hover:bg-[#fef2e6]',
    ghost: 'text-gray-600 hover:bg-gray-100',
    success: 'bg-[#10b981] text-white hover:bg-[#0d9488]',
    danger: 'bg-[#ef4444] text-white hover:bg-[#dc2626]',
    light: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  const iconClasses = `h-4 w-4 ${iconClassName} ${children ? 'mr-2' : ''}`.trim();
  const iconNode = Icon
    ? React.isValidElement(Icon)
      ? React.cloneElement(Icon, {
          className: `${Icon.props.className || 'h-4 w-4'} ${iconClassName} ${children ? 'mr-2' : ''}`.trim(),
        })
      : React.createElement(Icon, { className: iconClasses })
    : null;

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      title={title}
      className={`rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {iconNode}
          {children}
        </>
      )}
    </button>
  );
};

// ==================== INPUT COMPONENT ====================
const Input = ({ type = 'text', label, value, onChange, placeholder, icon: Icon, error, required, className = '', textarea = false }) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      {textarea ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows="3"
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300' : 'border-gray-300'} ${className}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[${COLORS.primary}] focus:border-transparent ${Icon ? 'pl-10' : ''} ${error ? 'border-red-300' : 'border-gray-300'} ${className}`}
        />
      )}
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ==================== SELECT COMPONENT ====================
const Select = ({ name, label, value, onChange, options, placeholder, icon: Icon, required, error, className = '' }) => (
  <div className="space-y-2 rounded-lg border border-slate-300 bg-slate-100 p-3">
    {label && (
      <label className="block text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full min-h-12 bg-white text-slate-900 px-3 py-2 text-sm font-medium border-2 border-slate-400 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${Icon ? 'pl-10' : 'pl-3'} pr-10 ${className}`}
      >
        <option value="" className="bg-white text-slate-900">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value} className="bg-white text-slate-900">{option.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </div>
    </div>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ==================== STATUS BADGE ====================
const StatusBadge = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status];
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-xs', lg: 'px-3 py-1.5 text-sm' };
  
  if (!config) {
    const formattedLabel = status?.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ') || 'Unknown';
    return (
      <span className={`inline-flex items-center rounded-full font-medium border bg-gray-50 text-gray-700 border-gray-200 ${sizes[size]}`}>
        <Clock className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
        {formattedLabel}
      </span>
    );
  }

  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${config.color} ${sizes[size]}`}>
      <Icon className={`${size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
      {config.label}
    </span>
  );
};

// ==================== MODE BADGE ====================
const ModeBadge = ({ mode }) => {
  const config = SHIPMENT_MODE_CONFIG[mode] || { icon: Package, label: mode || 'Standard', color: COLORS.secondary };
  const Icon = config.icon;
  return (
    <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: `${config.color}15`, color: config.color }}>
      <Icon className="h-3.5 w-3.5 mr-1" />
      {config.label}
    </span>
  );
};

// ==================== PROGRESS BAR ====================
const ProgressBar = ({ progress, showLabel = false }) => (
  <div className="w-full">
    {showLabel && (
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-500">Progress</span>
        <span className="text-xs font-medium" style={{ color: COLORS.primary }}>{progress}%</span>
      </div>
    )}
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? COLORS.success : COLORS.primary }} />
    </div>
  </div>
);

// ==================== STAT CARD ====================
const StatCard = ({ title, value, icon: Icon, color, onClick, active }) => (
  <div onClick={onClick} className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${active ? `border-[${COLORS.primary}] ring-2 ring-[${COLORS.primary}]/20` : 'border-gray-200'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs text-gray-500 mb-1">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

// ==================== ACTION MENU ====================
const ActionMenu = ({ shipment, onAction }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) return;
      setShowMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canReturn = canRequestReturn(shipment);
  const hasReturnRequest = shipment.returnRequest && shipment.returnRequest.status !== 'none';

  const actions = [
    { label: 'View Details', icon: Eye, action: 'view', color: 'text-blue-600' },
    { label: 'Track Shipment', icon: Navigation, action: 'track', color: 'text-green-600' },
  ];

  if (canReturn && !hasReturnRequest) {
    actions.push({ label: 'Request Return', icon: Undo2, action: 'return', color: 'text-red-600' });
  }

  if (hasReturnRequest) {
    const returnStatus = shipment.returnRequest?.status;
    let returnLabel = 'Return Request';
    if (returnStatus === 'pending') returnLabel = 'Return Pending';
    else if (returnStatus === 'approved') returnLabel = 'Return Approved';
    else if (returnStatus === 'completed') returnLabel = 'Return Completed';
    else if (returnStatus === 'rejected') returnLabel = 'Return Rejected';
    
    actions.push({ 
      label: returnLabel, 
      icon: returnStatus === 'approved' ? ThumbsUp : returnStatus === 'rejected' ? ThumbsDown : Undo2, 
      action: 'viewReturn', 
      color: returnStatus === 'approved' ? 'text-green-600' : returnStatus === 'rejected' ? 'text-red-600' : 'text-red-600' 
    });
  }

  const toggleMenu = () => {
    const willOpen = !showMenu;
    if (willOpen && buttonRef.current) {
      const container = buttonRef.current.closest('.overflow-auto');
      if (container) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const spaceBelow = containerRect.bottom - buttonRect.bottom;
        const menuHeight = 150;
        if (spaceBelow < menuHeight) {
          container.scrollBy({
            top: menuHeight - spaceBelow + 8,
            behavior: 'smooth'
          });
        }
      }
    }
    setShowMenu(willOpen);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical className="h-4 w-4 text-gray-500" />
      </button>

      {showMenu && (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
          {actions.map((action, index) => (
            <button
              key={`${action.action}-${index}`}
              onClick={() => { onAction(action.action, shipment); setShowMenu(false); }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
            >
              <action.icon className={`h-4 w-4 mr-3 ${action.color}`} />
              <span className="text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MODAL ====================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  
  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
      <div className="relative flex min-h-full items-center justify-center p-4">
        <div className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white ${sizes[size]}`}>
          <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

// ==================== RETURN REQUEST MODAL ====================
// ==================== RETURN REQUEST MODAL (Cost Preview সহ) ====================
const ReturnRequestModal = ({ isOpen, onClose, shipment, onSuccess }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    items: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calculatedCost, setCalculatedCost] = useState(null);

  const returnReasons = [
    { value: 'damaged_product', label: 'Damaged Product', costNote: 'Free return - No cost to you' },
    { value: 'wrong_product', label: 'Wrong Product Received', costNote: 'Free return - No cost to you' },
    { value: 'missing_items', label: 'Missing Items', costNote: 'Free return - No cost to you' },
    { value: 'delayed_delivery', label: 'Delayed Delivery', costNote: 'Free return - No cost to you' },
    { value: 'customer_cancellation', label: 'Customer Cancellation', costNote: '15% restocking fee (minimum $50)' },
    { value: 'other', label: 'Other Reason', costNote: 'Standard return charges apply (10% of product value)' }
  ];

  // Calculate cost preview based on selected reason
  useEffect(() => {
    if (formData.reason && shipment) {
      const totalValue = shipment.packages?.reduce((sum, pkg) => {
        return sum + ((pkg.value?.amount || 0) * (pkg.quantity || 1));
      }, 0) || 0;

      let cost = 0;
      let isFree = false;
      let breakdown = {};

      switch (formData.reason) {
        case 'damaged_product':
        case 'wrong_product':
        case 'missing_items':
        case 'delayed_delivery':
          isFree = true;
          cost = 0;
          breakdown = { note: 'No charges for this return reason' };
          break;
        case 'customer_cancellation':
          cost = Math.max(50, totalValue * 0.15);
          breakdown = {
            shippingCost: 25,
            handlingFee: 15,
            restockingFee: Math.max(10, totalValue * 0.1),
            total: cost,
            note: 'Customer cancellation charges'
          };
          break;
        default:
          cost = Math.max(35, totalValue * 0.1);
          breakdown = {
            shippingCost: 20,
            handlingFee: 10,
            restockingFee: Math.max(5, totalValue * 0.05),
            total: cost,
            note: 'Standard return charges'
          };
          break;
      }

      setCalculatedCost({ amount: cost, isFree, breakdown, currency: 'USD' });
    }
  }, [formData.reason, shipment]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  // client-side eligibility check + helpful reason message
  const eligibleForReturn = canRequestReturn(shipment);

  const getIneligibilityReason = () => {
    if (!shipment) return 'Shipment not found';
    if (eligibleForReturn) return null;
    const statusText = getShipmentStatusDisplayText(shipment.status);
    const deliveryDate = shipment.dates?.delivered || shipment.courier?.actualDeliveryDate || shipment.updatedAt;
    if (shipment.status !== 'delivered' && shipment.status !== 'completed') {
      return `Shipment cannot be returned. Current status: ${statusText}`;
    }
    if (deliveryDate) {
      const daysSince = Math.floor((Date.now() - new Date(deliveryDate)) / (1000 * 60 * 60 * 24));
      if (daysSince > 14) return `Return window expired (${daysSince} days since delivery)`;
    }
    return `Shipment cannot be returned.`;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.reason) newErrors.reason = 'Please select a reason';
    if (!formData.description) newErrors.description = 'Please provide details';
    else if (formData.description.length < 10) newErrors.description = 'Please provide at least 10 characters';
    return newErrors;
  };

  const handleSubmit = async () => {
    // Prevent submission if not eligible and show reason inline
    if (!eligibleForReturn) {
      setErrors(prev => ({ ...prev, server: getIneligibilityReason() }));
      return;
    }

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await requestReturn(shipment._id, {
        reason: formData.reason,
        description: formData.description,
        items: formData.items
      });

      if (result.success) {
        toast.success(result.message || 'Return request submitted successfully');
        onSuccess?.();
        onClose();
      } else {
        // show server-provided reason inline and as toast
        setErrors(prev => ({ ...prev, server: result.message || 'Failed to submit return request' }));
        toast.error(result.message || 'Failed to submit return request');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedReason = returnReasons.find(r => r.value === formData.reason);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Return" size="md">
      <div className="space-y-5">
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-700">
            <AlertCircle className="h-4 w-4 inline mr-1" />
            You have 14 days from delivery date to request a return.
          </p>
        </div>

        {errors.server && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            <p className="text-sm">{errors.server}</p>
          </div>
        )}

        {!eligibleForReturn && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
            <p className="text-sm">{getIneligibilityReason()}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shipment #{shipment?.shipmentNumber || shipment?._id?.slice(-8)}
          </label>
          <p className="text-xs text-gray-500">
            Delivered on: {formatShipmentDate(shipment?.dates?.delivered || shipment?.updatedAt, 'short')}
          </p>
        </div>

        <Select
          label="Return Reason"
          value={formData.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          options={returnReasons}
          placeholder="Select a reason"
          required
          error={errors.reason}
        />

        {selectedReason && (
          <div className="bg-blue-50 p-2 rounded-lg">
            <p className="text-xs text-blue-700">
              <Info className="h-3 w-3 inline mr-1" />
              {selectedReason.costNote}
            </p>
          </div>
        )}

        {/* Cost Preview */}
        {calculatedCost && formData.reason && (
          <div className={`p-3 rounded-lg ${calculatedCost.isFree ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estimated Return Cost:</span>
              <span className={`font-bold ${calculatedCost.isFree ? 'text-green-700' : 'text-yellow-700'}`}>
                {calculatedCost.isFree ? 'FREE' : `${calculatedCost.currency} ${calculatedCost.amount.toFixed(2)}`}
              </span>
            </div>
            {!calculatedCost.isFree && calculatedCost.breakdown && (
              <div className="mt-2 text-xs text-gray-600">
                <p>Breakdown:</p>
                <ul className="list-disc list-inside ml-2">
                  {calculatedCost.breakdown.shippingCost > 0 && <li>Shipping: ${calculatedCost.breakdown.shippingCost}</li>}
                  {calculatedCost.breakdown.handlingFee > 0 && <li>Handling: ${calculatedCost.breakdown.handlingFee}</li>}
                  {calculatedCost.breakdown.restockingFee > 0 && <li>Restocking: ${calculatedCost.breakdown.restockingFee}</li>}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              *Final cost will be confirmed by admin upon approval
            </p>
          </div>
        )}

        <Input
          label="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Please describe the issue in detail..."
          textarea
          required
          error={errors.description}
        />

        {shipment?.packages?.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items to Return (Optional)
            </label>
            <div className="space-y-2">
              {shipment.packages.map((pkg, index) => (
                <label key={index} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.items.includes(index)}
                    onChange={(e) => {
                      const newItems = e.target.checked
                        ? [...formData.items, index]
                        : formData.items.filter(i => i !== index);
                      handleChange('items', newItems);
                    }}
                    className="rounded border-gray-300 text-[#E67E22] focus:ring-[#E67E22]"
                  />
                  <span>
                    {pkg.packageType || 'Package'} #{index + 1}
                    {pkg.description && ` - ${pkg.description}`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button className='bg-red-600 text-white' onClick={handleSubmit} isLoading={loading} disabled={loading || !eligibleForReturn}>
            Submit Return Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== RETURN STATUS MODAL ====================
// ==================== RETURN STATUS & CONFIRM MODAL (আপডেটেড) ====================
const ReturnStatusModal = ({ isOpen, onClose, shipment, onSuccess }) => {
  const [returnStatus, setReturnStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (isOpen && shipment) {
      fetchReturnStatus();
    }
  }, [isOpen, shipment]);

  const fetchReturnStatus = async () => {
    setLoading(true);
    try {
      const result = await getReturnRequestStatus(shipment._id);
      if (result.success) {
        setReturnStatus(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch return status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReturn = async () => {
    setConfirmLoading(true);
    try {
      const result = await customerConfirmReturn(shipment._id, {
        notes: 'I confirm the return with the associated cost',
        acceptCost: true
      });

      if (result.success) {
        toast.success(result.message || 'Return confirmed and completed successfully!');
        onSuccess?.();
        onClose();
        setShowConfirmDialog(false);
      } else {
        toast.error(result.message || 'Failed to confirm return');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleRejectReturn = async () => {
    if (!rejectReason.trim()) {
      toast.warning('Please provide a reason for cancellation');
      return;
    }

    setRejectLoading(true);
    try {
      const result = await customerRejectReturn(shipment._id, {
        reason: rejectReason
      });

      if (result.success) {
        toast.success(result.message || 'Return cancelled successfully');
        onSuccess?.();
        onClose();
        setShowRejectDialog(false);
        setRejectReason('');
      } else {
        toast.error(result.message || 'Failed to cancel return');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setRejectLoading(false);
    }
  };

  if (!isOpen) return null;

  const returnRequest = returnStatus?.returnRequest || shipment?.returnRequest;
  
  if (!returnRequest || returnRequest.status === 'none') {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Return Status" size="sm">
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No return request found for this shipment.</p>
        </div>
      </Modal>
    );
  }

  const returnCost = returnRequest.returnCost || 0;
  const isFreeReturn = returnRequest.isFreeReturn || false;
  const costBreakdown = returnRequest.returnCostBreakdown;

  const statusConfig = {
    pending: {
      title: 'Pending Admin Approval',
      description: 'Your return request has been submitted and is waiting for admin review.',
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      icon: Clock,
      actions: null
    },
    approved: {
      title: 'Return Approved - Action Required',
      description: 'Your return request has been approved. Please review the return cost below and confirm or cancel.',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: ThumbsUp,
      actions: 'confirm'
    },
    rejected_by_admin: {
      title: 'Return Rejected',
      description: `Your return request has been rejected. Reason: ${returnRequest.rejectionReason || 'Not specified'}`,
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: ThumbsDown,
      actions: null
    },
    rejected_by_customer: {
      title: 'Return Cancelled',
      description: `You have cancelled this return request. Reason: ${returnRequest.customerRejectionReason || 'Not specified'}`,
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: XCircle,
      actions: null
    },
    completed: {
      title: 'Return Completed',
      description: 'Your return has been completed successfully.',
      color: 'bg-green-50 text-green-700 border-green-200',
      icon: CheckCircleSolid,
      actions: null
    }
  };

  const config = statusConfig[returnRequest.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Return Request Status" size="md">
        <div className="space-y-5">
          {/* Status Header */}
          <div className={`p-4 rounded-lg border ${config.color}`}>
            <div className="flex items-center space-x-3">
              <StatusIcon className="h-6 w-6" />
              <div>
                <p className="font-semibold">{config.title}</p>
                <p className="text-xs opacity-75">
                  Requested on: {formatShipmentDate(returnRequest.requestedAt, 'long')}
                </p>
              </div>
            </div>
          </div>

          {/* Return Details */}
          <div className="border rounded-lg p-4">
            <h5 className="text-sm font-medium mb-3">Return Details</h5>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Reason</p>
                <p className="text-sm font-medium">{getReturnReasonText(returnRequest.reason)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="text-sm text-gray-600">{returnRequest.description}</p>
              </div>
              {returnRequest.returnTrackingNumber && (
                <div>
                  <p className="text-xs text-gray-500">Return Tracking Number</p>
                  <p className="text-sm font-medium">{returnRequest.returnTrackingNumber}</p>
                </div>
              )}
              {returnRequest.returnNotes && (
                <div>
                  <p className="text-xs text-gray-500">Admin Notes</p>
                  <p className="text-sm text-gray-600">{returnRequest.returnNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Return Cost Section (for approved status) */}
          {returnRequest.status === 'approved' && (
            <div className="border rounded-lg p-4">
              <h5 className="text-sm font-medium mb-3 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                Return Cost Details
              </h5>
              
              {isFreeReturn ? (
                <div className="bg-green-50 p-3 rounded-lg text-center">
                  <p className="text-green-700 font-semibold">FREE RETURN</p>
                  <p className="text-xs text-green-600 mt-1">No charges apply for this return</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {costBreakdown && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping Cost:</span>
                          <span className="font-medium">${costBreakdown.shippingCost || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Handling Fee:</span>
                          <span className="font-medium">${costBreakdown.handlingFee || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Restocking Fee:</span>
                          <span className="font-medium">${costBreakdown.restockingFee || 0}</span>
                        </div>
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold">
                            <span>Total Return Cost:</span>
                            <span style={{ color: COLORS.primary }}>${returnCost} USD</span>
                          </div>
                        </div>
                        {costBreakdown.note && (
                          <p className="text-xs text-gray-500 mt-2">{costBreakdown.note}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {!costBreakdown && (
                    <div className="bg-blue-50 p-3 rounded-lg text-center">
                      <p className="text-blue-700 font-semibold">Total Return Cost: ${returnCost} USD</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex space-x-3">
                <Button 
                  variant="success" 
                  size="sm" 
                  onClick={() => setShowConfirmDialog(true)}
                  icon={<CheckCircle className="h-4 w-4" />}
                  className="flex-1"
                >
                  Confirm Return
                </Button>
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => setShowRejectDialog(true)}
                  icon={<XCircle className="h-4 w-4" />}
                  className="flex-1"
                >
                  Cancel Return
                </Button>
              </div>
            </div>
          )}

          {/* Description for other statuses */}
          {returnRequest.status !== 'approved' && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="primary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Return Dialog */}
      {showConfirmDialog && (
        <Modal isOpen={showConfirmDialog} onClose={() => setShowConfirmDialog(false)} title="Confirm Return" size="sm">
          <div className="space-y-4">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Are you sure you want to confirm this return?
                  </p>
                  {!isFreeReturn && (
                    <p className="text-xs text-yellow-700 mt-1">
                      You will be charged ${returnCost} USD for this return.
                    </p>
                  )}
                  <p className="text-xs text-yellow-700 mt-1">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
              <Button variant="success" onClick={handleConfirmReturn} isLoading={confirmLoading}>
                Yes, Confirm Return
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Reject/Cancel Return Dialog */}
      {showRejectDialog && (
        <Modal isOpen={showRejectDialog} onClose={() => setShowRejectDialog(false)} title="Cancel Return" size="md">
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Are you sure you want to cancel this return?
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    This action cannot be undone. You will need to submit a new return request if you change your mind.
                  </p>
                </div>
              </div>
            </div>
            
            <Input
              label="Cancellation Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Please tell us why you want to cancel the return..."
              textarea
              required
            />

            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowRejectDialog(false)}>Go Back</Button>
              <Button variant="danger" onClick={handleRejectReturn} isLoading={rejectLoading}>
                Yes, Cancel Return
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

// ==================== SHIPMENT DETAILS MODAL ====================
const ShipmentDetailsModal = ({ isOpen, onClose, shipment, source = 'first' }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    if (isOpen && shipment) {
      if (source === 'first') {
        fetchTimeline();
        fetchTrackingData();
      } else {
        if (shipment.timeline) {
          setTimeline(shipment.timeline);
        }
        fetchTrackingData();
      }
    }
  }, [isOpen, shipment, source]);

  const fetchTrackingData = async () => {
    const trackingNo = shipment?.trackingNumber || shipment?.shipmentDetails?.trackingNumber;
    if (!trackingNo) return;
    setTrackingLoading(true);
    try {
      const result = await trackByNumber(trackingNo);
      if (result.success) {
        setTrackingData(result.data);
      }
    } catch (error) {
      console.error('Tracking fetch error:', error);
    } finally {
      setTrackingLoading(false);
    }
  };

  const fetchTimeline = async () => {
    if (!shipment?._id) return;
    setLoading(true);
    try {
      const result = await getMyShipmentTimeline(shipment._id);
      if (result.success) setTimeline(result.data?.timeline || result.data || []);
    } catch (error) {
      toast.error('Failed to fetch timeline');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !shipment) return null;

  let totalWeight = 0;
  let totalVolume = 0;
  let packages = [];
  let status = '';
  let trackingNum = '';
  let origin = '';
  let destination = '';
  let shipmentType = '';
  let createdAt = '';
  let updatedAt = '';

  if (source === 'first') {
    totalWeight = calculateTotalWeight(shipment.packages);
    totalVolume = calculateTotalVolume(shipment.packages);
    packages = shipment.packages || [];
    status = trackingData?.status || shipment.status;
    trackingNum = shipment.trackingNumber || shipment.shipmentDetails?.trackingNumber;
    origin = shipment.shipmentDetails?.origin;
    destination = shipment.shipmentDetails?.destination;
    shipmentType = shipment.shipmentDetails?.shipmentType;
    createdAt = shipment.createdAt;
    updatedAt = shipment.updatedAt;
  } else {
    totalWeight = shipment.shipmentDetails?.totalWeight || 0;
    packages = shipment.shipmentDetails?.packageDetails || [];
    status = shipment.shipmentStatus;
    trackingNum = shipment.trackingNumber || shipment.shipmentDetails?.trackingNumber;
    origin = shipment.shipmentDetails?.origin;
    destination = shipment.shipmentDetails?.destination;
    shipmentType = shipment.shipmentDetails?.shippingMode;
    createdAt = shipment.createdAt;
    updatedAt = shipment.updatedAt;
  }

  const progress = trackingData?.progress || getShipmentProgress(status);
  const currentStatus = trackingData?.status || status;
  const currentLocation = trackingData?.currentLocation || 'In Transit';
  const journeyEvents = [...(trackingData?.timeline?.length ? trackingData.timeline : timeline)]
    .sort((a, b) => new Date(a.timestamp || a.date || a.formattedDate || 0) - new Date(b.timestamp || b.date || b.formattedDate || 0));
  const getJourneyStageIndex = (eventStatus) => SHIPMENT_JOURNEY_STAGES.findIndex(stage => stage.statuses.includes(String(eventStatus || '').toLowerCase()));
  const currentJourneyIndex = getJourneyStageIndex(currentStatus);
  const recordedJourneyIndexes = journeyEvents
    .map(event => getJourneyStageIndex(event.status))
    .filter(index => index >= 0);
  const activeJourneyIndex = Math.max(currentJourneyIndex, ...recordedJourneyIndexes, 0);
  const isDelivered = ['delivered', 'completed'].includes(String(currentStatus || '').toLowerCase());

  const transport = shipment.transport || trackingData?.transport || {};
  const transportLegs = shipment.transportLegs || trackingData?.transportLegs || [];
  const containers = shipment.containers || trackingData?.containers || [];
  const consolidation = trackingData?.consolidation || shipment.consolidation || {};
  const firstContainer = containers[0] || {};
  const transportValues = {
    carrier: shipment.courier?.company || transport.carrierName || 'Not assigned',
    vessel:
      transport.vesselName ||
      transport.flightNumber ||
      transportLegs.find(leg => leg?.vesselName)?.vesselName ||
      consolidation.vesselName ||
      'N/A',
    voyage:
      transport.voyageNumber ||
      transportLegs.find(leg => leg?.voyageNumber)?.voyageNumber ||
      consolidation.voyageNumber ||
      'N/A',
    container:
      transport.containerNumber ||
      trackingData?.containerNumber ||
      firstContainer.containerNumber ||
      shipment.containerInfo?.containerNumber ||
      consolidation.containerNumber ||
      'N/A',
    seal:
      trackingData?.sealNumber ||
      firstContainer.sealNumber ||
      shipment.containerInfo?.sealNumber ||
      consolidation.sealNumber ||
      'N/A',
    bl:
      trackingData?.blNumber ||
      firstContainer.blNumber ||
      shipment.containerInfo?.blNumber ||
      consolidation.blNumber ||
      'N/A'
  };

  const tabs = [
    { id: 'details', label: 'Details', icon: Package },
    { id: 'packages', label: 'Packages', icon: Box },
    { id: 'transport', label: 'Transport', icon: Truck },
    { id: 'timeline', label: 'Timeline', icon: Activity }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Shipment Details" size="lg">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold">#{shipment.shipmentNumber || shipment._id?.slice(-8)}</h4>
            {shipment.trackingNumber && (
              <p className="text-sm text-gray-500">Tracking: {shipment.trackingNumber}</p>
            )}
          </div>
          <StatusBadge status={currentStatus} size="lg" />
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current status</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={currentStatus} size="lg" />
                <span className="inline-flex items-center text-sm text-slate-600">
                  <MapPin className="mr-1.5 h-4 w-4 text-slate-400" />{currentLocation}
                </span>
              </div>
            </div>
            <span className="text-xs text-slate-500">
              Last updated {trackingData?.lastUpdate ? formatShipmentDate(trackingData.lastUpdate, 'short') : formatShipmentDate(updatedAt || shipment.updatedAt, 'short')}
            </span>
          </div>

          <div className="mt-5 border-t border-slate-200 pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h5 className="text-sm font-semibold text-slate-900">Shipment journey</h5>
                <p className="mt-0.5 text-xs text-slate-500">Progress updates as each stage is recorded</p>
              </div>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                {isDelivered ? 'Complete' : `${Math.max(0, Math.round(progress))}%`}
              </span>
            </div>

            <ol className="max-h-[340px] space-y-0 overflow-y-auto pr-1">
              {SHIPMENT_JOURNEY_STAGES.map((stage, index) => {
                const stageEvents = journeyEvents.filter(event => stage.statuses.includes(String(event.status || '').toLowerCase()));
                const latestStageEvent = stageEvents[stageEvents.length - 1];
                const isCurrent = index === activeJourneyIndex && !isDelivered;
                const isComplete = index < activeJourneyIndex || (isDelivered && index <= activeJourneyIndex);
                const StageIcon = isComplete ? CheckCircleSolid : stage.icon;
                const stageStatus = latestStageEvent?.status
                  ? getShipmentStatusDisplayText(latestStageEvent.status) || String(latestStageEvent.status).replace(/_/g, ' ')
                  : null;

                return (
                  <li key={stage.id} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-3 last:pb-0">
                    {index < SHIPMENT_JOURNEY_STAGES.length - 1 && (
                      <span className={`absolute bottom-0 left-[15px] top-8 w-px ${isComplete ? 'bg-emerald-300' : 'bg-slate-200'}`} aria-hidden="true" />
                    )}
                    <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${
                      isComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-600' :
                      isCurrent ? 'border-orange-200 bg-orange-50 text-[#F56602] ring-2 ring-orange-100' :
                      'border-slate-200 bg-white text-slate-400'
                    }`}>
                      <StageIcon className="h-4 w-4" />
                    </span>
                    <div className={`min-w-0 rounded-lg px-3 py-2 ${isCurrent ? 'bg-orange-50/70' : ''}`}>
                      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isComplete || isCurrent ? 'text-slate-900' : 'text-slate-500'}`}>{stage.label}</span>
                          {isCurrent && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700">Current</span>}
                        </div>
                        {latestStageEvent?.timestamp || latestStageEvent?.date ? (
                          <time className="text-xs text-slate-500">{formatShipmentDate(latestStageEvent.timestamp || latestStageEvent.date, 'short')}</time>
                        ) : !isComplete && !isCurrent ? (
                          <span className="text-xs text-slate-400">Upcoming</span>
                        ) : null}
                      </div>
                      {stageStatus && stageStatus.toLowerCase() !== stage.label.toLowerCase() && (
                        <p className="mt-0.5 text-xs capitalize text-slate-500">{stageStatus}</p>
                      )}
                      {latestStageEvent?.location && (
                        <p className="mt-1 inline-flex items-center text-xs text-slate-500">
                          <MapPin className="mr-1 h-3 w-3" />{latestStageEvent.location}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="border-b">
          <nav className="flex space-x-4">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-2 text-sm font-medium border-b-2 flex items-center ${activeTab === tab.id ? `border-[${COLORS.primary}] text-[${COLORS.primary}]` : 'border-transparent text-gray-500'}`}>
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3 flex items-center">
                  <User className="h-4 w-4 mr-2" style={{ color: COLORS.primary }} />
                  Shipment Information
                </h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm font-medium">{shipment.shipmentDetails?.origin || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-medium">{shipment.shipmentDetails?.destination || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Mode</p>
                    <ModeBadge mode={shipment.shipmentDetails?.shipmentType} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-sm font-medium">{formatShipmentDate(shipment.createdAt, 'short')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'packages' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Packages</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.primary }}>{shipment.packages?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.secondary }}>{formatWeight(totalWeight)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-xs text-gray-500">Volume</p>
                  <p className="text-2xl font-semibold" style={{ color: COLORS.success }}>{formatVolume(totalVolume)}</p>
                </div>
              </div>
              {shipment.packages?.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Dimensions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {shipment.packages.map((pkg, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm">{pkg.packageType || pkg.description || 'Package'}</td>
                          <td className="px-4 py-2 text-sm">{pkg.quantity || 1}</td>
                          <td className="px-4 py-2 text-sm">{formatWeight(pkg.weight)}</td>
                          <td className="px-4 py-2 text-sm">
                            {pkg.dimensions?.length && pkg.dimensions?.width && pkg.dimensions?.height 
                              ? `${pkg.dimensions.length}×${pkg.dimensions.width}×${pkg.dimensions.height} cm`
                              : pkg.length && pkg.width && pkg.height ? `${pkg.length}×${pkg.width}×${pkg.height} cm` : 'N/A'}
                            </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No package details</p>
              )}
            </div>
          )}

          {activeTab === 'transport' && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3">Transport Details</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Carrier</p>
                    <p className="text-sm font-medium">{transportValues.carrier}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Vessel/Flight</p>
                    <p className="text-sm font-medium">{transportValues.vessel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Voyage Number</p>
                    <p className="text-sm font-medium">{transportValues.voyage}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Container Number</p>
                    <p className="text-sm font-medium">{transportValues.container}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Seal Number</p>
                    <p className="text-sm font-medium">{transportValues.seal}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">BL Number</p>
                    <p className="text-sm font-medium">{transportValues.bl}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Current Location</p>
                    <p className="text-sm font-medium">{currentLocation || 'Not set'}</p>
                  </div>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h5 className="text-sm font-medium mb-3">Schedule</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Est. Departure</p>
                    <p className="text-sm font-medium">{shipment.transport?.estimatedDeparture || shipment.estimatedDepartureDate ? formatShipmentDate(shipment.transport?.estimatedDeparture || shipment.estimatedDepartureDate, 'short') : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Est. Arrival</p>
                    <p className="text-sm font-medium">{shipment.transport?.estimatedArrival || shipment.estimatedArrivalDate ? formatShipmentDate(shipment.transport?.estimatedArrival || shipment.estimatedArrivalDate, 'short') : 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {loading || trackingLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                </div>
              ) : ((trackingData?.timeline?.length ? trackingData.timeline : timeline).length > 0) ? (
                <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
                  <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-900">Shipment journey</h5>
                      <p className="mt-1 text-xs text-slate-500">
                        {(trackingData?.timeline?.length ? trackingData.timeline : timeline).length} updates · Oldest to newest
                      </p>
                    </div>
                    {trackingNum && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {trackingNum}
                      </span>
                    )}
                  </div>

                  <ol className="max-h-[55vh] space-y-0 overflow-y-auto pr-1">
                    {[...(trackingData?.timeline?.length ? trackingData.timeline : timeline)]
                      .sort((a, b) => new Date(a.timestamp || a.date || a.formattedDate || 0) - new Date(b.timestamp || b.date || b.formattedDate || 0))
                      .map((event, index, events) => {
                        const eventStatus = event.status || event.title || event.type;
                        const statusConfig = STATUS_CONFIG[eventStatus];
                        const EventIcon = statusConfig?.icon || Activity;
                        const eventDate = event.timestamp || event.date || event.formattedDate;
                        const eventLabel = event.statusLabel || getShipmentStatusDisplayText(event.status) || event.title || 'Shipment update';
                        const isLatest = index === events.length - 1;

                        return (
                          <li key={event._id || `${eventStatus}-${eventDate || index}-${index}`} className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-3 pb-5 last:pb-0">
                            {index < events.length - 1 && (
                              <span className="absolute bottom-0 left-[15px] top-8 w-px bg-slate-200" aria-hidden="true" />
                            )}
                            <span className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border ${isLatest ? 'border-orange-200 bg-orange-50 text-[#F56602]' : 'border-slate-200 bg-white text-slate-500'}`}>
                              <EventIcon className="h-4 w-4" />
                            </span>
                            <article className={`min-w-0 rounded-lg border p-3 sm:p-4 ${isLatest ? 'border-orange-200 bg-orange-50/40' : 'border-slate-200 bg-white'}`}>
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <h6 className="text-sm font-semibold text-slate-900">{eventLabel}</h6>
                                  {isLatest && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-orange-700">Latest</span>}
                                </div>
                                <time className="shrink-0 text-xs text-slate-500">
                                  {eventDate ? formatShipmentDate(eventDate, 'long') : 'Time unavailable'}
                                </time>
                              </div>
                              {event.description && <p className="mt-1.5 text-sm leading-5 text-slate-600">{event.description}</p>}
                              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                {event.location && <span className="inline-flex items-center"><MapPin className="mr-1 h-3.5 w-3.5" />{event.location}</span>}
                                {event.type && <span className="rounded bg-slate-100 px-1.5 py-0.5 capitalize">{String(event.type).replace(/_/g, ' ')}</span>}
                              </div>
                            </article>
                          </li>
                        );
                      })}
                  </ol>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                  <Activity className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-700">No timeline updates yet</p>
                  <p className="mt-1 text-xs text-slate-500">Shipment events will appear here as they are recorded.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="primary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  );
};

// ==================== TRACKING MODAL ====================
const TRACK_STATUS_ALIASES = {
  arrived: 'arrived_at_destination_port',
  loaded: 'loaded_in_container',
  dispatched: 'departed_port_of_origin',
  departed: 'departed_port_of_origin',
  customs_clearance: 'customs_cleared',
  under_customs_cleared: 'under_customs_clearance',
  consolidated: 'consolidated',
  in_progress: 'pending'
};

const normalizeTrackStatus = (status) => {
  const lower = String(status || '').toLowerCase();
  return TRACK_STATUS_ALIASES[lower] || lower;
};

const TRACK_STATUS_SEQUENCE = SHIPMENT_JOURNEY_STAGES.flatMap(stage => stage.statuses);

const TrackingModal = ({ isOpen, onClose, trackingNumber }) => {
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && trackingNumber) fetchTracking();
  }, [isOpen, trackingNumber]);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const result = await trackByNumber(trackingNumber);
      if (result.success) setTrackingData(result.data);
      else toast.error(result.message);
    } catch (error) {
      toast.error('Failed to fetch tracking');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const progress = trackingData?.progress || 0;
  const currentLocation = trackingData?.currentLocation || 'In Transit';
  const timelineEvents = [...(trackingData?.timeline || [])]
    .map(event => ({ ...event, normalizedStatus: normalizeTrackStatus(event.status) }))
    .sort((a, b) => {
      const aIndex = TRACK_STATUS_SEQUENCE.indexOf(a.normalizedStatus);
      const bIndex = TRACK_STATUS_SEQUENCE.indexOf(b.normalizedStatus);
      return (aIndex < 0 ? 999 : aIndex) - (bIndex < 0 ? 999 : bIndex);
    })
    .reverse()
    .filter((event, index, all) =>
      all.findIndex(item => item.normalizedStatus === event.normalizedStatus) === index
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Track Shipment" size="md">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
        </div>
      ) : trackingData ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Tracking Number</p>
                <p className="text-lg font-semibold">{trackingData.trackingNumber}</p>
              </div>
              <StatusBadge status={trackingData.status} size="lg" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Origin</p>
                <p className="text-sm font-medium">
                  {trackingData.origin ||
                    trackingData.shipmentDetails?.origin ||
                    trackingData.consolidation?.originWarehouse ||
                    ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Destination</p>
                <p className="text-sm font-medium">
                  {trackingData.destination ||
                    trackingData.shipmentDetails?.destination ||
                    trackingData.consolidation?.destinationPort ||
                    ''}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Current Status</span>
              <span className="text-xs text-blue-600">{progress}% Complete</span>
            </div>
            <div className="flex items-center space-x-2 mb-3">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-700">{currentLocation}</span>
            </div>
            <ProgressBar progress={progress} />
          </div>

          <div>
            <h5 className="text-sm font-medium mb-3">Tracking History</h5>
            <div>
              {timelineEvents.map((event, index) => {
                const stage = SHIPMENT_JOURNEY_STAGES.find(item => item.statuses.includes(event.normalizedStatus));
                const config = STATUS_CONFIG[event.normalizedStatus];
                const Icon = config?.icon || stage?.icon || Package;
                const label = config?.label || stage?.label || event.normalizedStatus.replace(/_/g, ' ');
                const isLast = index === timelineEvents.length - 1;
                return (
                  <div key={index} className="relative flex items-start space-x-3 pb-4 last:pb-0">
                    {!isLast && <div className="absolute left-3 top-6 bottom-0 w-px bg-gray-200" />}
                    <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${config?.color || 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium capitalize">{label}</p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">{formatShipmentDate(event.timestamp, 'short')}</p>
                      </div>
                      {event.location && <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>}
                      {event.description && <p className="text-xs text-gray-400 mt-0.5">{event.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">No tracking information found</p>
      )}
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================
export default function ShipmentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingOtherSource, setIsLoadingOtherSource] = useState(false);
  const hasLoadedShipments = useRef(false);
  const shipmentRequestId = useRef(0);
  const [myShipments, setMyShipments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    statusGroup: '',
    search: '',
    sort: '-createdAt'
  });

  const STAT_STATUS_GROUPS = {
    all: [],
    active: null,
    pending: [
      'pending', 'received_at_warehouse', 'consolidated', 'ready_for_dispatch'
    ],
    inTransit: [
      'in_transit', 'in_transit_sea_freight', 'departed_port_of_origin', 'dispatched'
    ],
    delivered: ['delivered', 'completed']
  };

  const [showFilters, setShowFilters] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedShipmentSource, setSelectedShipmentSource] = useState('first');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReturnStatusModal, setShowReturnStatusModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeStat, setActiveStat] = useState('all');

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    delivered: 0,
    pending: 0,
    inTransit: 0
  });

  const fetchShipmentsRef = useRef(null);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchShipmentsRef.current?.();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchShipmentsRef.current?.();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchMyShipments = async () => {
    const requestId = ++shipmentRequestId.current;
    if (!hasLoadedShipments.current) setLoading(true);
    setIsLoadingOtherSource(false);
    try {
      const firstParams = {
        page: 1,
        limit: 100,
        status: filters.status,
        search: filters.search,
        sort: filters.sort
      };
      const secondParams = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...(filters.search && { search: filters.search }),
        status: filters.status === 'cancelled' ? 'cancelled' : (filters.status === 'delivered' ? 'delivered' : '')
      };

      let firstData = [];
      let secondData = [];
      let settledRequests = 0;

      const publishAvailableShipments = () => {
        if (requestId !== shipmentRequestId.current) return;
        let combined = [...firstData, ...secondData];

        // Card counts must reflect every shipment, never the filtered view.
        setStats(getShipmentSummary(combined.map(shipment => ({
          ...shipment,
          status: shipment.status || shipment.shipmentStatus
        }))));

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          combined = combined.filter(shipment =>
            (shipment.shipmentNumber || shipment._id || '').toString().toLowerCase().includes(searchLower) ||
            (shipment.trackingNumber || '').toString().toLowerCase().includes(searchLower)
          );
        }

        const activeGroup = filters.statusGroup
          ? STAT_STATUS_GROUPS[filters.statusGroup]
          : undefined;
        if (activeGroup === null) {
          combined = combined.filter(shipment => {
            const status = shipment.status || shipment.shipmentStatus;
            return !['delivered', 'completed', 'cancelled'].includes(status);
          });
        } else if (Array.isArray(activeGroup) && activeGroup.length) {
          combined = combined.filter(shipment => {
            const status = shipment.status || shipment.shipmentStatus;
            return activeGroup.includes(status);
          });
        } else if (filters.status) {
          combined = combined.filter(shipment => {
            const status = shipment.status || shipment.shipmentStatus;
            return status === filters.status;
          });
        }

        const sortField = filters.sort.startsWith('-') ? filters.sort.substring(1) : filters.sort;
        const sortOrder = filters.sort.startsWith('-') ? 'desc' : 'asc';
        combined.sort((a, b) => {
          let aVal = a[sortField] || a.createdAt;
          let bVal = b[sortField] || b.createdAt;
          if (sortField === 'createdAt') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
          }
          if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
          return aVal < bVal ? 1 : -1;
        });

        const normalized = combined.map(shipment => ({
          ...shipment,
          isManual: Boolean(shipment.isManual || shipment.source === 'manual' || shipment._apiSource === 'second'),
          status: shipment.status || shipment.shipmentStatus,
          packages: shipment.packages || shipment.shipmentDetails?.packageDetails || []
        }));

        setMyShipments(normalized);
        setPagination({
          total: normalized.length,
          page: filters.page,
          limit: filters.limit,
          pages: Math.max(1, Math.ceil(normalized.length / filters.limit))
        });


      };

      const markRequestSettled = () => {
        if (requestId !== shipmentRequestId.current) return;
        settledRequests += 1;
        if (settledRequests === 2) {
          hasLoadedShipments.current = true;
          setLoading(false);
          setIsLoadingOtherSource(false);
        }
      };

      const firstRequest = getMyShipments(firstParams)
        .then((response) => {
          if (response.success) {
            firstData = (response.data || []).map(shipment => ({
              ...shipment,
              _apiSource: 'first'
            }));
            hasLoadedShipments.current = true;
            setLoading(false);
            setIsLoadingOtherSource(true);
            publishAvailableShipments();
          }
        })
        .catch((error) => console.error('Legacy shipment request failed:', error))
        .finally(markRequestSettled);

      const secondRequest = getMyNewShipments(secondParams)
        .then((response) => {
          if (response.success) {
            secondData = (response.data || []).map(shipment => ({
              ...shipment,
              _apiSource: 'second'
            }));
            hasLoadedShipments.current = true;
            setLoading(false);
            setIsLoadingOtherSource(true);
            publishAvailableShipments();
          }
        })
        .catch((error) => console.error('New shipment request failed:', error))
        .finally(markRequestSettled);

      await Promise.all([firstRequest, secondRequest]);
    } catch (error) {
      console.error('Fetch shipments error:', error);
      toast.error('Failed to fetch your shipments');
      setMyShipments([]);
      setPagination({ total: 0, page: 1, limit: 10, pages: 0 });
      setStats({
        total: 0,
        active: 0,
        delivered: 0,
        cancelled: 0,
        pending: 0,
        inTransit: 0
      });
    } finally {
      setLoading(false);
    }
  };

  fetchShipmentsRef.current = fetchMyShipments;

  useEffect(() => {
    const delay = filters.search ? 300 : 0;
    const timer = setTimeout(fetchMyShipments, delay);
    return () => clearTimeout(timer);
  }, [filters.page, filters.status, filters.statusGroup, filters.search, filters.sort]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      statusGroup: '',
      page: 1
    }));
    if (name === 'status') setActiveStat('all');
  };

  const handleSearch = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleSort = (field) => {
    const sortOrder = filters.sort === field ? `-${field}` : field;
    setFilters(prev => ({ ...prev, sort: sortOrder, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: 10, status: '', statusGroup: '', search: '', sort: '-createdAt' });
    setActiveStat('all');
    toast.info('Filters cleared');
  };

  const handleAction = async (action, shipment) => {
    setSelectedShipment(shipment);
    setSelectedShipmentSource(shipment._apiSource || 'first');
    switch (action) {
      case 'view':
        setShowDetailsModal(true);
        break;
      case 'track':
        if (shipment.trackingNumber) {
          setTrackingNumber(shipment.trackingNumber);
          setShowTrackingModal(true);
        } else {
          toast.warning('No tracking number available');
        }
        break;
      case 'return':
        setShowReturnModal(true);
        break;
      case 'viewReturn':
        setShowReturnStatusModal(true);
        break;
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchMyShipments();
      toast.info('Shipments refreshed');
    } finally {
      setIsRefreshing(false);
    }
  };

  const filterByStatus = (statusKey) => {
    setActiveStat(statusKey);
    setFilters(prev => ({
      ...prev,
      status: '',
      statusGroup: statusKey === 'all' ? '' : statusKey,
      page: 1
    }));
  };

  const statusOptions = Object.keys(STATUS_CONFIG).map(key => ({ 
    value: key, 
    label: STATUS_CONFIG[key].label 
  }));

  const visibleStats = [
    { key: 'all', label: 'All Shipments', value: stats.total, icon: Package, color: 'bg-gray-100 text-gray-600' },
    { key: 'active', label: 'Active', value: stats.active, icon: Activity, color: 'bg-blue-100 text-blue-600' },
    { key: 'pending', label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { key: 'inTransit', label: 'In Transit', value: stats.inTransit, icon: Truck, color: 'bg-cyan-100 text-cyan-600' },
    { key: 'delivered', label: 'Delivered', value: stats.delivered, icon: CheckCircleSolid, color: 'bg-green-100 text-green-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#fef2e6' }}>
                  <Package className="h-4 w-4" style={{ color: COLORS.primary }} />
                </div>
                <h1 className="ml-2 text-lg font-semibold text-gray-900">My Shipments</h1>
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {stats.total} Total
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="booking"
                size="sm" 
                onClick={() => router.push('/Bookings/create_bookings')}
                icon={Plus}
              >
                Create New Booking
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {visibleStats.map(stat => (
            <StatCard 
              key={stat.key} 
              title={stat.label} 
              value={stat.value} 
              icon={stat.icon} 
              color={stat.color}
              active={activeStat === stat.key}
              onClick={() => filterByStatus(stat.key)}
            />
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
          <div className="p-4">
            <form onSubmit={(event) => event.preventDefault()} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="flex-1 min-w-0">
                <Input
                  type="text"
                  placeholder="Search by shipment number, tracking number..."
                  value={filters.search}
                  onChange={handleSearch}
                  icon={Search}
                />
              </div>
              <Button
                variant="primary"
                size="md" 
                onClick={() => setShowFilters(!showFilters)}
                icon={FilterIcon}
              >
                Filters
                {(filters.status || filters.statusGroup || filters.search) && (
                  <span className="ml-2 bg-white text-[#E67E22] rounded-full px-2 py-0.5 text-xs">
                    {[
                      filters.search?.trim() || null,
                      filters.status || null,
                      filters.statusGroup ? 'group' : null
                    ].filter(Boolean).length}
                  </span>
                )}
              </Button>
              {(filters.search || filters.status || filters.statusGroup) && (
                <Button variant="light" size="md" onClick={clearFilters} icon={X}>
                  Clear
                </Button>
              )}
              <Button
                variant="light"
                size="md"
                onClick={handleManualRefresh}
                icon={RefreshCw}
                iconClassName={isRefreshing ? 'animate-spin' : ''}
                ariaLabel="Refresh shipments"
                title="Refresh shipments"
              />
            </form>

            {showFilters && (
              <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange} 
                  options={statusOptions} 
                  placeholder="All Statuses" 
                  label="Filter by Status" 
                  icon={Activity} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="max-h-[70vh] overflow-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('shipmentNumber')}>
                    <div className="flex items-center">
                      Shipment Info
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="h-4 w-4 ml-1" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Packages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: COLORS.primary }} />
                        <span className="ml-2 text-sm text-gray-500">Loading your shipments...</span>
                      </div>
                    </td>
                  </tr>
                ) : myShipments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center">
                        <Package className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm text-gray-500">No shipments found</p>
                        <p className="text-xs text-gray-400 mt-1">Create a booking to start shipping</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  myShipments
                    .slice((filters.page - 1) * filters.limit, filters.page * filters.limit)
                    .map((shipment) => {
                    const totalWeight = calculateTotalWeight(shipment.packages);
                    const progress = getShipmentProgress(shipment.status);
                    const hasReturnRequest = shipment.returnRequest && shipment.returnRequest.status !== 'none';
                    
                    return (
                      <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <div 
                              className="text-sm font-medium cursor-pointer hover:underline" 
                              style={{ color: COLORS.primary }} 
                              onClick={() => { setSelectedShipment(shipment); setSelectedShipmentSource(shipment._apiSource || 'first'); setShowDetailsModal(true); }}
                            >
                              #{shipment.shipmentNumber || shipment._id?.slice(-8)}
                            </div>
                            {(shipment.trackingNumber || shipment.shipmentDetails?.trackingNumber) && (
                              <div className="text-xs text-gray-500 flex items-center mt-1">
                                <Hash className="h-3 w-3 mr-1" />
                                {shipment.trackingNumber || shipment.shipmentDetails?.trackingNumber}
                              </div>
                            )}
                            {hasReturnRequest && (
                              <div className="text-xs mt-1">
                                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs ${
                                  shipment.returnRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                  shipment.returnRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                                  shipment.returnRequest.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  <Undo2 className="h-2.5 w-2.5 mr-1" />
                                  Return {getReturnStatusText(shipment.returnRequest.status)}
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center text-xs">
                            <span className="font-medium">{shipment.shipmentDetails?.origin || 'N/A'}</span>
                            <ChevronRight className="h-3 w-3 mx-1 text-gray-400" />
                            <span className="font-medium">{shipment.shipmentDetails?.destination || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500">
                            {formatShipmentDate(shipment.createdAt, 'short')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs">
                            <span className="font-medium">{shipment.packages?.length || 0}</span>
                            <span className="text-gray-500 ml-1">pkgs</span>
                            <div className="text-gray-500">{formatWeight(totalWeight)}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col space-y-1">
                            <StatusBadge status={shipment.status} size="sm" />
                            <div className="w-24">
                              <ProgressBar progress={progress} />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ActionMenu shipment={shipment} onAction={handleAction} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            <div className="h-40" aria-hidden="true" />
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm text-gray-600">Page {pagination.page} of {pagination.pages}</span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="p-2 text-gray-400 hover:text-[#E67E22] disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShipmentDetailsModal 
        isOpen={showDetailsModal} 
        onClose={() => setShowDetailsModal(false)} 
        shipment={selectedShipment} 
        source={selectedShipmentSource}
      />
      
      <TrackingModal 
        isOpen={showTrackingModal} 
        onClose={() => setShowTrackingModal(false)} 
        trackingNumber={trackingNumber} 
      />

      <ReturnRequestModal
        isOpen={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        shipment={selectedShipment}
        onSuccess={fetchMyShipments}
      />

      <ReturnStatusModal
        isOpen={showReturnStatusModal}
        onClose={() => setShowReturnStatusModal(false)}
        shipment={selectedShipment}
        onSuccess={fetchMyShipments} 
      />
    </div>
  );
}
