export function calculateExpenseShares(expense) {
  const { amount, participants, splitType, splits } = expense;

  if (splitType === 'equal') {
    if (!participants || participants.length === 0) {
      throw new Error('An equal split requires at least one participant.');
    }

    const totalKobo = Math.round(amount * 100);
    const baseShare = Math.floor(totalKobo / participants.length);
    const remainder = totalKobo % participants.length;

    return participants.map((memberId, index) => ({
      memberId,
      amount: (baseShare + (index < remainder ? 1 : 0)) / 100,
    }));
  }

  if (splitType === 'exact') {
    return splits.map((split) => ({
      memberId: split.memberId,
      amount: split.amount,
    }));
  }

  if (splitType === 'percentage') {
    return splits.map((split) => ({
      memberId: split.memberId,
      amount: (amount * split.percentage) / 100,
    }));
  }

  throw new Error(`Unsupported split type: ${splitType}`);
}

export function calculateMemberBalances(expenses, members) {
  const balances = {};

  members.forEach((member) => {
    balances[member.id] = 0;
  });

  expenses.forEach((expense) => {
    const shares = calculateExpenseShares(expense);

    if (!(expense.paidBy in balances)) {
      throw new Error(`Unknown payer: ${expense.paidBy}`);
    }

    balances[expense.paidBy] += expense.amount;

    shares.forEach((share) => {
      if (!(share.memberId in balances)) {
        throw new Error(`Unknown participant: ${share.memberId}`);
      }

      balances[share.memberId] -= share.amount;
    });
  });

  return balances;
}
