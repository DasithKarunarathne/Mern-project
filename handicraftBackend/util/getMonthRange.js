// utils.js (or wherever you want to define this helper)
export function getMonthRange(year, month) {
  const startDate = new Date(year, month - 1, 1); // Month is 1-based, Date is 0-based
  // Fixed typo: "23.soft59" should be "23, 59"
  const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last millisecond of the month
  return { startDate, endDate };
}