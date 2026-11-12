/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from '../services/api'

const CHAVE_TOKEN = 'includeclima_token'
const CHAVE_USUARIO = 'includeclima_user'

const AuthContext = createContext(null)

function normalizarUsuario(dados){
    return{
        id: dados.id,
        nome: dados.nome,
        email: dados.email,
        isLider: Boolean(dados.isLider ?? dados.idLider)
    }
}

function usuarioSalvo(){
    try{
        return JSON.parse(localStorage.getItem(CHAVE_USUARIO))
    } catch{
        return null
    }
}

export function AuthProvider({ children }){
    const [usuario, setUsuario] = useState(null)
    const [carregando, setCarregando] = useState(() =>
        Boolean(localStorage.getItem(CHAVE_TOKEN))
    )

    useEffect(() => {
        if (!localStorage.getItem(CHAVE_TOKEN)) return

        let cancelado = false

        api
            .get('/auth/me')
            .then(({ data }) => {
                if (cancelado) return
                const u = normalizarUsuario(data)
                localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
                setUsuario(u)
            })
            .catch((erro) => {
                if (cancelado) return
                if (erro.response?.status === 401) {
                    localStorage.removeItem(CHAVE_TOKEN)
                    localStorage.removeItem(CHAVE_USUARIO)
                    setUsuario(null)
                } else{
                    const salvo = usuarioSalvo()
                    setUsuario(salvo ? normalizarUsuario(salvo) : null)
                }
            })
            .finally(() => {
                if (!cancelado) setCarregando(false)
            })

        return () => {
            cancelado = true
        }
    }, [])

    async function entrar(email, senha) {
        const { data } = await api.post('/auth/login', { email, senha })
        const u = normalizarUsuario(data.usuario)
        localStorage.setItem(CHAVE_TOKEN, data.token)
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(u))
        setUsuario(u)
        return u
    }

    async function cadastrar(nome, email, senha) {
        const { data } = await api.post('/auth/cadastro', { nome, email, senha})
        return data
    }

    function sair(){
        localStorage.removeItem(CHAVE_TOKEN)
        localStorage.removeItem(CHAVE_USUARIO)
        setUsuario(null)
    }

    return (
        <AuthContext.Provider value={{ usuario, carregando, entrar, cadastrar, sair }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext)
}