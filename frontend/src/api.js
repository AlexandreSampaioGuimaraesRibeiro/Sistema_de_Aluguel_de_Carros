let auth = sessionStorage.getItem('auth')
export const setAuth = (u, s) => { auth = u ? 'Basic ' + btoa(`${u}:${s}`) : null; auth ? sessionStorage.setItem('auth', auth) : sessionStorage.removeItem('auth') }
export const logado = () => !!auth
export async function api(path, method = 'GET', body) {
  const r = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(auth && { Authorization: auth }) }, body: body && JSON.stringify(body) })
  if (!r.ok) throw new Error((await r.text()) || r.status)
  return r.status === 204 ? null : r.json()
}
