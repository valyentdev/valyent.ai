/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
router.on('/').renderInertia('home')

const SignUpController = () => import('#controllers/auth/sign_up_controller')
router.get('/auth/sign_up', [SignUpController, 'show'])
router.post('/auth/sign_up', [SignUpController, 'handle'])

const SignInController = () => import('#controllers/auth/sign_in_controller')
router.get('/auth/sign_in', [SignInController, 'show'])
router.post('/auth/sign_in', [SignInController, 'handle'])

const SignOutController = () => import('#controllers/auth/sign_out_controller')
router.post('/auth/sign_out', [SignOutController, 'handle'])

const ProjectsController = () => import('#controllers/projects_controller')
router.resource('projects', ProjectsController).use('*', [middleware.auth()])
router
  .post('/projects/:id/chat', [ProjectsController, 'chat'])
  .use(middleware.auth())
  .as('projects.chat')

const GithubController = () => import('#controllers/auth/github_controller')
router.get('/auth/github/redirect', [GithubController, 'redirect'])
router.get('/auth/github/callback', [GithubController, 'callback'])
