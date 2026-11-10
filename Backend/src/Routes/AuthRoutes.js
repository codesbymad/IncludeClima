import { Router } from "express";
import auth from '../Middlewares/Auth.js'
import * as AuthController from '../Controllers/AuthController.js'

const router = Router()

/**
 * @openapi
 * /auth/cadastro:
 *   post:
 *     summary: Cria uma conta de usuário comum
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, email, senha]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Teste
 *               email:
 *                 type: string
 *                 example: maria@teste.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Conta criada
 *       400:
 *         description: Dados inválidos ou faltando
 *       409:
 *         description: E-mail já cadastrado
 */

router.post('/cadastro', AuthController.cadastro)

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Faz login e devolve o token de acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha]
 *             properties:
 *               email:
 *                 type: string
 *                 example: maria@teste.com
 *               senha:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Token e dados do usuário
 *       400:
 *         description: E-mail ou senha não informados
 *       401:
 *         description: E-mail ou senha inválidos
 */

router.post('/login', AuthController.login)

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Devolve os dados do usuário logado
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário
 *       401:
 *         description: Token ausente, inválido ou expirado
 */

router.get('/me', auth, AuthController.me)

export default router