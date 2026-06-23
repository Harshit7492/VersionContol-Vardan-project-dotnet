import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

export function TasksPrimaryButtons() {
  const navigate = useNavigate()

  return (
    <div className='flex gap-2'>
      <Button
        className='space-x-1'
          onClick={() => navigate('/tasks/create')}
      >
        <span>Create Project</span>
        <Plus size={18} />
      </Button>
    </div>
  )
}