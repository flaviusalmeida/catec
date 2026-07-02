'use client'

// Next Imports
import Link from 'next/link'
import { useMemo } from 'react'

// Third-party Imports
import classnames from 'classnames'

// Data Imports
import searchData from '@/data/searchData'

// Hook Imports
import { useCatecPermission } from '@/hooks/useCatecPermission'

// Util Imports
import { hasPermission } from '@/utils/catec/hasPermission'

const DefaultSuggestions = ({ setOpen }: { setOpen: (value: boolean) => void }) => {
  const { permissoes } = useCatecPermission()

  const sections = useMemo(() => {
    const visible = searchData.filter(
      item => !item.permission || hasPermission(permissoes, item.permission)
    )

    const grouped = visible.reduce<Record<string, typeof visible>>((acc, item) => {
      if (!acc[item.section]) {
        acc[item.section] = []
      }

      acc[item.section].push(item)

      return acc
    }, {})

    return Object.entries(grouped).map(([sectionLabel, items]) => ({
      sectionLabel,
      items: items.map(item => ({
        label: item.name,
        href: item.url,
        icon: item.icon
      }))
    }))
  }, [permissoes])

  if (sections.length === 0) {
    return null
  }

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {sections.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase text-textDisabled tracking-[0.8px]'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={item.href}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl shrink-0')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
