export interface BankAccount {
  id: string;
  balance: number;
  currency: string;
  owner: AccountOwner;
}

export interface AccountOwner {
  id: string;
  firstName: string;
  lastName: string;
}

export interface WithdrawalRequest {
  accountId: string;
  amount: number;
  currency: string;
  timestamp: Date;
}

export interface WithdrawalResult {
  success: boolean;
  message?: string;
  transaction?: {
    id: string;
    amount: number;
    currency: string;
    timestamp: Date;
    remainingBalance: number;
  };
}

export type WithdrawalError = {
  code: "INSUFFICIENT_FUNDS" | "INVALID_AMOUNT" | "ACCOUNT_NOT_FOUND";
  message: string;
};
