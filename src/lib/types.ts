// Tipos do sistema de gerenciamento de HH

export interface Usuario {
  id: string       // SharePoint item ID
  nome: string
  email: string
  senhaHash: string
  gestao?: string
  area?: string
  equipe?: string
  especialidade?: string
  tipoUsuario: 'Admin' | 'Usuário'
  ativo: boolean
  criadoEm?: string
}

export interface Categoria {
  id: string
  nome: string
  criadoEm?: string
}

export interface Atividade {
  id: string
  nome: string
  categoriaId: string
  categoriaNome: string
  criadoEm?: string
}

export interface Lancamento {
  id: string
  usuarioId: string
  usuarioNome: string
  data: string          // formato ISO: YYYY-MM-DD
  horaInicio: string    // formato HH:MM
  horaFim: string       // formato HH:MM
  atividadeId: string
  atividadeNome: string
  categoriaNome: string
  observacao?: string
  duracaoHoras: number
  criadoEm?: string
  atualizadoEm?: string
}

export interface LancamentoCreate {
  data: string
  horaInicio: string
  horaFim: string
  atividadeId: string
  observacao?: string
}

export interface LancamentoUpdate extends Partial<LancamentoCreate> {}

// Sessão do usuário logado (disponível no cliente)
export interface SessionUser {
  id: string
  nome: string
  email: string
  tipoUsuario: 'Admin' | 'Usuário'
}
