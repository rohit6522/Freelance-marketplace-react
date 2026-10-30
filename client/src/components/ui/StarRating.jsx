import Icon from "./Icon";

export default function StarRating({ value = 0, className = "text-body-sm", color = "text-primary" }) {
  const filled = Math.round(value);
  return (
    <span className={`inline-flex items-center ${color}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" filled={i <= filled} className={`${className} ${i <= filled ? "" : "opacity-30"}`} />
      ))}
    </span>
  );
}