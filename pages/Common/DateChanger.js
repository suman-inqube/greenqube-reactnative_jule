export const formatDateToMMDDYYYY = inputDate => {
  const date = new Date(inputDate);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}-${day}-${year}`;
};

export const formatDateToDateName = inputDate => {
  const date = new Date(inputDate);

  // Options for formatting the date
  const options = {year: 'numeric', month: 'short', day: '2-digit'};

  // Format the date as "MMM DD YYYY"
  const formattedDate = date.toLocaleDateString('en-US', options);

  // Remove the comma and return the formatted date
  return formattedDate.replace(',', ',');
};
