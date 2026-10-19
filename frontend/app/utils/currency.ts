/**
 * Global Indonesian Rupiah (IDR) currency formatter
 * Example: formatRupiah(49900) -> "Rp 49.900"
 */
export const formatRupiah = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === '') return 'Rp 0'
  const num = Number(val)
  if (isNaN(num)) return 'Rp 0'
  return `Rp ${Math.round(num).toLocaleString('id-ID')}`
}
