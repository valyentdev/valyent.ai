import Project from '#models/project'
import User from '#models/user'
import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { Client, Machine } from 'valyent.ts'
import { generateText } from 'ai'
import LLMService from '#services/llm_service'

export default class Generate extends BaseCommand {
  static commandName = 'generate'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  private async createOrSelectUser(): Promise<User> {
    const users = await User.query()
    const userId = await this.prompt.choice('Choose a user', [
      ...users.map((user) => ({
        name: user.id.toString(),
        message: user.fullName || user.id.toString(),
      })),

      {
        name: 'create',
        message: '[+] Create new user',
      },
    ])
    if (userId === 'create') {
      const fullName = await this.prompt.ask('Enter full name')
      const email = await this.prompt.ask('Enter email')
      const password = await this.prompt.ask('Enter password')
      return User.create({
        fullName,
        email,
        password,
      })
    }

    return users.find((user) => user.id.toString() === userId)!
  }

  private async createOrSelectProject(user: User): Promise<Project> {
    const projects = await user.related('projects').query()
    const projectId = await this.prompt.choice('Choose a project', [
      ...projects.map((project) => ({
        name: project.id.toString(),
        message: `Project ID: ${project.id} (Machine: ${project.machineId})`,
      })),
      {
        name: 'create',
        message: '[+] Create new project',
      },
    ])

    if (projectId === 'create') {
      const project = new Project()
      project.userId = user.id

      await project.save()
      return project
    }

    return projects.find((project) => project.id.toString() === projectId)!
  }

  private async generate(machine: Machine) {
    const llmService = new LLMService()
    const prompt = await this.prompt.ask('What do you want to do?')
    const finalResult = await generateText({
      model: await llmService.getModel(),
      prompt,
      maxSteps: 5,
      tools: await llmService.getTools(machine),
      onStepFinish: (stepResult) => {
        console.log('[STEP FINISHED]', stepResult)
      },
    })
    console.log('[FINAL RESULT]', finalResult)
  }

  async run() {
    const user = await this.createOrSelectUser()
    const project = await this.createOrSelectProject(user)
    const valyent = new Client(env.get('VALYENT_API_KEY'), env.get('VALYENT_ORGANIZATION'))
    const machine = await valyent.machines.get('ai', project.machineId)

    await this.generate(machine)
  }
}
