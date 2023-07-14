'use client'

import React from 'react'
import { Burger, Container, Header, Menu, Text } from '@mantine/core'
import Link from 'next/link'

export function HomeHeader() {
  const [menuOpened, setMenuOpened] = React.useState(false)

  return (
    <Header height={60} mb={160}>
      <Container className={'flex justify-between items-center h-full'}>
        <Link href={'/'}>
          <Text fz={'xl'}>Mini Skyway App</Text>
        </Link>

        <Menu
          transitionProps={{ transition: 'pop-top-right' }}
          position={'top-end'}
          width={220}
          withinPortal
          onClose={() => setMenuOpened(false)}
          onOpen={() => setMenuOpened(true)}
        >
          <Menu.Target>
            <Burger opened={menuOpened} size="sm" />
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item>
              <Text>test1</Text>
            </Menu.Item>
            <Menu.Item>
              <Text>test2</Text>
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Container>
    </Header>
  )
}
