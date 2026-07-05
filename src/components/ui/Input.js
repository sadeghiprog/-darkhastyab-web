export default function Input({
  label,
  ...props
}) {

  return (
    <div>
      {label && (
        <label className="block text-sm mb-2">
          {label}
        </label>
      )}

      <input
        {...props}
        className="w-full border rounded-xl px-4 py-3"
      />
    </div>
  );
}
