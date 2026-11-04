import { useEffect, useState } from 'react'
import { api, setAuth, logado } from './api'

function Login({ onOk }) {
  const [f, setF] = useState({ username: '', senha: '' }), [reg, setReg] = useState(false), [erro, setErro] = useState('')
  const [c, setC] = useState({ nome: '', rg: '', cpf: '', endereco: '', profissao: '' })
  const [papel, setPapel] = useState('CLIENTE')
  const enviar = async e => {
    e.preventDefault(); setErro('')
    try {
      if (reg) await api('/auth/register', 'POST', { usuario: { ...f, papel }, cliente: papel === 'CLIENTE' ? { ...c, rendimentos: [] } : null })
      setAuth(f.username, f.senha); await api('/auth/me'); onOk()
    } catch (x) { setAuth(null); setErro('Falha: ' + x.message) }
  }
  const inp = (o, set, k, ph, t = 'text') => <input key={k} type={t} placeholder={ph} value={o[k]} onChange={e => set({ ...o, [k]: e.target.value })} required />
  return <form onSubmit={enviar} className="auth-card">
    <h2>{reg ? 'Cadastro' : 'Login'}</h2>
    {inp(f, setF, 'username', 'Usuário')}{inp(f, setF, 'senha', 'Senha', 'password')}
    {reg && <>
      <select value={papel} onChange={e => setPapel(e.target.value)}><option>CLIENTE</option><option>EMPRESA</option><option>BANCO</option></select>
      {papel === 'CLIENTE' && ['nome', 'rg', 'cpf', 'endereco', 'profissao'].map(k => inp(c, setC, k, k))}
    </>}
    <button>{reg ? 'Cadastrar' : 'Entrar'}</button>
    <a href="#" onClick={e => { e.preventDefault(); setReg(!reg) }}>{reg ? 'Já tenho conta' : 'Criar conta'}</a>
    {erro && <small style={{ color: 'red' }}>{erro}</small>}
  </form>
}

function Painel({ sair }) {
  const [me, setMe] = useState(null), [pedidos, setPedidos] = useState([]), [autos, setAutos] = useState([])
  const [n, setN] = useState({ automovelId: '', dataInicio: '', dataFim: '' }), [erro, setErro] = useState('')
  const agente = me && !me.papeis.includes('ROLE_CLIENTE')
  const carregar = () => Promise.all([api('/pedidos'), api('/automoveis')]).then(([p, a]) => { setPedidos(p); setAutos(a) }).catch(e => setErro(e.message))
  useEffect(() => { api('/auth/me').then(setMe); carregar() }, [])
  const acao = fn => async () => { try { setErro(''); await fn(); carregar() } catch (e) { setErro(e.message) } }
  return <div>
    <button onClick={sair}>Sair</button> {me && <b>{me.username} ({me.papeis})</b>} {erro && <small style={{ color: 'red' }}>{erro}</small>}
    {me && !agente && <form onSubmit={e => { e.preventDefault(); acao(() => api('/pedidos', 'POST', n))() }}>
      <h3>Novo pedido</h3>
      <select value={n.automovelId} onChange={e => setN({ ...n, automovelId: +e.target.value })} required>
        <option value="">Automóvel</option>{autos.map(a => <option key={a.id} value={a.id}>{a.marca} {a.modelo} - {a.placa}</option>)}</select>
      <input type="date" value={n.dataInicio} onChange={e => setN({ ...n, dataInicio: e.target.value })} required />
      <input type="date" value={n.dataFim} onChange={e => setN({ ...n, dataFim: e.target.value })} required />
      <button>Enviar</button></form>}
    <h3>Pedidos</h3>
    <table border="1" cellPadding="4"><thead><tr><th>#</th><th>Cliente</th><th>Carro</th><th>Período</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      {pedidos.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.cliente?.nome}</td><td>{p.automovel?.marca} {p.automovel?.modelo}</td>
        <td>{p.dataInicio} → {p.dataFim}</td><td>{p.status}</td><td>
          {!agente && p.status !== 'CANCELADO' && p.status !== 'CONTRATADO' && <button onClick={acao(() => api(`/pedidos/${p.id}`, 'DELETE'))}>Cancelar</button>}
          {agente && p.status === 'PENDENTE' && <>
            <button onClick={acao(() => api(`/pedidos/${p.id}/avaliar`, 'PUT', { aprovado: true, parecer: 'Parecer financeiro positivo' }))}>Aprovar</button>
            <button onClick={acao(() => api(`/pedidos/${p.id}/avaliar`, 'PUT', { aprovado: false, parecer: 'Parecer financeiro negativo' }))}>Reprovar</button></>}
          {agente && p.status === 'APROVADO' && <button onClick={acao(() => api('/contratos', 'POST', { pedidoId: p.id, propriedade: 'EMPRESA', comCredito: false }))}>Gerar contrato</button>}
        </td></tr>)}</tbody></table>
  </div>
}

export default function App() {
  const [ok, setOk] = useState(logado())
  return <div className={ok ? 'app' : 'auth-page'}>
    <h1>Aluguel de Carros</h1>
    {ok ? <Painel sair={() => { setAuth(null); setOk(false) }} /> : <Login onOk={() => setOk(true)} />}
  </div>
}
