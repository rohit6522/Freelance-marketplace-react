export default function FieldError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 font-body-sm text-body-sm text-error">
      {message}
    </p>
  );
}