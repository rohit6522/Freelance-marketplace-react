export default function ErrorBox({ message, onRetry }) {
  return (
    <div role="alert" className="bg-error-container border border-error p-space-lg text-on-error-container">
      <p className="font-body-md mb-space-sm">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="px-space-md py-2 border border-error font-label-sm text-label-sm uppercase font-bold hover:bg-error hover:text-on-error">
          Try again
        </button>
      )}
    </div>
  );
}