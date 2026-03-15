/**
 * Cliente para Microsoft Graph API (SharePoint Lists)
 * Usa Client Credentials Flow (app-only) via MSAL
 */

import { ConfidentialClientApplication } from '@azure/msal-node'
import type { Usuario, Categoria, Atividade, Lancamento, LancamentoCreate } from './types'

// ────────────────────────────────────────────
// Mock Mode Fallback (para testes sem .env.local configurado)
// ────────────────────────────────────────────
const isMockMode = !process.env.AZURE_AD_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID.trim() === ''

// Dados iniciais mock
const mockDB = {
  usuarios: [
    {
      id: 'mock-admin-id',
      nome: 'Admin Mock',
      email: 'admin@teste.com',
      senhaHash: '$2a$10$GB1XvGTsZgF2kkzu2PFysusChwv1deVoFlq8R26FNIjpcBTifyVr.', // admin123
      tipoUsuario: 'Admin',
      ativo: true,
    },
    {
      id: 'mock-user-id',
      nome: 'Usuário Padrão',
      email: 'user@teste.com',
      senhaHash: '$2a$10$GB1XvGTsZgF2kkzu2PFysusChwv1deVoFlq8R26FNIjpcBTifyVr.', // admin123
      tipoUsuario: 'Usuário',
      ativo: true,
    }
  ],
  categorias: [
    { id: 'cat-1', nome: 'Desenvolvimento' },
    { id: 'cat-2', nome: 'Reunião' }
  ],
  atividades: [
    { id: 'ativ-1', nome: 'Codificação', categoriaId: 'cat-1', categoriaNome: 'Desenvolvimento' },
    { id: 'ativ-2', nome: 'Daily', categoriaId: 'cat-2', categoriaNome: 'Reunião' }
  ],
  lancamentos: [
    {
      id: 'lanc-1',
      usuarioId: 'mock-admin-id',
      usuarioNome: 'Admin Mock',
      data: new Date().toISOString().split('T')[0],
      horaInicio: '09:00',
      horaFim: '12:00',
      atividadeId: 'ativ-1',
      atividadeNome: 'Codificação',
      categoriaNome: 'Desenvolvimento',
      observacao: 'Trabalhando no mock',
      duracaoHoras: 3,
    }
  ]
}

// ────────────────────────────────────────────
// MSAL Config
// ────────────────────────────────────────────

