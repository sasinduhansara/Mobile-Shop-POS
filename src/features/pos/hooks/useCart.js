import { useMemo, useState } from 'react'

export function useCart() {
  const [items, setItems] = useState([])

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.qty, 0),
    [items],
  )

  return { items, setItems, total }
}
