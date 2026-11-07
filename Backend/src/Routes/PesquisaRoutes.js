import { Router } from 'express';
import { listarPesquisas } from '../Controllers/PesquisaController.js';

const router = Router();

// Rota GET para listar todas as pesquisas
router.get('/', listarPesquisas);

export default router;