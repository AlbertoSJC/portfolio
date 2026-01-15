export function formatDate(dateString: string): string {
  const inputDate = new Date(dateString);
  const today = new Date();

  const isToday = inputDate.getDate() === today.getDate() && inputDate.getMonth() === today.getMonth() && inputDate.getFullYear() === today.getFullYear();

  if (isToday) {
    return 'Hoy';
  }

  const day = String(inputDate.getDate()).padStart(2, '0');
  const month = String(inputDate.getMonth() + 1).padStart(2, '0');
  const year = inputDate.getFullYear();

  return `${day}-${month}-${year}`;
}
