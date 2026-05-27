import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import API_BASE, { apiFetch } from '../config/api';

const stripePromise = loadStripe('pk_test_your_stripe_public_key'); // Mock public key

const CheckoutForm = ({ requestId, amount, onCancel, setPaymentSuccess, setTxId }: any) => {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState('');

    useEffect(() => {
        const fetchIntent = async () => {
            try {
                const userStr = localStorage.getItem('ca_user');
                const token = userStr ? JSON.parse(userStr).token : '';
                const res = await apiFetch(`${API_BASE}/api/payments/create-intent/${requestId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setClientSecret(data.clientSecret);
                } else {
                    setError('Failed to initialize Stripe (Development mode)');
                }
            } catch (err) {
                setError('Server error initializing payment');
            }
        };
        fetchIntent();
    }, [requestId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || !clientSecret) return;

        setProcessing(true);
        const cardElement = elements.getElement(CardElement);

        if (!cardElement) return;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            }
        });

        if (result.error) {
            setError(result.error.message || 'Payment failed');
            setProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                setTxId(result.paymentIntent.id);
                setPaymentSuccess(true);
            }
        }
    };

    const handleSimulate = async () => {
        setProcessing(true);
        setError(null);
        try {
            const userStr = localStorage.getItem('ca_user');
            const token = userStr ? JSON.parse(userStr).token : '';
            const res = await apiFetch(`${API_BASE}/api/payments/complete/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setTxId(data.request.paymentId || 'simulated_tx');
                setPaymentSuccess(true);
            } else {
                const data = await res.json();
                setError(data.message || 'Simulated payment failed');
                setProcessing(false);
            }
        } catch (err) {
            setError('Connection error simulating payment');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="payment-form">
            <div className="payment-amount">
                <span>Total Amount</span>
                <strong>₹{amount}</strong>
            </div>

            <div className="card-input-wrapper">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#e5e7eb',
                            '::placeholder': { color: '#9ca3af' },
                        },
                    },
                }} />
            </div>

            {error && (
                <div className="payment-error" style={{ fontSize: '0.82rem', color: '#ff453a', margin: '0.5rem 0', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div style={{ margin: '1.25rem 0 0.75rem', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>— FOR TESTING & DEMO —</span>
                <button
                    type="button"
                    className="ca-btn ca-btn-ghost ca-btn-sm"
                    style={{ width: '100%', padding: '0.55rem', border: '1px dashed #32d74b', color: '#32d74b', background: 'rgba(50, 215, 75, 0.05)' }}
                    onClick={handleSimulate}
                    disabled={processing}
                >
                    {processing ? <Loader2 className="animate-spin" size={14} /> : '⚡ Instant Demo Payment (Simulate)'}
                </button>
            </div>

            <div className="payment-actions" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '1rem' }}>
                <button type="button" className="ca-btn ca-btn-ghost" onClick={onCancel} disabled={processing}>Cancel</button>
                <button type="submit" className="ca-btn ca-btn-primary" disabled={!stripe || processing || !clientSecret}>
                    {processing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {processing ? 'Processing...' : `Pay via Card`}
                </button>
            </div>
        </form>
    );
};

export default function PaymentModal({ isOpen, requestId, amount, onSuccess, onCancel }: any) {
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [txId, setTxId] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setPaymentSuccess(false);
            setTxId('');
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="payment-modal-overlay">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="payment-modal-content"
                        style={{ maxWidth: '420px', width: '90%' }}
                    >
                        {!paymentSuccess ? (
                            <>
                                <div className="payment-modal-header">
                                    <h3><CreditCard size={20} /> Secure Checkout</h3>
                                    <button onClick={onCancel} className="close-btn"><X size={20} /></button>
                                </div>
                                
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm 
                                        requestId={requestId} 
                                        amount={amount} 
                                        onCancel={onCancel}
                                        setPaymentSuccess={setPaymentSuccess}
                                        setTxId={setTxId}
                                    />
                                </Elements>

                                <div className="payment-footer">
                                    <ShieldCheck size={14} /> Powered by Stripe • Secure 256-bit SSL encrypted
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                    style={{ display: 'inline-flex', alignSelf: 'center', marginBottom: '1.25rem' }}
                                >
                                    <CheckCircle2 size={64} color="#32d74b" />
                                </motion.div>

                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 0.5rem' }}>
                                    Payment Successful!
                                </h2>
                                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
                                    Your payment for this service has been verified and processed.
                                </p>

                                <div style={{ background: 'var(--bg-body)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Amount Paid:</span>
                                        <strong style={{ color: 'var(--text-main)' }}>₹{amount}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Receipt ID:</span>
                                        <span style={{ color: 'var(--text-main)', fontFamily: 'monospace' }}>{txId}</span>
                                    </div>
                                </div>

                                <button 
                                    className="ca-btn ca-btn-primary" 
                                    style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
                                    onClick={onSuccess}
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
