import { useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PaymentButton = ({ caseId, amount, lawyerName, onSuccess, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (document.getElementById('razorpay-script')) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway.');
        setLoading(false);
        return;
      }

      const { data } = await api.post('/payments/create-order', { caseId, amount });
      const order = data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || order.keyId,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'JurisBridge',
        description: `Legal Consultation — Case #${caseId?.slice(-8).toUpperCase()}`,
        order_id: order.orderId,
        prefill: {
          name: order.prefill?.name || '',
          email: order.prefill?.email || '',
          contact: order.prefill?.contact || '',
        },
        theme: { color: '#1A3C6E' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled', { icon: '⚠️' });
          },
        },
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              caseId,
            });
            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              onSuccess?.(verifyRes.data.data);
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (err) {
            toast.error('Verification failed. If deducted, it will be refunded.');
          }
          setLoading(false);
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment.');
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading} className={`inline-flex items-center justify-center gap-2.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
      {loading ? (
        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div><span>Processing...</span></>
      ) : (
        <><i className="fas fa-indian-rupee-sign text-xs"></i><span>Pay ₹{amount?.toLocaleString('en-IN')}</span></>
      )}
    </button>
  );
};

export const PaymentCard = ({ payment }) => {
  const statusConfig = {
    pending: { bg: 'rgba(214,163,23,0.1)', color: '#d4a017', icon: 'fa-clock', label: 'Pending' },
    completed: { bg: 'rgba(45,138,94,0.1)', color: '#2d8a5e', icon: 'fa-check-circle', label: 'Paid' },
    failed: { bg: 'rgba(192,57,43,0.1)', color: '#c0392b', icon: 'fa-xmark-circle', label: 'Failed' },
    refunded: { bg: 'rgba(41,128,185,0.1)', color: '#2980b9', icon: 'fa-rotate-left', label: 'Refunded' },
  };
  const s = statusConfig[payment.status] || statusConfig.pending;

  return (
    <div className="rounded-xl p-5 border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,168,76,0.1)' }}>
            <i className="fas fa-indian-rupee-sign text-sm" style={{ color: '#C9A84C' }}></i>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>₹{payment.amount?.toLocaleString('en-IN')}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: s.bg, color: s.color }}>
          <i className={`fas ${s.icon} text-[7px]`}></i>{s.label}
        </span>
      </div>
      {payment.razorpayPaymentId && (
        <p className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>ID: {payment.razorpayPaymentId}</p>
      )}
    </div>
  );
};

export default PaymentButton;