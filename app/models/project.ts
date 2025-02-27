import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { Client, Fleet, RestartPolicy } from 'valyent.ts'
import env from '#start/env'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare machineId: string

  @column()
  declare name: string

  @beforeCreate()
  static async assignMachineToProject(project: Project) {
    const valyent = new Client(env.get('VALYENT_API_KEY'), env.get('VALYENT_ORGANIZATION'))

    /**
     * Retrieve or create the fleet.
     */
    let fleet: Fleet | null = null
    try {
      fleet = await valyent.fleets.get('ai')
    } catch (error) {
      fleet = null
    }

    if (fleet === null) {
      try {
        fleet = await valyent.fleets.create({ name: 'ai' })
      } catch (error) {
        throw error
      }
    }

    const machine = await valyent.machines.create('ai', {
      region: 'gra-1',
      config: {
        image: 'valyent/ai-adonisjs-template:latest',
        guest: {
          cpu_kind: 'std',
          memory_mb: 4096,
          cpus: 4,
        },
        workload: {
          restart: { policy: RestartPolicy.Never },
          init: { user: 'root' },
          auto_destroy: true,
        },
      },
      enable_machine_gateway: true,
    })
    project.machineId = machine.id
  }

  @belongsTo(() => User, {
    foreignKey: 'userId',
  })
  declare user: BelongsTo<typeof User>

  @column()
  declare userId: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
