export default function Button({
  children,
  loading,
  ...props
}) {

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300"
    >
      {loading ? "در حال پردازش..." : children}
    </button>
  );
}
