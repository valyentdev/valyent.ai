import Project from '#models/project'
import LLMService from '#services/llm_service'
import env from '#start/env'
import { inject } from '@adonisjs/core'
import { HttpContext } from '@adonisjs/core/http'
import { streamText } from 'ai'
import { Readable } from 'node:stream'
import { Client } from 'valyent.ts'

@inject()
export default class ProjectsController {
  constructor(private llmService: LLMService) {}

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

  async chat({ auth, params, request, response }: HttpContext) {
    const project = await auth
      .user!.related('projects')
      .query()
      .where('id', params.id)
      .firstOrFail()
    const valyent = new Client(env.get('VALYENT_API_KEY'), env.get('VALYENT_ORGANIZATION'))
    const machine = await valyent.machines.get('ai', project.machineId)

    const { messages } = request.all()

    const result = streamText({
      model: await this.llmService.getModel(),
      tools: await this.llmService.getTools(machine),
      system: 'You are a full-stack AdonisJS web developer, answering to your clients needs.',
      messages,
      maxSteps: 10,
      maxRetries: 10,
    })

    const nodeStream = Readable.from(
      (async function* () {
        const reader = result.toDataStream().getReader()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            if (value) yield value
          }
        } finally {
          reader.releaseLock()
        }
      })()
    )

    response.stream(nodeStream)
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
