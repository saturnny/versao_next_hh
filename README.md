# Time Tracking System

Sistema completo de controle de ponto e atividades desenvolvido em FastAPI com interface web responsiva.

## 🚀 Funcionalidades

### Usuário Comum
- ✅ Login e autenticação segura
- ✅ Visualizar seus lançamentos
- ✅ Adicionar lançamento de atividade
- ✅ Editar lançamento
- ✅ Excluir lançamento
- ✅ Cálculo automático de duração

### Administrador
- ✅ Visualizar todos os lançamentos da equipe
- ✅ Filtros por usuário e data
- ✅ Gerenciar usuários
- ✅ Gerenciar atividades e categorias
- ✅ Dashboard com resumos

## 📋 Estrutura do Sistema

### Banco de Dados
- **Usuários**: id, nome, email, senha, gestão, área, equipe, especialidade, tipo_usuario
- **Categorias**: id, nome
- **Atividades**: id, nome, categoria_id
- **Lançamentos**: id, usuario_id, data, hora_inicio, hora_fim, atividade_id, observação

### Interface
- Design moderno e responsivo
- Menu diferenciado para admin e usuários
- Formulários intuitivos
- Tabelas organizadas com filtros

## 🛠️ Instalação e Execução

### Pré-requisitos
- Python 3.8+
- pip

### Passos

1. **Clone o repositório** (se aplicável) ou navegue até o diretório do projeto

2. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

3. **Execute o sistema:**
```bash
python run.py
```

4. **Acesse no navegador:**
```
http://localhost:8000
```

## 👤 Acesso para Teste

### Administrador
- **Email:** admin@empresa.com
- **Senha:** admin123

### Usuário Comum
- **Email:** usuario@empresa.com
- **Senha:** 123456

### Outros Usuários de Teste
- **João:** joao@empresa.com / 123456
- **Paulo:** paulo@empresa.com / 123456

## 📁 Estrutura do Projeto

```
time-tracking-system/
├── app/
│   ├── __init__.py
│   ├── main.py          # Aplicação FastAPI principal
│   ├── database.py      # Configuração do banco de dados
│   ├── models.py        # Modelos SQLAlchemy
│   ├── schemas.py       # Schemas Pydantic
│   ├── crud.py          # Operações CRUD
│   └── auth.py          # Autenticação e segurança
├── templates/
│   ├── base.html        # Template base
│   ├── login.html       # Página de login
│   ├── dashboard.html   # Dashboard
│   ├── lancamentos.html # Lista de lançamentos
│   ├── novo_lancamento.html
│   ├── editar_lancamento.html
│   └── admin/           # Templates admin
│       ├── lancamentos.html
│       ├── usuarios.html
│       ├── atividades.html
│       └── categorias.html
├── static/
│   └── css/
│       └── style.css    # Estilos CSS
├── requirements.txt     # Dependências Python
├── seed_data.py        # Dados iniciais
├── run.py              # Script de execução
└── README.md           # Este arquivo
```

## 🎯 Características Técnicas

### Backend
- **FastAPI**: Framework web moderno e rápido
- **SQLAlchemy**: ORM para banco de dados
- **SQLite**: Banco de dados leve (facilmente migrável para PostgreSQL/MySQL)
- **JWT**: Autenticação segura com tokens
- **bcrypt**: Hash de senhas seguro

### Frontend
- **HTML5** semântico
- **CSS3** com design responsivo
- **JavaScript** vanilla para interatividade
- **Jinja2** para templates dinâmicos

### Segurança
- Senhas hasheadas com bcrypt
- Autenticação JWT
- Proteção CSRF
- Validação de entrada

## 🚀 Próximos Passos (Evolução Futura)

### Planejado
- [ ] Dashboards avançados
- [ ] Gráficos e relatórios
- [ ] Exportação Excel/PDF
- [ ] Integração com Microsoft Power BI
- [ ] Integração com SharePoint
- [ ] Automações e notificações
- [ ] Aplicativo mobile

### Melhorias Técnicas
- [ ] Migração para PostgreSQL
- [ ] Cache com Redis
- [ ] Testes automatizados
- [ ] CI/CD
- [ ] Docker containerização

## 📝 Como Usar

1. **Faça login** com as credenciais fornecidas
2. **Usuários comuns** podem:
   - Visualizar dashboard com seus lançamentos
   - Adicionar novos lançamentos
   - Editar ou excluir lançamentos existentes
3. **Administradores** podem:
   - Visualizar todos os lançamentos da equipe
   - Filtrar por usuário e data
   - Gerenciar usuários, atividades e categorias

## 🤝 Contribuição

Este é um projeto MVP desenvolvido como exemplo. Sinta-se à vontade para contribuir ou adaptar conforme suas necessidades!

## 📞 Suporte

Para dúvidas ou problemas, verifique os logs do console ou abra uma issue no repositório.
