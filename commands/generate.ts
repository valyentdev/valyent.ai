import Project from '#models/project'
import User from '#models/user'
import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { createAnthropic } from '@ai-sdk/anthropic'
import { Client, Machine } from 'valyent.ts'
import { z } from 'zod'
import { generateText, tool } from 'ai'

const WORKING_DIRECTORY = '/home/coder/project'
const MIGRATIONS_BASE_DIRECTORY = 'database/migrations'

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

  private async getTools(machine: Machine) {
    return {
      scaffoldController: tool({
        description: 'Scaffold a new controller for handling HTTP requests',
        parameters: z.object({
          name: z.string(),
          resource: z.boolean().optional(),
        }),
        execute: async ({ name, resource }) => {
          const params: string[] = []
          if (resource) {
            params.push('--resource')
          }
          const { stderr, stdout } = await machine.initd.exec({
            cmd: ['node', 'ace', 'make:controller', name, ...params],
            timeout_ms: 10 * 1000,
          })
          return { stderr, stdout }
        },
      }),

      scaffoldModel: tool({
        description: 'Scaffold a new Lucid model (ORM), representing a table in the database.',
        parameters: z.object({
          modelName: z.string(),
          withMigration: z.boolean(),
          withController: z.boolean(),
        }),
        execute: async ({ withMigration, withController, modelName }) => {
          const params: string[] = []
          if (withMigration) {
            params.push('--migration')
          }
          if (withController) {
            params.push('--controller')
          }
          const { stderr, stdout } = await machine.initd.exec({
            cmd: ['node', 'ace', 'make:migration', modelName, ...params],
            timeout_ms: 10 * 1000,
          })
          if (stderr) {
            return { stderr }
          }
          const migrationCompleteFilePath =
            WORKING_DIRECTORY +
            '/' +
            MIGRATIONS_BASE_DIRECTORY +
            stdout.split(MIGRATIONS_BASE_DIRECTORY)[1]
          const migrationFileContents = await machine.initd.fs.readFile(migrationCompleteFilePath)
          return { migrationFileContents }
        },
      }),

      scaffoldMigration: tool({
        description: 'Scaffold a new database migration file',
        parameters: z.object({
          name: z.string(),
        }),
        execute: async ({ name }) => {
          const { stderr, stdout } = await machine.initd.exec({
            cmd: ['node', 'ace', 'make:migration', name],
            timeout_ms: 10 * 1000,
          })
          if (stderr) {
            return { stderr }
          }
          const migrationCompleteFilePath =
            WORKING_DIRECTORY +
            '/' +
            MIGRATIONS_BASE_DIRECTORY +
            stdout.split(MIGRATIONS_BASE_DIRECTORY)[1]
          const migrationFileContents = await machine.initd.fs.readFile(migrationCompleteFilePath)
          return { migrationFileContents }
        },
      }),

      writeFile: tool({
        description:
          'Write a file to disk. PS: Give the whole content of the file, as it overrides it.',
        parameters: z.object({
          path: z.string(),
          content: z.string(),
        }),
        execute: async ({ path, content }) => {
          if (!path.startsWith('/')) {
            path = '/' + path
          }
          await machine.initd.fs.rm(WORKING_DIRECTORY + path)
          await machine.initd.fs.uploadFile(WORKING_DIRECTORY + path, content)
          return { success: true, message: 'File successfully written.' }
        },
      }),

      readFile: tool({
        description: 'Read the contents of a file from disk',
        parameters: z.object({
          path: z.string(),
        }),
        execute: async ({ path }) => {
          if (!path.startsWith('/')) {
            path = '/' + path
          }
          const content = await machine.initd.fs.readFile(WORKING_DIRECTORY + path)
          return { content }
        },
      }),

      deleteFile: tool({
        description: 'Delete a file from disk',
        parameters: z.object({
          path: z.string(),
        }),
        execute: async ({ path }) => {
          if (!path.startsWith('/')) {
            path = '/' + path
          }
          await machine.initd.fs.rm(WORKING_DIRECTORY + path)
          return { success: true, message: 'File successfully deleted.' }
        },
      }),

      listDirectory: tool({
        description:
          'List contents of a directory, showing files and directories (but not subdirectories, please call it again on subdirectories if needed).',
        parameters: z.object({
          path: z.string(),
        }),
        execute: async ({ path }) => {
          if (!path.startsWith('/')) {
            path = '/' + path
          }
          const fileEntries = await machine.initd.fs.ls(WORKING_DIRECTORY + path)
          return { fileEntries }
        },
      }),

      runMigrations: tool({
        description: 'Migrate database by running pending migrations.',
        parameters: z.object({}),
        execute: async () => {
          return await machine.exec({
            cmd: ['node', 'ace', 'migration:run'],
            timeout_ms: 10 * 1000,
          })
        },
      }),

      freshMigrations: tool({
        description: 'Drop all tables and re-migrate the database.',
        parameters: z.object({}),
        execute: async () => {
          return await machine.exec({
            cmd: ['node', 'ace', 'migration:fresh'],
            timeout_ms: 10 * 1000,
          })
        },
      }),

      executeCommand: tool({
        description:
          'Execute a command (with a timeout set to 10s) inside of the Debian microVM running the development environment.',
        parameters: z.object({
          cmd: z.array(z.string()),
        }),
        execute: async ({ cmd }) => {
          return await machine.exec({
            cmd,
            timeout_ms: 10 * 1000,
          })
        },
      }),

      listRoutes: tool({
        description: 'List existing routes in your web application',
        parameters: z.object({}),
        execute: async () => {
          return await machine.initd.exec({
            cmd: ['node', 'ace', 'list:routes', '--json'],
            timeout_ms: 10 * 1000,
          })
        },
      }),
    }
  }

  private async generate(machine: Machine) {
    const anthropic = createAnthropic({
      apiKey: env.get('ANTHROPIC_API_KEY'),
    })
    const model = anthropic('claude-3-5-sonnet-latest')
    const prompt = await this.prompt.ask('What do you want to do?')
    const finalResult = await generateText({
      model,
      prompt,
      maxSteps: 5,
      tools: await this.getTools(machine),
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
