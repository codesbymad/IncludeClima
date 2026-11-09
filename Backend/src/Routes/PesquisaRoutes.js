import { Router } from 'express';
import PesquisaController from '../Controllers/PesquisaController.js';
import RelatorioController from '../Controllers/RelatorioController.js';

const router = Router();

// Rotas de Relatorios
router.get('/:id_pesq/relatorios/medias', RelatorioController.getMedias);
router.get('/:id_pesq/relatorios/feedbacks', RelatorioController.getFeedbacks);

export default router;