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
     *     summary: Cria uma nova edição de pesquisa com perguntas personalizadas (Exclusivo para Líderes)
     *     tags: [Pesquisas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - titulo
     *               - descricao
     *               - data_inicio
     *               - data_fim
     *               - perguntas
     *             properties:
     *               titulo:
     *                 type: string
     *                 example: "Pesquisa de Clima"
     *               descricao:
     *                 type: string
     *                 example: "Edição de novembro de 2026"
     *               data_inicio:
     *                 type: string
     *                 format: date
     *                 example: "2026-11-10"
     *               data_fim:
     *                 type: string
     *                 format: date
     *                 example: "2026-12-10"
     *               perguntas:
     *                 type: array
     *                 description: Perguntas que compõem a nova edição. A pergunta de diretoria é adicionada automaticamente pelo sistema.
     *                 items:
     *                   type: object
     *                   required:
     *                     - enunciado
     *                     - tipo
     *                     - eixo
     *                   properties:
     *                     enunciado:
     *                       type: string
     *                       example: "Como você avalia a comunicação entre os membros?"
     *                     tipo:
     *                       type: string
     *                       enum: [LIKERT, TEXTO]
     *                       example: "LIKERT"
     *                     eixo:
     *                       type: string
     *                       example: "Comunicação"
     *     responses:
     *       201:
     *         description: Pesquisa criada com sucesso.
     *       400:
     *         description: Dados inválidos ou perguntas com informações incorretas.
     *       401:
     *         description: Token não informado, inválido ou expirado.
     *       403:
     *         description: Acesso restrito a líderes.
     *       500:
     *         description: Erro interno ao criar pesquisa.
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
     *             required:
     *               - descricao
     *               - data_inicio
     *               - data_fim
     *             properties:
     *               descricao:
     *                 type: string
     *                 example: "Edição de dezembro de 2026"
     *               data_inicio:
     *                 type: string
     *                 format: date
     *                 example: "2026-12-11"
     *               data_fim:
     *                 type: string
     *                 format: date
     *                 example: "2027-01-10"
     *     responses:
     *       201:
     *         description: Pesquisa reaplicada com sucesso.
     *       400:
     *         description: Dados inválidos, pesquisa sem perguntas ou duplicidade de título e datas.
     *       401:
     *         description: Token não informado, inválido ou expirado.
     *       403:
     *         description: Acesso restrito a líderes.
     *       404:
     *         description: Pesquisa original não encontrada.
     *       500:
     *         description: Erro interno ao reaplicar pesquisa.
     */
    router.post('/:id/reaplicar', auth, apenasLider, PesquisaController.reaplicarPesquisa);

        /**
     * @openapi
     * /pesquisas/eixos:
     *   get:
     *     security:
     *       - bearerAuth: []
     *     summary: Lista os eixos disponíveis para perguntas personalizadas
     *     tags: [Pesquisas]
     *     responses:
     *       200:
     *         description: Lista de eixos retornada com sucesso.
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: string
     *             example:
     *               - Comunicação
     *               - Liderança
     *               - Personalizado
     *       401:
     *         description: Token não informado, inválido ou expirado.
     *       403:
     *         description: Acesso restrito a líderes.
     *       500:
     *         description: Erro ao buscar os eixos.
     */
    router.get('/eixos', auth, apenasLider, PesquisaController.listarEixos);

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
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 type: object
     *                 properties:
     *                   pesquisa_pergunta_id:
     *                     type: integer
     *                     example: 96
     *                   posicao:
     *                     type: integer
     *                     example: 1
     *                   enunciado:
     *                     type: string
     *                     example: "Qual sua área de atuação/diretoria na Include?"
     *                   tipo:
     *                     type: string
     *                     example: "DIRETORIA"
     *                   eixo:
     *                     type: string
     *                     example: "Mapeamento"
     *       401:
     *         description: Token não informado, inválido ou expirado.
     *       404:
     *         description: Pesquisa não encontrada ou sem perguntas.
     *       500:
     *         description: Erro ao buscar perguntas.
     */
    router.get('/:id_pesq/perguntas', auth, PesquisaController.listarPerguntas);

    // Rotas de relatórios

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