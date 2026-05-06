import type { StudentBill, FeePayment, StatementEntry, StudentFeeStatement } from '@/types/billing';

export function generateStatementEntries(
  bills: StudentBill[],
  payments: FeePayment[],
  openingBalance: number = 0
): StatementEntry[] {
  const entries: StatementEntry[] = [];
  let runningBalance = openingBalance;

  if (openingBalance !== 0) {
    entries.push({
      id: 'opening',
      date: bills[0]?.created_at || new Date().toISOString(),
      description: 'Opening Balance',
      type: 'opening_balance',
      reference: '-',
      debit: openingBalance > 0 ? openingBalance : 0,
      credit: openingBalance < 0 ? Math.abs(openingBalance) : 0,
      balance: runningBalance
    });
  }

  const allTransactions = [
    ...bills.map(b => ({ type: 'bill' as const, date: b.created_at, data: b })),
    ...payments.filter(p => p.payment_status === 'success').map(p => ({ type: 'payment' as const, date: p.payment_date, data: p }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const tx of allTransactions) {
    if (tx.type === 'bill') {
      const bill = tx.data as StudentBill;
      runningBalance += bill.total_amount;
      entries.push({
        id: bill.id,
        date: bill.created_at,
        description: `${bill.term} ${bill.academic_year} - School Fees`,
        type: 'bill',
        reference: bill.bill_code,
        debit: bill.total_amount,
        credit: 0,
        balance: runningBalance
      });
    } else {
      const payment = tx.data as FeePayment;
      runningBalance -= payment.amount;
      entries.push({
        id: payment.id,
        date: payment.payment_date,
        description: `Payment - ${payment.payment_method.toUpperCase()}`,
        type: 'payment',
        reference: payment.receipt_number || payment.transaction_id || '-',
        debit: 0,
        credit: payment.amount,
        balance: runningBalance
      });
    }
  }

  return entries;
}

export function generateFeeStatement(
  studentId: string,
  studentName: string,
  className: string,
  schoolName: string,
  bills: StudentBill[],
  payments: FeePayment[],
  periodStart?: string,
  periodEnd?: string
): StudentFeeStatement {
  const filteredBills = bills.filter(b => {
    if (!periodStart && !periodEnd) return true;
    const date = new Date(b.created_at);
    if (periodStart && date < new Date(periodStart)) return false;
    if (periodEnd && date > new Date(periodEnd)) return false;
    return true;
  });

  const filteredPayments = payments.filter(p => {
    if (!periodStart && !periodEnd) return true;
    const date = new Date(p.payment_date);
    if (periodStart && date < new Date(periodStart)) return false;
    if (periodEnd && date > new Date(periodEnd)) return false;
    return true;
  });

  const entries = generateStatementEntries(filteredBills, filteredPayments, 0);
  const totalDebits = entries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credit, 0);

  return {
    student_id: studentId,
    student_name: studentName,
    class_name: className,
    school_name: schoolName,
    opening_balance: 0,
    closing_balance: totalDebits - totalCredits,
    total_debits: totalDebits,
    total_credits: totalCredits,
    entries,
    generated_at: new Date().toISOString(),
    period_start: periodStart,
    period_end: periodEnd
  };
}
