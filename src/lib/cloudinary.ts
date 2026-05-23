/** Оптимизированный URL с автоформатом и качеством */
export function optimizedUrl(url: string, width?: number): string {
  if (!url.includes('cloudinary.com')) return url;
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;
  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${width}`, 'c_limit');
  return `${parts[0]}/upload/${transforms.join(',')}/${parts[1]}`;
}
