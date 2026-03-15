# Guia de Configuração do SharePoint

## Visão Geral

Este sistema usa **Microsoft SharePoint Lists** como banco de dados via **Microsoft Graph API**.

## 1. Registrar App no Azure Active Directory

1. Acesse [portal.azure.com](https://portal.azure.com)
2. Vá em **Azure Active Directory → App registrations → New registration**
3. Preencha:
   - **Name**: `sistema-hh-app`
   - **Supported account types**: Accounts in this organizational directory only
   - Clique em **Register**
4. Anote o **Application (client) ID** e o **Directory (tenant) ID**
5. Vá em **Certificates & secrets → New client secret**
   - Anote o valor do secret (visível apenas uma vez!)

## 2. Configurar Permissões da API

Em **API permissions → Add a permission → Microsoft Graph → Application permissions**:

- `Sites.ReadWrite.All`
- `Lists.ReadWrite.All`

Clique em **Grant admin consent** para o tenant.

## 3. Obter o Site ID do SharePoint

Execute no PowerShell (ou use o Graph Explorer):
```
GET https://graph.microsoft.com/v1.0/sites/{tenant}.sharepoint.com:/sites/{siteName}
```

Anote o campo `id` da resposta. Formato: `empresa.sharepoint.com,abc123,def456`

## 4. Criar as Listas no SharePoint

Acesse seu site SharePoint → **Site contents → New → List**

### Lista: `Usuarios`
| Coluna | Tipo |
|--------|------|
| Title | Linha de texto (padrão) |
| Nome | Linha de texto |
| Email | Linha de texto |
| SenhaHash | Várias linhas de texto |
| Gestao | Linha de texto |
| Area | Linha de texto |
| Equipe | Linha de texto |
| Especialidade | Linha de texto |
| TipoUsuario | Linha de texto |
| Ativo | Sim/Não |

### Lista: `Categorias`
| Coluna | Tipo |
|--------|------|
| Title | Linha de texto (padrão = nome da categoria) |

### Lista: `Atividades`
| Coluna | Tipo |
|--------|------|
| Title | Linha de texto (padrão = nome da atividade) |
| CategoriaId | Linha de texto |
| CategoriaNome | Linha de texto |

### Lista: `Lancamentos`
| Coluna | Tipo |
|--------|------|
| Title | Linha de texto |
| UsuarioId | Linha de texto |
| UsuarioNome | Linha de texto |
| Data | Data e hora (apenas data) |
| HoraInicio | Linha de texto |
| HoraFim | Linha de texto |
| AtividadeId | Linha de texto |
| AtividadeNome | Linha de texto |
| CategoriaNome | Linha de texto |
| Observacao | Várias linhas de texto |
| DuracaoHoras | Número |

## 5. Criar o Primeiro Usuário Admin

Adicione manualmente um item na lista `Usuarios` com:
- **Nome**: seu nome
- **Email**: seu email
- **SenhaHash**: hash bcrypt da sua senha — gere em [bcrypt.online](https://bcrypt.online) com custo 12
- **TipoUsuario**: `Admin`
- **Ativo**: `Sim`

## 6. Configurar Variáveis de Ambiente

### Localmente (`.env.local`):
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=gere-com-openssl-rand-base64-32
AZURE_AD_CLIENT_ID=<do passo 1>
AZURE_AD_CLIENT_SECRET=<do passo 1>
AZURE_AD_TENANT_ID=<do passo 1>
SHAREPOINT_SITE_ID=<do passo 3>
SHAREPOINT_SITE_URL=https://empresa.sharepoint.com/sites/seusite
```

### No Vercel:
1. Acesse seu projeto no [vercel.com](https://vercel.com)
2. Vá em **Settings → Environment Variables**
3. Adicione todas as variáveis acima (troque `NEXTAUTH_URL` pela URL de produção)

## 7. Deploy no Vercel

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Na pasta do projeto
vercel --prod
```

Ou conecte o repositório GitHub ao Vercel para deploy automático.

## Gerar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Ou use: [generate-secret.vercel.app](https://generate-secret.vercel.app)
