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
  const [car, setCar] = useState({ matricula: '', ano: '', marca: '', modelo: '', placa: '' })
  const [ct, setCt] = useState(null)
  const ehBanco = !!me?.papeis.includes('ROLE_BANCO')
  const agente = !!me && (ehBanco || me.papeis.includes('ROLE_EMPRESA'))
  const carregar = () => Promise.all([api('/pedidos'), api('/automoveis'), api('/contratos')])
  .then(([p, a, c]) => { setPedidos(p); setAutos(a); setContratos(c) }).catch(e => setErro(e.message))
  useEffect(() => { api('/auth/me').then(setMe); carregar() }, [])
  const acao = fn => async () => { try { setErro(''); await fn(); carregar() } catch (e) { setErro(e.message) } }
  const abrirContrato = id => setCt({ pedidoId: id, propriedade: 'EMPRESA', comCredito: false, valorCredito: '' })
  const [contratos, setContratos] = useState([]), [aberto, setAberto] = useState(null)
  return <div>
    <button onClick={sair}>Sair</button> {me && <b>{me.username}</b>} {erro && <small style={{ color: 'red' }}>{erro}</small>}

    {me && !agente && <form onSubmit={e => { e.preventDefault(); acao(() => api('/pedidos', 'POST', n))() }}>
      <h3>Novo pedido</h3>
      <select value={n.automovelId} onChange={e => setN({ ...n, automovelId: +e.target.value })} required>
        <option value="">Automóvel</option>{autos.map(a => <option key={a.id} value={a.id}>{a.marca} {a.modelo} - {a.placa}</option>)}</select>
      <input type="date" value={n.dataInicio} onChange={e => setN({ ...n, dataInicio: e.target.value })} required />
      <input type="date" value={n.dataFim} onChange={e => setN({ ...n, dataFim: e.target.value })} required />
      <button>Enviar</button></form>}

    {agente && <form onSubmit={e => { e.preventDefault(); acao(async () => { await api('/automoveis', 'POST', { ...car, ano: +car.ano }); setCar({ matricula: '', ano: '', marca: '', modelo: '', placa: '' }) })() }}>
      <h3>Cadastrar automóvel</h3>
      {['matricula', 'ano', 'marca', 'modelo', 'placa'].map(k =>
        <input key={k} placeholder={k} type={k === 'ano' ? 'number' : 'text'} value={car[k]} onChange={e => setCar({ ...car, [k]: e.target.value })} required />)}
      <button>Cadastrar</button></form>}

    {agente && ct && <form onSubmit={e => { e.preventDefault(); acao(async () => {
        await api('/contratos', 'POST', { pedidoId: ct.pedidoId, propriedade: ct.propriedade, comCredito: ct.comCredito, valorCredito: ct.comCredito ? +ct.valorCredito : null })
        setCt(null) })() }}>
      <h3>Contrato do pedido #{ct.pedidoId}</h3>
      <select value={ct.propriedade} onChange={e => setCt({ ...ct, propriedade: e.target.value })}>
        <option value="CLIENTE">Propriedade do cliente</option>
        <option value="EMPRESA">Propriedade da empresa</option>
        <option value="BANCO">Propriedade do banco</option></select>
      {ehBanco && <label><input type="checkbox" checked={ct.comCredito} onChange={e => setCt({ ...ct, comCredito: e.target.checked })} /> Com contrato de crédito</label>}
      {ct.comCredito && <input type="number" step="0.01" min="0" placeholder="Valor do crédito (R$)" value={ct.valorCredito} onChange={e => setCt({ ...ct, valorCredito: e.target.value })} required />}
      <button>Confirmar contrato</button> <button type="button" onClick={() => setCt(null)}>Fechar</button></form>}

    <h3>Pedidos</h3>
    <table><thead><tr><th>#</th><th>Cliente</th><th>Carro</th><th>Período</th><th>Status</th><th>Ações</th></tr></thead><tbody>
      {pedidos.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.cliente?.nome}</td><td>{p.automovel?.marca} {p.automovel?.modelo}</td>
        <td>{p.dataInicio} → {p.dataFim}</td><td>{p.status}</td><td>
          {!agente && p.status !== 'CANCELADO' && p.status !== 'CONTRATADO' && <button onClick={acao(() => api(`/pedidos/${p.id}`, 'DELETE'))}>Cancelar</button>}
          {agente && p.status === 'PENDENTE' && <>
            <button onClick={acao(() => api(`/pedidos/${p.id}/avaliar`, 'PUT', { aprovado: true, parecer: 'Parecer financeiro positivo' }))}>Aprovar</button>
            <button onClick={acao(() => api(`/pedidos/${p.id}/avaliar`, 'PUT', { aprovado: false, parecer: 'Parecer financeiro negativo' }))}>Reprovar</button></>}
          {agente && p.status === 'APROVADO' && <button onClick={() => abrirContrato(p.id)}>Gerar contrato</button>}
        </td></tr>)}</tbody></table>
    <h3>Contratos</h3>
      <table><thead><tr><th>#</th><th>Pedido</th><th>Carro</th><th>Propriedade</th><th>Ações</th></tr></thead><tbody>
        {contratos.map(c => <tr key={c.id}><td>{c.id}</td><td>#{c.pedido.id}</td>
          <td>{c.pedido.automovel?.marca} {c.pedido.automovel?.modelo}</td><td>{c.propriedade}</td>
          <td><button onClick={() => setAberto(c)}>Abrir</button></td></tr>)}</tbody></table>

      {aberto && <div className="contrato">
        <h3>Contrato nº {aberto.id}</h3>
        <p><b>Contratante:</b> {aberto.pedido.cliente?.nome} (CPF {aberto.pedido.cliente?.cpf}, RG {aberto.pedido.cliente?.rg})</p>
        <p><b>Endereço:</b> {aberto.pedido.cliente?.endereco}</p>
        <p><b>Automóvel:</b> {aberto.pedido.automovel?.marca} {aberto.pedido.automovel?.modelo} {aberto.pedido.automovel?.ano}, placa {aberto.pedido.automovel?.placa}, matrícula {aberto.pedido.automovel?.matricula}</p>
        <p><b>Período:</b> {aberto.pedido.dataInicio} a {aberto.pedido.dataFim}</p>
        <p><b>Propriedade do automóvel:</b> {aberto.propriedade}</p>
        <p><b>Agente responsável:</b> {aberto.agente ? `${aberto.agente.username} (${aberto.agente.papel})` : 'não registrado'}</p>
        {aberto.bancoCredor && <p><b>Crédito:</b> {aberto.bancoCredor.username}, {Number(aberto.valorCredito).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>}
        <button onClick={() => window.print()}>Imprimir / salvar PDF</button> <button onClick={() => setAberto(null)}>Fechar</button>
      </div>}
  </div>
}

export default function App() {
  const [ok, setOk] = useState(logado())
  return <div className={ok ? 'app' : 'auth-page'}>
    <h1>Aluguel de Carros</h1>
    {ok ? <Painel sair={() => { setAuth(null); setOk(false) }} /> : <Login onOk={() => setOk(true)} />}
  </div>
}
