export function dateFormat(dateValue) {
  if (!dateValue) return ''
  return new Date(dateValue).toLocaleDateString('en-CA')
}
