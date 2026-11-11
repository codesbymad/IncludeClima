import { Router } from "express"
import auth from "../Middlewares/Auth.js"
import { DIRETORIAS } from "../Utils/Diretorias.js"

const router = Router()

/**
 * @openapi
 * /diretorias:
 *   get:
 *     summary: Lista as diretorias disponíveis no formulário
 *     tags: [Diretorias]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de diretorias
 *       401:
 *         description: Token não informado, inválido ou expirado
 */

router.get('/', auth, (req, res) =>{
    res.json(DIRETORIAS)
})

export default router