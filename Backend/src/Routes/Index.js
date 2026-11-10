import { Router } from 'express'
import pesquisaRoutes from './PesquisaRoutes.js';
import AuthRoutes from './AuthRoutes.js'
import UsuarioRoutes from './UsuarioRoutes.js'

const router = Router()

router.use('/pesquisas', pesquisaRoutes);
router.use('/auth', AuthRoutes)
router.use('/usuarios', UsuarioRoutes)

export default router