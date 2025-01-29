import Project from '#models/project'
import { HttpContext } from '@adonisjs/core/http'

export default class ProjectsController {
  async index({ auth, inertia }: HttpContext) {
    const projects = await auth.user!.related('projects').query()
    return inertia.render('projects/index', { projects })
  }

  async show({ auth, inertia, params, response }: HttpContext) {
    const projects = await auth.user!.related('projects').query()
    const project = projects.find((p) => p.id.toString() === params.id)
    if (project === undefined) {
      return response.notFound('Project not found')
    }

    return inertia.render('projects/show', { projects, project })
  }

  async store({ auth, request, response }: HttpContext) {
    const project = new Project()
    project.userId = auth.user!.id
    project.name = request.input('name')
    await project.save()

    return response.redirect().toRoute('projects.show', { id: project.id })
  }

  async destroy({ auth, response, params }: HttpContext) {
    const project = await auth
      .user!.related('projects')
      .query()
      .where('id', params.id)
      .firstOrFail()
    await project.delete()

    return response.redirect().toRoute('projects.index')
  }
}
