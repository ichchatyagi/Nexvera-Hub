/**
 * Load Razorpay Checkout SDK dynamically.
 * Only call this on the client side.
 * See: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // If script is already loaded
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = (e) => {
      console.error('Failed to load Razorpay SDK', e);
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Open the Razorpay Checkout modal with the given options.
 * @param options - Standard Razorpay options (key, amount, order_id, notes, prefill, handler, etc.)
 */
export const openRazorpayCheckout = async (options: any) => {
  if (typeof window === 'undefined') return;

  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error('Razorpay SDK failed to load. Check your internet connection.');
  }

  const rzp = new (window as any).Razorpay(options);
  
  // Handle modal closing if needed
  if (!options.modal?.ondismiss) {
    options.modal = {
      ...options.modal,
      ondismiss: function () {
        console.log('Razorpay modal closed');
      },
    };
  }

  rzp.open();
};
