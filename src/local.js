export function save (key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {}
}

export function load (key) {
  try {
    const state = localStorage.getItem(key)
    return state ? JSON.parse(state) : null
  } catch (e) {
    return null
  }
}
