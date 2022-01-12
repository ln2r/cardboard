import Head from 'next/head'
import Link from 'next/link'
import { Container } from 'react-bootstrap'

import Navbar from './navbar'

import styles from '../scss/layout.module.scss'

export const siteTitle = 'Cardboard'
// TODO: propper session
export const currentUser = "ln2r"

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/images/box.png" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <Navbar />
      {children}      
    </div>
  )
}
