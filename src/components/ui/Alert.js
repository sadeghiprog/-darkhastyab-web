export default function Alert({ message }) {

  if (!message) return null;

  return (
    <div className="mt-4 bg-gray-100 p-3 rounded-lg text-sm">
      {message}
    </div>
  );
}
