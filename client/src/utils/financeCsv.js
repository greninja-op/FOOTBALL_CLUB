const escapeCsvCell = (value) => {
  const cell = value === null || value === undefined ? '' : String(value);
  return `"${cell.replace(/"/g, '""')}"`;
};

export const transactionsToCsv = (transactions = []) => {
  const header = ['Date', 'Type', 'Category', 'Description', 'Amount'];

  const rows = transactions.map((transaction) => {
    const date = transaction?.date
      ? new Date(transaction.date).toISOString().slice(0, 10)
      : '';

    return [
      date,
      transaction?.type || '',
      transaction?.category || '',
      transaction?.description || '',
      Number(transaction?.amount || 0)
    ];
  });

  return [header, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\n');
};

export const downloadCsv = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
