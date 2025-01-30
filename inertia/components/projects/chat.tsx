import { useChat } from 'ai/react'
import { MessageInput } from '../ui/message-input'
import { BotIcon, UserIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import usePageProps from '@/hooks/use_page_props'
import Project from '#models/project'
import { Markdown } from './markdown'

export default function Chat() {
  const { project } = usePageProps<{ project: Project }>()
  const { messages, input, handleSubmit, handleInputChange, isLoading } = useChat({
    api: `/projects/${project.id}/chat`,
    onError: () => {
      console.log('some error occured')
    },
  })

  return (
    <div className="p-4 flex flex-col max-h-[calc(100vh-70px)] h-full justify-between">
      <div className="flex flex-col gap-2 items-center overflow-y-scroll">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            className={`flex flex-row gap-2 px-4 w-full md:px-0 ${index === 0 ? 'pt-20' : ''}`}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="h-5 flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
              {message.role === 'assistant' ? <BotIcon /> : <UserIcon />}
            </div>

            <div className="flex flex-col gap-1">
              <div className="text-zinc-800 text-sm flex flex-col gap-4">
                <Markdown>{message.content}</Markdown>
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && messages[messages.length - 1].role !== 'assistant' && (
          <div className="flex flex-row gap-2 px-4 w-full md:px-0 text-sm">
            <div className="h-5 flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
              <BotIcon />
            </div>
            <div className="flex flex-col gap-1 text-zinc-400">
              <div>hmm...</div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <MessageInput value={input} onChange={handleInputChange} isGenerating={isLoading} />
      </form>
    </div>
  )
}
