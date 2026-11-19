import { useEffect, useState } from 'react'

const rotaHerois = '/api/heroes'
const classeCampo =
  'mt-1.5 w-full rounded-lg border border-slate-400 px-3 py-2.5 focus:border-indigo-700 focus:outline-2 focus:outline-indigo-700'

export default function App() {
  const [herois, setHerois] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroLista, setErroLista] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erroCadastro, setErroCadastro] = useState('')
  const [confirmacao, setConfirmacao] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function carregarHerois() {
      try {
        const resposta = await fetch(rotaHerois, { signal: controller.signal })
        if (!resposta.ok) throw new Error('Erro na resposta da API')

        const dados = await resposta.json()
        setHerois(dados)
      } catch {
        if (!controller.signal.aborted) {
          setErroLista('Não foi possível carregar os heróis. Confira se a API está rodando e recarregue a página.')
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }

    carregarHerois()
    return () => controller.abort()
  }, [])

  async function cadastrarHeroi(evento) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    const campos = new FormData(formulario)
    const heroi = {
      name: campos.get('name').trim(),
      universe: campos.get('universe').trim(),
      power: campos.get('power').trim(),
    }

    setErroCadastro('')
    setConfirmacao('')

    if (!heroi.name || !heroi.universe || !heroi.power) {
      setErroCadastro('Preencha nome, universo e poder.')
      return
    }

    setSalvando(true)

    try {
      const resposta = await fetch(rotaHerois, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(heroi),
      })

      if (!resposta.ok) throw new Error('Erro na resposta da API')

      const novoHeroi = await resposta.json()
      setHerois((listaAtual) => [...listaAtual, novoHeroi])
      formulario.reset()
      setConfirmacao(`${novoHeroi.name} cadastrado com sucesso.`)
    } catch {
      setErroCadastro('Não foi possível cadastrar. Confira se a API está rodando e tente novamente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b-4 border-amber-400 bg-indigo-950 text-white">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Catálogo de heróis</h1>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl items-start gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[22rem_1fr]">
        <section aria-labelledby="titulo-cadastro" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 id="titulo-cadastro" className="text-2xl font-bold">Cadastrar herói</h2>

          <form onSubmit={cadastrarHeroi} className="mt-6 space-y-4">
            <label className="block text-sm font-semibold">
              Nome
              <input name="name" className={classeCampo} required maxLength={255} />
            </label>
            <label className="block text-sm font-semibold">
              Universo
              <input name="universe" className={classeCampo} required maxLength={255} />
            </label>
            <label className="block text-sm font-semibold">
              Poder
              <input name="power" className={classeCampo} required maxLength={255} />
            </label>

            <button
              type="submit"
              disabled={carregando || salvando}
              className="w-full rounded-lg bg-indigo-700 px-4 py-2.5 font-semibold text-white hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando ? 'Cadastrando…' : 'Cadastrar'}
            </button>
            {erroCadastro && <p role="alert" className="text-red-800">{erroCadastro}</p>}
            <p role="status" className="empty:hidden text-emerald-800">{confirmacao}</p>
          </form>
        </section>

        <section aria-labelledby="titulo-lista" className="min-w-0">
          <h2 id="titulo-lista" className="text-2xl font-bold">Heróis cadastrados</h2>
          {carregando && <p role="status" className="mt-4">Carregando heróis…</p>}
          {erroLista && <p role="alert" className="mt-4 text-red-800">{erroLista}</p>}
          {!carregando && !erroLista && herois.length === 0 && (
            <p className="mt-4 rounded-xl border border-dashed border-slate-400 p-5 text-slate-700">
              Nenhum herói cadastrado. Use o formulário para adicionar o primeiro.
            </p>
          )}

          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {herois.map((heroi) => (
              <li key={heroi.id} className="wrap-anywhere rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-bold text-indigo-950">{heroi.name}</h3>
                <p className="mt-2 text-slate-700">Universo: {heroi.universe}</p>
                <p className="mt-1 text-slate-700">Poder: {heroi.power}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
