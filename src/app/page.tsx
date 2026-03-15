'use client'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError('Usuário ou senha incorretos. Verifique seus dados.')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#3d0202',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '960px',
        minHeight: '560px',
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
      }}>
        {/* Left — welcome */}
        <div style={{
          flex: '1.3',
          background: 'linear-gradient(145deg, #8b0000, #4a0000)',
          color: 'white',
          padding: '56px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background SVG decorations */}
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.15, pointerEvents:'none' }}
            viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice">
            <circle cx="400" cy="100" r="200" fill="white" />
            <circle cx="50" cy="450" r="150" fill="white" />
          </svg>

          <div style={{ marginBottom: '36px', position: 'relative' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'8px' }}>
              <div style={{
                width:'44px', height:'44px', background:'white', color:'#8b0000',
                borderRadius:'50% 50% 50% 8px', display:'flex', alignItems:'center',
                justifyContent:'center', fontSize:'1.4rem',
              }}>⏱</div>
              <span style={{ fontSize:'1.4rem', fontWeight:700, letterSpacing:'0.5px' }}>Sistema HH</span>
            </div>
            <p style={{ fontSize:'0.78rem', opacity:0.65, fontStyle:'italic' }}>
              Controle de Ponto e Horas
            </p>
          </div>

          <div style={{ position:'relative' }}>
            <h1 style={{ fontSize:'2.2rem', fontWeight:800, lineHeight:1.2, marginBottom:'14px' }}>
              Bem-vindo<br />de volta!
            </h1>
            <p style={{ fontSize:'0.95rem', lineHeight:1.6, opacity:0.82, maxWidth:'320px' }}>
              Acesse o sistema para registrar suas atividades e controlar seu tempo de trabalho com facilidade.
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div style={{
          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
          padding:'48px 40px',
        }}>
          <div style={{ width:'100%', maxWidth:'340px' }}>
            <h2 style={{ fontSize:'1.8rem', fontWeight:800, color:'#1a1a2e', marginBottom:'28px' }}>
              Entrar
            </h2>

            {error && (
              <div style={{
                background:'#fef2f2', border:'1px solid #fecaca', color:'#991b1b',
                padding:'12px 14px', borderRadius:'8px', fontSize:'0.875rem',
                marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px',
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ position:'relative', marginBottom:'14px' }}>
                <span style={{
                  position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)',
                  color:'#9ca3af', fontSize:'1rem',
                }}>✉️</span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width:'100%', padding:'13px 16px 13px 46px',
                    border:'1.5px solid #e5e7eb', borderRadius:'30px',
                    fontSize:'0.95rem', outline:'none', fontFamily:'inherit',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b0000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div style={{ position:'relative', marginBottom:'24px' }}>
                <span style={{
                  position:'absolute', left:'16px', top:'50%', transform:'translateY(-50%)',
                  color:'#9ca3af', fontSize:'1rem',
                }}>🔒</span>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width:'100%', padding:'13px 16px 13px 46px',
                    border:'1.5px solid #e5e7eb', borderRadius:'30px',
                    fontSize:'0.95rem', outline:'none', fontFamily:'inherit',
                    transition:'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b0000'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width:'100%', padding:'14px',
                  background: loading ? '#9ca3af' : '#cc1414',
                  color:'white', border:'none', borderRadius:'30px',
                  fontSize:'1rem', fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily:'inherit', transition:'all 0.2s',
                  boxShadow: loading ? 'none' : '0 4px 16px rgba(204,20,20,0.35)',
                }}
              >
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
        @media (max-width: 700px) {
          .login-container { flex-direction: column !important; }
          .login-welcome { display: none !important; }
        }
      `}</style>
    </div>
  )
}
