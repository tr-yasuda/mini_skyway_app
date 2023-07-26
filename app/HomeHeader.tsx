'use client'

import React from 'react'
import { Container, Header, Text } from '@mantine/core'

export function HomeHeader() {
  return (
    <Header height={60} mb={160}>
      <Container className={'flex justify-between items-center h-full'}>
        <Text fz={'xl'}>Mini SkyWay App</Text>
      </Container>
    </Header>
  )
}
