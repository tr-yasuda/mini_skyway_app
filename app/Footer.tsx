import {
  createStyles,
  Container,
  Group,
  ActionIcon,
  Text,
  rem
} from '@mantine/core'
import { BrandFacebook, BrandGithub, BrandLinkedin } from 'tabler-icons-react'
import Link from 'next/link'

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: rem(240),
    borderTop: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2]
    }`
  },

  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan('xs')]: {
      flexDirection: 'column'
    }
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      marginTop: theme.spacing.md
    }
  }
}))

export function Footer() {
  const { classes } = useStyles()

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <Text>Trevor Lee</Text>
        <Group spacing={0} className={classes.links} position="right" noWrap>
          <Link href={'https://github.com/tr-yasuda'}>
            <ActionIcon size="lg">
              <BrandGithub size="1.05rem" />
            </ActionIcon>
          </Link>
          <Link href={'https://www.facebook.com/yoshitada.yasuda.1997'}>
            <ActionIcon size="lg">
              <BrandFacebook size="1.05rem" />
            </ActionIcon>
          </Link>
          <Link href={'https://www.linkedin.com/in/13931023b'}>
            <ActionIcon size="lg">
              <BrandLinkedin size="1.05rem" />
            </ActionIcon>
          </Link>
        </Group>
      </Container>
    </div>
  )
}
