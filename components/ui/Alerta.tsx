export default function Alerta({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null;
  return (
    <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{mensaje}</p>
  );
}
