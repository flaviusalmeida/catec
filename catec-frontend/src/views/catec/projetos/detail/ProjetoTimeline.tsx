'use client'

import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import TimelineConnector from '@mui/lab/TimelineConnector'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import Typography from '@mui/material/Typography'
import type { TimelineProps } from '@mui/lab/Timeline'

export type ProjetoTimelineEntry = {
  key: string
  titulo: string
  meta: string
  texto?: string | null
}

const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    }
  }
})

type Props = {
  items: ProjetoTimelineEntry[]
}

const ProjetoTimeline = ({ items }: Props) => {
  return (
    <Timeline>
      {items.map((item, index) => (
        <TimelineItem key={item.key}>
          <TimelineSeparator>
            <TimelineDot color={index === 0 ? 'primary' : 'secondary'} variant={index === 0 ? 'filled' : 'outlined'} />
            {index < items.length - 1 ? <TimelineConnector /> : null}
          </TimelineSeparator>
          <TimelineContent className='pbs-1 pbe-6'>
            <Typography className='font-medium' color='text.primary'>
              {item.titulo}
            </Typography>
            <Typography variant='caption' color='text.secondary' className='block mbe-1'>
              {item.meta}
            </Typography>
            {item.texto?.trim() ? (
              <Typography variant='body2' color='text.secondary' className='whitespace-pre-wrap'>
                {item.texto}
              </Typography>
            ) : null}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  )
}

export default ProjetoTimeline
