import {Router} from 'express'
import auth from '../Middlewares/Auth.js'
import apenasLider from '../Middlewares/ApenasLider.js'
import * as ComparacaoController from '../Controllers/ComparacaoController.js'

const router = Router()

/**
 * @openapi
 * /comparacao/titulos:
 *   get:
 *     summary: Lista os títulos de pesquisa com suas edições (só líder)
 *     tags: [Comparação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Títulos, edições e se podem ser comparados (duas ou mais edições)
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Acesso restrito a líderes
 */

router.get('/titulos', auth, apenasLider, ComparacaoController.listarTitulos)

/**
 * @openapi
 * /comparacao:
 *   get:
 *     summary: Compara duas edições do mesmo título (só líder)
 *     tags: [Comparação]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: anterior
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id da edição anterior
 *       - in: query
 *         name: atual
 *         required: true
 *         schema:
 *           type: integer
 *         description: Id da edição atual
 *       - in: query
 *         name: area
 *         schema:
 *           type: string
 *         description: Diretoria (opcional)
 *     responses:
 *       200:
 *         description: Médias gerais, diferença, participantes e variação por pergunta
 *       400:
 *         description: Ids inválidos, edições iguais, títulos diferentes ou diretoria inválida
 *       401:
 *         description: Token não informado, inválido ou expirado
 *       403:
 *         description: Acesso restrito a líderes
 *       404:
 *         description: Pesquisa não encontrada
 */

router.get('/', auth, apenasLider, ComparacaoController.comparar)

export default router