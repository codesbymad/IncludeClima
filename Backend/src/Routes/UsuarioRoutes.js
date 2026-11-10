import { Router } from "express";
import auth from '../Middlewares/Auth.js'
import apenasLider from '../Middlewares/ApenasLider.js'
import * as UsuarioController from '../Controllers/UsuarioController.js'

const router = Router()

/**
 * @openapi
 * /usuarios/lider:
 *   patch:
 *     summary: Promove (ou rebaixa) um usuário a líder (só líder)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, isLider]
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@teste.com
 *               isLider:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Usuário atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autenticado
 *       403:
 *         description: Acesso restrito a líderes
 *       404:
 *         description: Usuário não encontrado
 */

router.patch('/lider', auth, apenasLider, UsuarioController.alterarLider)

export default router