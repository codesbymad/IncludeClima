import { Router } from 'express'
import pesquisaRoutes from './PesquisaRoutes.js';

const router = Router()

router.use('/pesquisas', pesquisaRoutes);

export default router