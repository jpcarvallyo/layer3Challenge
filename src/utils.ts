export function formatDate(dateString: string): string {
  const dateParts: string[] = dateString.split("-");
  const year: number = parseInt(dateParts[0], 10);
  const month: number = parseInt(dateParts[1], 10) - 1;
  const day: number = parseInt(dateParts[2], 10);

  const date: Date = new Date(year, month, day);

  const formattedDate: string = `${date.getDate()}-${
    date.getMonth() + 1
  }-${date.getFullYear()}`;

  return formattedDate;
}
