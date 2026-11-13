import { Router } from 'express'
import pesquisaRoutes from './PesquisaRoutes.js';
import AuthRoutes from './AuthRoutes.js'
import UsuarioRoutes from './UsuarioRoutes.js'
import RespostaRoutes from './RespostaRoutes.js'
import DiretoriaRoutes from './DiretoriaRoutes.js'
import ComparacoesRoutes from './ComparacaoRoutes.js'

const router = Router()

router.use('/pesquisas', pesquisaRoutes);
router.use('/auth', AuthRoutes)
router.use('/usuarios', UsuarioRoutes)
router.use('/pesquisas', RespostaRoutes)
router.use('/diretorias', DiretoriaRoutes)
router.use('/comparacao', ComparacoesRoutes)

export default router