// MVP Pricing Constants - Shared across all provider dashboards
export const PRICING_LIMITS = {
  FREE_SERVICE_LIMIT: 5,
  FREE_PRODUCT_LIMIT: 5,
  FREE_PACKAGE_LIMIT: 3, // 3 packages for free users
};

export const COMMISSION_RATES = {
  SERVICE_COMMISSION_RATE: 0.18, // 18%
  PRODUCT_COMMISSION_RATE: 0.10, // 10%
};

// Monthly Listing Fees (Individual)
export const MONTHLY_FEES = {
  SERVICE_MONTHLY_FEE: 1.99, // $1.99/month per additional service listing
  PRODUCT_MONTHLY_FEE: 1.49, // $1.49/month per additional product listing
  PACKAGE_MONTHLY_FEE: 2.49, // $2.49/month per additional package listing
};

// Yearly Listing Fees (Individual - 2 months free = ~17% off)
export const YEARLY_FEES = {
  SERVICE_YEARLY_FEE: 19.90, // $19.90/year per service ($1.66/month equivalent)
  PRODUCT_YEARLY_FEE: 14.90, // $14.90/year per product ($1.24/month equivalent)
  PACKAGE_YEARLY_FEE: 24.90, // $24.90/year per package ($2.08/month equivalent)
};

// Bundle Monthly Fees (Better Value)
export const BUNDLE_MONTHLY_FEES = {
  SERVICE_3_PACK_MONTHLY: 4.99,   // 3 services for $4.99/month ($1.66 each)
  SERVICE_5_PACK_MONTHLY: 7.99,   // 5 services for $7.99/month ($1.60 each)
  PRODUCT_3_PACK_MONTHLY: 3.99,   // 3 products for $3.99/month ($1.33 each)
  PRODUCT_5_PACK_MONTHLY: 5.99,   // 5 products for $5.99/month ($1.20 each)
  PACKAGE_3_PACK_MONTHLY: 6.99,   // 3 packages for $6.99/month ($2.33 each)
  PACKAGE_5_PACK_MONTHLY: 9.99,   // 5 packages for $9.99/month ($2.00 each)
};

// Bundle Yearly Fees (Best Value - 2 months free = ~17% off)
export const BUNDLE_YEARLY_FEES = {
  SERVICE_3_PACK_YEARLY: 49.90,   // 3 services for $49.90/year ($4.16/month equivalent)
  SERVICE_5_PACK_YEARLY: 79.90,   // 5 services for $79.90/year ($6.66/month equivalent)
  PRODUCT_3_PACK_YEARLY: 39.90,   // 3 products for $39.90/year ($3.33/month equivalent)
  PRODUCT_5_PACK_YEARLY: 59.90,   // 5 products for $59.90/year ($4.99/month equivalent)
  PACKAGE_3_PACK_YEARLY: 69.90,   // 3 packages for $69.90/year ($5.83/month equivalent)
  PACKAGE_5_PACK_YEARLY: 99.90,   // 5 packages for $99.90/year ($8.33/month equivalent)
};

// Pricing helper functions
export const getIndividualPrice = (type, billingPeriod) => {
  if (billingPeriod === 'yearly') {
    return type === 'service' ? YEARLY_FEES.SERVICE_YEARLY_FEE : 
           type === 'product' ? YEARLY_FEES.PRODUCT_YEARLY_FEE : 
           YEARLY_FEES.PACKAGE_YEARLY_FEE;
  }
  return type === 'service' ? MONTHLY_FEES.SERVICE_MONTHLY_FEE : 
         type === 'product' ? MONTHLY_FEES.PRODUCT_MONTHLY_FEE : 
         MONTHLY_FEES.PACKAGE_MONTHLY_FEE;
};

export const get3PackPrice = (type, billingPeriod) => {
  if (billingPeriod === 'yearly') {
    return type === 'service' ? BUNDLE_YEARLY_FEES.SERVICE_3_PACK_YEARLY : 
           type === 'product' ? BUNDLE_YEARLY_FEES.PRODUCT_3_PACK_YEARLY : 
           BUNDLE_YEARLY_FEES.PACKAGE_3_PACK_YEARLY;
  }
  return type === 'service' ? BUNDLE_MONTHLY_FEES.SERVICE_3_PACK_MONTHLY : 
         type === 'product' ? BUNDLE_MONTHLY_FEES.PRODUCT_3_PACK_MONTHLY : 
         BUNDLE_MONTHLY_FEES.PACKAGE_3_PACK_MONTHLY;
};

export const get5PackPrice = (type, billingPeriod) => {
  if (billingPeriod === 'yearly') {
    return type === 'service' ? BUNDLE_YEARLY_FEES.SERVICE_5_PACK_YEARLY : 
           type === 'product' ? BUNDLE_YEARLY_FEES.PRODUCT_5_PACK_YEARLY : 
           BUNDLE_YEARLY_FEES.PACKAGE_5_PACK_YEARLY;
  }
  return type === 'service' ? BUNDLE_MONTHLY_FEES.SERVICE_5_PACK_MONTHLY : 
         type === 'product' ? BUNDLE_MONTHLY_FEES.PRODUCT_5_PACK_MONTHLY : 
         BUNDLE_MONTHLY_FEES.PACKAGE_5_PACK_MONTHLY;
};

// Commission calculation functions
export const calculateServiceCommission = (price) => {
  return (parseFloat(price) * COMMISSION_RATES.SERVICE_COMMISSION_RATE).toFixed(2);
};

export const calculateProductCommission = (price) => {
  return (parseFloat(price) * COMMISSION_RATES.PRODUCT_COMMISSION_RATE).toFixed(2);
};

export const getNetEarnings = (price, isProduct = false) => {
  const commission = isProduct ? calculateProductCommission(price) : calculateServiceCommission(price);
  return (parseFloat(price) - parseFloat(commission)).toFixed(2);
};