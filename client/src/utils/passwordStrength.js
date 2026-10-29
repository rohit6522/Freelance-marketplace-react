export function assessPassword(value = "") {
  if (!value) return { score: 0, label: "None" };
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 10 && /[A-Z]/.test(value) && /[0-9]/.test(value)) score++;
  if (value.length >= 12 && /[^A-Za-z0-9]/.test(value)) score++;

  if (score === 1 || value.length < 8) return { score: 1, label: "Fair" };
  if (score === 2) return { score: 2, label: "Strong" };
  return { score: 3, label: "Enterprise Grade" };
}