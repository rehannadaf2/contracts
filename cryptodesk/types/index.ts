export type PaymentMethod = 'UPI' | 'Bank';

export type UserProfile = {
  uid: string;
  email: string | null;
  phoneNumber: string | null;
  role: 'admin' | 'user';
  createdAt: number;
};

export type Ad = {
  id: string;
  ownerId: string;
  ownerName: string;
  side: 'buy' | 'sell';
  price: number;
  minLimit: number;
  maxLimit: number;
  paymentMethod: PaymentMethod;
  active: boolean;
  createdAt: number;
};

export type Trade = {
  id: string;
  buyerId: string;
  sellerId: string;
  adId: string;
  amount: number;
  price: number;
  status: 'pending' | 'paid' | 'completed' | 'disputed';
  paymentMethod: PaymentMethod;
  proofUrl?: string;
  createdAt: number;
  expiresAt: number;
};

export type TradeMessage = {
  id: string;
  tradeId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: number;
};

export type Dispute = {
  id: string;
  tradeId: string;
  raisedBy: string;
  reason: string;
  createdAt: number;
};
