import { z } from 'zod';
import { MAX_NUMBER_VALUE } from '../../shared/constants';

const ExpenseSchema = z.object({
    name: z.string(),
    amount: z.number().int().min(1).max(MAX_NUMBER_VALUE),
});

const CurrencySchema = z.enum([
    'USD',
    'EUR',
    'JPY',
    'GBP',
    'CAD',
    'CNY',
    'KRW',
    'SGD',
    'HKD',
    'NZD',
    'INR',
    'MXN',
    'RUB',
    'ZAR',
]);

export const AccountInfoSchema = z.object({
    currency: CurrencySchema,
    income: z.number().int().min(1).max(999999999),
    expenses: z.array(ExpenseSchema),
});

export type AccountInfo = z.infer<typeof AccountInfoSchema>;
export type Currency = z.infer<typeof CurrencySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
