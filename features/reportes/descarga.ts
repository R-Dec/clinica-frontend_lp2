export function descargarArchivo(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function nombreArchivo(
  desde: string,
  hasta: string,
  extension: string,
): string {
  return `reporte-citas_${desde}_${hasta}.${extension}`;
}
