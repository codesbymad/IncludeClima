import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RotaPrivada({ children, apenasLider = false}){
    const { usuario, carregando } = useAuth()

    if (carregando) return <p style={{ padding: '2rem' }}>Carregando...</p>
    if (!usuario) return <Navigate to="/login" replace />
    if (apenasLider && !usuario.isLider) return <Navigate to="/home" replace />

    return children
}