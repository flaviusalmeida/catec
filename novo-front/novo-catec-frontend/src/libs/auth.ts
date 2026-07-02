// Third-party Imports
import { getServerSession } from 'next-auth'
import CredentialProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

// Lib Imports
import { fetchCatecMe, postCatecLogin } from '@/libs/catecApiServer'
import { parseCatecLoginResponse } from '@/types/catec/authTypes'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim()
        const password = credentials?.password

        if (!email || !password) {
          return null
        }

        const res = await postCatecLogin({ email, password })
        const text = await res.text()

        let data: unknown = null

        try {
          data = text ? JSON.parse(text) : null
        } catch {
          data = null
        }

        if (!res.ok) {
          throw new Error(JSON.stringify(data ?? { mensagem: 'Não foi possível entrar.' }))
        }

        const login = parseCatecLoginResponse(data)

        if (!login.accessToken) {
          return null
        }

        const me = await fetchCatecMe(login.accessToken)

        return {
          id: String(me.id),
          name: me.nome,
          email: me.email,
          accessToken: login.accessToken,
          tokenType: login.tokenType,
          permissoes: me.permissoes,
          grupos: me.grupos,
          requerTrocaSenha: me.requerTrocaSenha,
          trocaSenhaObrigatoria: login.trocaSenhaObrigatoria === true
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  },

  pages: {
    signIn: '/pt/catec/login'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.accessToken = user.accessToken
        token.tokenType = user.tokenType
        token.permissoes = user.permissoes
        token.grupos = user.grupos
        token.requerTrocaSenha = user.requerTrocaSenha
        token.trocaSenhaObrigatoria = user.trocaSenhaObrigatoria
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.accessToken = token.accessToken as string
        session.user.permissoes = (token.permissoes as string[]) ?? []
        session.user.grupos = (token.grupos as string[]) ?? []
        session.user.requerTrocaSenha = token.requerTrocaSenha === true
        session.user.trocaSenhaObrigatoria = token.trocaSenhaObrigatoria === true
      }

      return session
    }
  }
}

export const getAuthSession = () => getServerSession(authOptions)
