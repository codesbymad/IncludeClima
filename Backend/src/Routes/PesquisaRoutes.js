import { Router } from 'express';
import PesquisaController from '../Controllers/PesquisaController.js';
import RelatorioController from '../Controllers/RelatorioController.js';

const router = Router();

// Rotas de Relatorios

/**
 * @openapi
 * /pesquisas/{id_pesq}/relatorios/medias:
 *   get:
 *     summary: Obtém as médias e métricas da pesquisa
 *     tags: [Relatórios]
 *     parameters:
 *       - in: path
 *         name: id_pesq
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pesquisa
 *       - in: query
 *         name: area
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra os resultados por diretoria
 *     responses:
 *       200:
 *         description: Relatório de médias gerado com sucesso
 *       500:
 *         description: Erro ao gerar relatório de médias
 */

router.get('/:id_pesq/relatorios/medias', RelatorioController.getMedias);

/**
 * @openapi
 * /pesquisas/{id_pesq}/relatorios/feedbacks:
 *   get:
 *     summary: Obtém os feedbacks textuais da pesquisa
 *     tags: [Relatórios]
 *     parameters:
 *       - in: path
 *         name: id_pesq
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pesquisa
 *       - in: query
 *         name: area
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra os feedbacks por diretoria
 *     responses:
 *       200:
 *         description: Feedbacks agrupados por categoria
 *       500:
 *         description: Erro ao buscar feedbacks qualitativos
 */

router.get('/:id_pesq/relatorios/feedbacks', RelatorioController.getFeedbacks);

export default router;