function getMsalApp() {
  if (isMockMode) throw new Error('Mock mode')
  return new ConfidentialClientApplication({
    auth: {
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      authority: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}`,
    },
  })
}

async function getAccessToken(): Promise<string> {
  const msalApp = getMsalApp()
  const result = await msalApp.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  })
  if (!result?.accessToken) throw new Error('Falha ao obter token de acesso ao Microsoft Graph')
  return result.accessToken
}

// ────────────────────────────────────────────
// Base Graph client (fetch wrapper)
// ────────────────────────────────────────────

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0'

async function graphRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAccessToken()
  const siteId = process.env.SHAREPOINT_SITE_ID!
  const url = `${GRAPH_BASE}/sites/${siteId}${path}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Graph API error ${res.status}: ${errBody}`)
  }

  if (res.status === 204) return {} as T
  return res.json() as Promise<T>
}

// ────────────────────────────────────────────
// Generic list helpers
// ────────────────────────────────────────────

interface GraphListResponse<T> {
  value: T[]
}

async function getListItems<T>(listName: string, filter?: string, orderby?: string): Promise<T[]> {
  let qs = `?$top=999&$expand=fields`
  if (filter) qs += `&$filter=${encodeURIComponent(filter)}`
  if (orderby) qs += `&$orderby=${encodeURIComponent(orderby)}`
  const res = await graphRequest<GraphListResponse<{ id: string; fields: Record<string, unknown> }>>(
    `/lists/${encodeURIComponent(listName)}/items${qs}`
  )
  return res.value.map((item) => ({ id: item.id, ...item.fields })) as T[]
}

async function createListItem<T>(listName: string, fields: Record<string, unknown>): Promise<T> {
  const res = await graphRequest<{ id: string; fields: Record<string, unknown> }>(
    `/lists/${encodeURIComponent(listName)}/items`,
    {
      method: 'POST',
      body: JSON.stringify({ fields }),
    }
  )
  return { id: res.id, ...res.fields } as T
}

async function updateListItem(listName: string, itemId: string, fields: Record<string, unknown>): Promise<void> {
  await graphRequest(
    `/lists/${encodeURIComponent(listName)}/items/${itemId}/fields`,
    {
      method: 'PATCH',
      body: JSON.stringify(fields),
    }
  )
}

async function deleteListItem(listName: string, itemId: string): Promise<void> {
  await graphRequest(
    `/lists/${encodeURIComponent(listName)}/items/${itemId}`,
    { method: 'DELETE' }
  )
}

// ────────────────────────────────────────────
// Usuários
// ────────────────────────────────────────────

export async function getUsuarios(): Promise<Usuario[]> {
  if (isMockMode) return [...mockDB.usuarios] as Usuario[]
  const items = await getListItems<Record<string, unknown>>('Usuarios')
  return items.map(mapUsuario)
}

export async function getUsuarioByEmail(email: string): Promise<Usuario | null> {
  if (isMockMode) {
    const u = mockDB.usuarios.find(u => u.email === email)
    return u ? { ...u } as Usuario : null
  }
  const items = await getListItems<Record<string, unknown>>(
    'Usuarios',
    `fields/Email eq '${email}'`
  )
  return items.length > 0 ? mapUsuario(items[0]) : null
}

export async function getUsuarioById(id: string): Promise<Usuario | null> {
  if (isMockMode) {
    const u = mockDB.usuarios.find(u => u.id === id)
    return u ? { ...u } as Usuario : null
  }
  const items = await getListItems<Record<string, unknown>>(
    'Usuarios',
    `id eq '${id}'`
  )
  return items.length > 0 ? mapUsuario(items[0]) : null
}

export async function createUsuario(data: any): Promise<Usuario> {
  if (isMockMode) {
    const u = { id: Math.random().toString(), ...data, ativo: true }
    mockDB.usuarios.push(u)
    return u
  }
  const item = await createListItem<Record<string, unknown>>('Usuarios', {
    Title: data.nome,
    Nome: data.nome,
    Email: data.email,
    SenhaHash: data.senhaHash,
    Gestao: data.gestao || '',
    Area: data.area || '',
    Equipe: data.equipe || '',
    Especialidade: data.especialidade || '',
    TipoUsuario: data.tipoUsuario || 'Usuário',
    Ativo: true,
  })
  return mapUsuario(item)
}

export async function updateUsuario(id: string, data: any): Promise<void> {
  if (isMockMode) {
    const idx = mockDB.usuarios.findIndex(u => u.id === id)
    if (idx !== -1) mockDB.usuarios[idx] = { ...mockDB.usuarios[idx], ...data }
    return
  }
  const fields: Record<string, unknown> = {}
  if (data.nome !== undefined) { fields.Title = data.nome; fields.Nome = data.nome }
  if (data.gestao !== undefined) fields.Gestao = data.gestao
  if (data.area !== undefined) fields.Area = data.area
  if (data.equipe !== undefined) fields.Equipe = data.equipe
  if (data.especialidade !== undefined) fields.Especialidade = data.especialidade
  if (data.tipoUsuario !== undefined) fields.TipoUsuario = data.tipoUsuario
  if (data.senhaHash !== undefined) fields.SenhaHash = data.senhaHash
  if (data.ativo !== undefined) fields.Ativo = data.ativo
  await updateListItem('Usuarios', id, fields)
}

function mapUsuario(raw: Record<string, unknown>): Usuario {
  return {
    id: raw.id as string,
    nome: (raw.Nome || raw.Title) as string,
    email: raw.Email as string,
    senhaHash: raw.SenhaHash as string,
    gestao: raw.Gestao as string | undefined,
    area: raw.Area as string | undefined,
    equipe: raw.Equipe as string | undefined,
    especialidade: raw.Especialidade as string | undefined,
    tipoUsuario: (raw.TipoUsuario as 'Admin' | 'Usuário') || 'Usuário',
    ativo: raw.Ativo !== false,
    criadoEm: raw.Created as string | undefined,
  }
}

// ────────────────────────────────────────────
// Categorias
// ────────────────────────────────────────────

export async function getCategorias(): Promise<Categoria[]> {
  if (isMockMode) return [...mockDB.categorias] as Categoria[]
  const items = await getListItems<Record<string, unknown>>('Categorias', undefined, 'fields/Title asc')
  return items.map(mapCategoria)
}

export async function createCategoria(nome: string): Promise<Categoria> {
  if (isMockMode) {
    const c = { id: Math.random().toString(), nome }
    mockDB.categorias.push(c)
    return c
  }
  const item = await createListItem<Record<string, unknown>>('Categorias', {
    Title: nome,
  })
  return mapCategoria(item)
}

export async function deleteCategoria(id: string): Promise<void> {
  if (isMockMode) {
    mockDB.categorias = mockDB.categorias.filter(c => c.id !== id)
    return
  }
  await deleteListItem('Categorias', id)
}

function mapCategoria(raw: Record<string, unknown>): Categoria {
  return {
    id: raw.id as string,
    nome: raw.Title as string,
    criadoEm: raw.Created as string | undefined,
  }
}

// ────────────────────────────────────────────
// Atividades
// ────────────────────────────────────────────

export async function getAtividades(): Promise<Atividade[]> {
  if (isMockMode) return [...mockDB.atividades] as Atividade[]
  const items = await getListItems<Record<string, unknown>>('Atividades', undefined, 'fields/Title asc')
  return items.map(mapAtividade)
}

export async function createAtividade(data: any): Promise<Atividade> {
  if (isMockMode) {
    const a = { id: Math.random().toString(), ...data }
    mockDB.atividades.push(a)
    return a
  }
  const item = await createListItem<Record<string, unknown>>('Atividades', {
    Title: data.nome,
    CategoriaId: data.categoriaId,
    CategoriaNome: data.categoriaNome,
  })
  return mapAtividade(item)
}

export async function updateAtividade(id: string, data: any): Promise<void> {
  if (isMockMode) {
    const idx = mockDB.atividades.findIndex(a => a.id === id)
    if (idx !== -1) mockDB.atividades[idx] = { ...mockDB.atividades[idx], ...data }
    return
  }
  const fields: Record<string, unknown> = {}
  if (data.nome) { fields.Title = data.nome }
  if (data.categoriaId) fields.CategoriaId = data.categoriaId
  if (data.categoriaNome) fields.CategoriaNome = data.categoriaNome
  await updateListItem('Atividades', id, fields)
}

export async function deleteAtividade(id: string): Promise<void> {
  if (isMockMode) {
    mockDB.atividades = mockDB.atividades.filter(a => a.id !== id)
    return
  }
  await deleteListItem('Atividades', id)
}

function mapAtividade(raw: Record<string, unknown>): Atividade {
  return {
    id: raw.id as string,
    nome: raw.Title as string,
    categoriaId: raw.CategoriaId as string,
    categoriaNome: raw.CategoriaNome as string,
    criadoEm: raw.Created as string | undefined,
  }
}

// ────────────────────────────────────────────
// Lançamentos
// ────────────────────────────────────────────

export interface LancamentoFilter {
  usuarioId?: string
  data?: string
  limit?: number
}

export async function getLancamentos(filter: LancamentoFilter = {}): Promise<Lancamento[]> {
  if (isMockMode) {
    let list = [...mockDB.lancamentos]
    if (filter.usuarioId) list = list.filter(l => l.usuarioId === filter.usuarioId)
    if (filter.data) list = list.filter(l => l.data === filter.data)
    list.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    if (filter.limit) list = list.slice(0, filter.limit)
    return list as Lancamento[]
  }

  const conditions: string[] = []
  if (filter.usuarioId) {
    conditions.push(`fields/UsuarioId eq '${filter.usuarioId}'`)
  }
  if (filter.data) {
    conditions.push(`fields/Data eq '${filter.data}'`)
  }
  const filterStr = conditions.length > 0 ? conditions.join(' and ') : undefined
  const items = await getListItems<Record<string, unknown>>(
    'Lancamentos',
    filterStr,
    'fields/Data desc'
  )
  const lancamentos = items.map(mapLancamento)
  if (filter.limit) return lancamentos.slice(0, filter.limit)
  return lancamentos
}

export async function getLancamentoById(id: string): Promise<Lancamento | null> {
  if (isMockMode) {
    const l = mockDB.lancamentos.find(x => x.id === id)
    return l ? { ...l } as Lancamento : null
  }
  try {
    const res = await graphRequest<{ id: string; fields: Record<string, unknown> }>(
      `/lists/Lancamentos/items/${id}?$expand=fields`
    )
    return mapLancamento({ id: res.id, ...res.fields })
  } catch {
    return null
  }
}

export async function createLancamento(
  data: LancamentoCreate,
  usuario: { id: string; nome: string },
  atividade: { id: string; nome: string; categoriaNome: string }
): Promise<Lancamento> {
  const duracao = calcDuracao(data.horaInicio, data.horaFim)
  
  if (isMockMode) {
    const l = {
      id: Math.random().toString(),
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      data: data.data,
      horaInicio: data.horaInicio,
      horaFim: data.horaFim,
      atividadeId: atividade.id,
      atividadeNome: atividade.nome,
      categoriaNome: atividade.categoriaNome,
      observacao: data.observacao || '',
      duracaoHoras: duracao,
    }
    mockDB.lancamentos.push(l)
    return l as Lancamento
  }

  const item = await createListItem<Record<string, unknown>>('Lancamentos', {
    Title: `${usuario.nome} - ${data.data}`,
    UsuarioId: usuario.id,
    UsuarioNome: usuario.nome,
    Data: data.data,
    HoraInicio: data.horaInicio,
    HoraFim: data.horaFim,
    AtividadeId: atividade.id,
    AtividadeNome: atividade.nome,
    CategoriaNome: atividade.categoriaNome,
    Observacao: data.observacao || '',
    DuracaoHoras: duracao,
  })
  return mapLancamento(item)
}

export async function updateLancamento(id: string, data: any): Promise<void> {
  if (isMockMode) {
    const idx = mockDB.lancamentos.findIndex(l => l.id === id)
    if (idx !== -1) {
      const dbL = mockDB.lancamentos[idx]
      mockDB.lancamentos[idx] = { ...dbL, ...data }
      if (data.horaInicio && data.horaFim) {
        mockDB.lancamentos[idx].duracaoHoras = calcDuracao(data.horaInicio, data.horaFim)
      } else if (data.horaInicio || data.horaFim) {
        mockDB.lancamentos[idx].duracaoHoras = calcDuracao(
          data.horaInicio || dbL.horaInicio, 
          data.horaFim || dbL.horaFim
        )
      }
    }
    return
  }

  const fields: Record<string, unknown> = {}
  if (data.horaInicio !== undefined) fields.HoraInicio = data.horaInicio
  if (data.horaFim !== undefined) fields.HoraFim = data.horaFim
  if (data.atividadeId !== undefined) fields.AtividadeId = data.atividadeId
  if (data.atividadeNome !== undefined) fields.AtividadeNome = data.atividadeNome
  if (data.categoriaNome !== undefined) fields.CategoriaNome = data.categoriaNome
  if (data.observacao !== undefined) fields.Observacao = data.observacao

  if (data.horaInicio && data.horaFim) {
    fields.DuracaoHoras = calcDuracao(data.horaInicio, data.horaFim)
  }

  await updateListItem('Lancamentos', id, fields)
}

export async function deleteLancamento(id: string): Promise<void> {
  if (isMockMode) {
    mockDB.lancamentos = mockDB.lancamentos.filter(l => l.id !== id)
    return
  }
  await deleteListItem('Lancamentos', id)
}

function mapLancamento(raw: Record<string, unknown>): Lancamento {
  return {
    id: raw.id as string,
    usuarioId: raw.UsuarioId as string,
    usuarioNome: raw.UsuarioNome as string,
    data: raw.Data as string,
    horaInicio: raw.HoraInicio as string,
    horaFim: raw.HoraFim as string,
    atividadeId: raw.AtividadeId as string,
    atividadeNome: raw.AtividadeNome as string,
    categoriaNome: raw.CategoriaNome as string,
    observacao: raw.Observacao as string | undefined,
    duracaoHoras: Number(raw.DuracaoHoras || 0),
    criadoEm: raw.Created as string | undefined,
    atualizadoEm: raw.Modified as string | undefined,
  }
}

export function calcDuracao(horaInicio: string, horaFim: string): number {
  const [ih, im] = horaInicio.split(':').map(Number)
  const [fh, fm] = horaFim.split(':').map(Number)
  const inicioMin = ih * 60 + im
  const fimMin = fh * 60 + fm
  return Math.max(0, (fimMin - inicioMin) / 60)
}
