import {Router} from 'express'
import auth from '../Middlewares/Auth.js'
import * as RespostaController from '../Controllers/RespostaController.js'

const router = Router()

/**
 * @openapi
 * /pesquisas/{id_pesq}/respostas:
 *   post:
 *     summary: Envia as respostas do formulário de forma anônima
 *     tags: [Respostas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_pesq
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 pesquisa_pergunta_id:
 *                   type: integer
 *                 valor_numerico:
 *                   type: integer
 *                 valor_texto:
 *                   type: string
 *           example:
 *             - pesquisa_pergunta_id: 1
 *               valor_texto: Marketing
 *             - pesquisa_pergunta_id: 2
 *               valor_numerico: 4
 *     responses:
 *       201:
 *         description: Respostas registradas
 *       400:
 *         description: Respostas inválidas, faltando ou pesquisa fora do período
 *       401:
 *         description: Não autenticado
 *       404:
 *         description: Pesquisa não encontrada
 *       409:
 *         description: Você já participou desta pesquisa
 */

router.post('/:id_pesq/respostas', auth, RespostaController.enviar)

export default router