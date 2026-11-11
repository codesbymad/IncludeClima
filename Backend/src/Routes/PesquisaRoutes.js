import { Router } from 'express';
import PesquisaController from '../Controllers/PesquisaController.js';
import RelatorioController from '../Controllers/RelatorioController.js';
import auth from '../Middlewares/Auth.js';
import apenasLider from '../Middlewares/ApenasLider.js';

const router = Router();

// Rotas de pesquisa

/**
 * @openapi
 * /pesquisas/historico:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Lista o histórico de pesquisas (situação e se o usuário já respondeu)
 *     tags: [Pesquisas]
 *     parameters:
 *       - in: query
 *         name: titulo
 *         schema:
 *           type: string
 *         description: Busca por nome do título
 *     responses:
 *       200:
 *         description: Lista retornada com sucesso.
 *       401:
 *         description: Token não informado, inválido ou expirado.
 */
router.get('/historico', auth, PesquisaController.listarHistorico);

/**
 * @openapi
 * /pesquisas/nova:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Cria uma nova edição da pesquisa (Exclusivo para Líderes)
 *     tags: [Pesquisas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo: 
 *                 type: string
 *                 example: "Pesquisa de Clima"
 *               descricao: 
 *                 type: string
 *                 example: "Edição Q1 2027"
 *               data_inicio: 
 *                 type: string
 *                 format: date
 *                 example: "2027-01-01"
 *               data_fim: 
 *                 type: string
 *                 format: date
 *                 example: "2027-03-31"
 *     responses:
 *       201:
 *         description: Pesquisa criada com sucesso.
 *       401:
 *         description: Token não informado, inválido ou expirado.
 *       403:
 *         description: Acesso restrito a líderes.
 */
router.post('/nova', auth, apenasLider, PesquisaController.criarPesquisa);

/**
 * @openapi
 * /pesquisas/{id}/reaplicar:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     summary: Reaplica (duplica) uma pesquisa existente para um novo período
 *     tags: [Pesquisas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pesquisa original a ser copiada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descricao: 
 *                 type: string
 *                 example: "Edição Q1 2027"
 *               data_inicio: 
 *                 type: string
 *                 format: date
 *                 example: "2027-01-01"
 *               data_fim: 
 *                 type: string
 *                 format: date
 *                 example: "2027-03-31"
 *     responses:
 *       201:
 *         description: Pesquisa reaplicada com sucesso.
 *       400:
 *         description: Já existe uma edição neste trimestre ou erro de validação.
 *       401:
 *         description: Token não informado, inválido ou expirado.
 *       403:
 *         description: Acesso restrito a líderes.
 *       404:
 *         description: Pesquisa original não encontrada.
 */
router.post('/:id/reaplicar', auth, apenasLider, PesquisaController.reaplicarPesquisa);

/**
 * @openapi
 * /pesquisas/{id_pesq}/perguntas:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: Retorna as perguntas de uma pesquisa ordenadas por posição
 *     tags: [Pesquisas]
 *     parameters:
 *       - in: path
 *         name: id_pesq
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da pesquisa
 *     responses:
 *       200:
 *         description: Lista de perguntas retornada com sucesso.
 *       401:
 *         description: Token não informado, inválido ou expirado.
 */
router.get('/:id_pesq/perguntas', auth, PesquisaController.listarPerguntas);


// Rotas de Relatorios

/**
 * @openapi
 * /pesquisas/{id_pesq}/relatorios/medias:
 *   get:
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Acesso restrito a líderes
 *       500:
 *         description: Erro ao gerar relatório de médias
 */
router.get('/:id_pesq/relatorios/medias', auth, apenasLider, RelatorioController.getMedias);

/**
 * @openapi
 * /pesquisas/{id_pesq}/relatorios/feedbacks:
 *   get:
 *     security:
 *       - bearerAuth: []
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
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Acesso restrito a líderes
 *       500:
 *         description: Erro ao buscar feedbacks qualitativos
 */
router.get('/:id_pesq/relatorios/feedbacks', auth, apenasLider, RelatorioController.getFeedbacks);

export default router;