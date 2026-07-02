'use client'

import { useState } from 'react'
import type { SyntheticEvent } from 'react'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

import type { CatecProjeto } from '@/types/catec/projetoTypes'

import CustomTabList from '@core/components/mui/TabList'

import type { UseProjetoFluxoStore } from '../useProjetoFluxoStore'
import ProjetoTabContrato from './ProjetoTabContrato'
import ProjetoTabGeral from './ProjetoTabGeral'
import ProjetoTabHistorico from './ProjetoTabHistorico'
import ProjetoTabInteracoes from './ProjetoTabInteracoes'
import ProjetoTabPropostas from './ProjetoTabPropostas'

type TabId = 'geral' | 'propostas' | 'contrato' | 'interacoes' | 'historico'

type Props = {
  projeto: CatecProjeto
  fluxo: UseProjetoFluxoStore
  onStatusAlterado?: () => Promise<void>
}

const ProjetoRight = ({ projeto, fluxo, onStatusAlterado }: Props) => {
  const [activeTab, setActiveTab] = useState<TabId>('geral')

  const handleChange = (_event: SyntheticEvent, value: string) => {
    setActiveTab(value as TabId)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab icon={<i className='tabler-info-circle' />} value='geral' label='Geral' iconPosition='start' />
            <Tab
              icon={<i className='tabler-file-description' />}
              value='propostas'
              label='Propostas'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-file-certificate' />}
              value='contrato'
              label='Contrato'
              iconPosition='start'
            />
            <Tab
              icon={<i className='tabler-messages' />}
              value='interacoes'
              label='Interações'
              iconPosition='start'
            />
            <Tab icon={<i className='tabler-history' />} value='historico' label='Histórico' iconPosition='start' />
          </CustomTabList>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TabPanel value={activeTab} className='p-0'>
            {activeTab === 'geral' ? <ProjetoTabGeral projeto={projeto} /> : null}
            {activeTab === 'propostas' ? <ProjetoTabPropostas projeto={projeto} fluxo={fluxo} /> : null}
            {activeTab === 'contrato' ? <ProjetoTabContrato projeto={projeto} fluxo={fluxo} /> : null}
            {activeTab === 'interacoes' ? (
              <ProjetoTabInteracoes projeto={projeto} fluxo={fluxo} onStatusAlterado={onStatusAlterado} />
            ) : null}
            {activeTab === 'historico' ? <ProjetoTabHistorico fluxo={fluxo} /> : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default ProjetoRight
