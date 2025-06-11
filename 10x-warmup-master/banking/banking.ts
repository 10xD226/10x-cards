import {
  BankAccount,
  WithdrawalRequest,
  WithdrawalResult,
  WithdrawalError,
} from "./types";

export function createAccount(account: BankAccount) {}

export function processWithdrawal(
  account: BankAccount,
  withdrawal: WithdrawalRequest
): WithdrawalResult | WithdrawalError {}
