/**
 * Formatting helpers for storefront copy.
 * Centralized so price/currency rules stay consistent (UI guideline §6).
 */

const RUPIAH = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
})

export function formatRupiah(value) {
    if (value === null || value === undefined || value === '') return 'Rp 0'
    const n = typeof value === 'number' ? value : Number(value)
    if (Number.isNaN(n)) return 'Rp 0'
    return RUPIAH.format(n)
}

export function formatDate(value) {
    if (!value) return ''
    return new Date(value).toLocaleDateString('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
    })
}

export function truncate(value, max = 80) {
    if (!value) return ''
    return value.length > max ? value.slice(0, max - 1) + '…' : value
}
