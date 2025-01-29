import type { HttpContext } from '@adonisjs/core/http'

export default class SignUpController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/sign_up')
  }

  async handle({}: HttpContext) {}
}
