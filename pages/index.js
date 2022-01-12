import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ModalObject from "../components/modal";
import { Container, Row, Col } from 'react-bootstrap'

import Layout, { currentUser, siteTitle } from '../components/layout'
import { getContent } from '../lib/storage'
import { getPinnedContent } from '../lib/addons'

import styles from '../scss/layout.module.scss'

export async function getStaticProps() {
  const listing = await getContent("root");
  const pinned = await getPinnedContent(listing.contents);

  return {
    props: {
      listing,
      pinned
    }
  }
}

export function countObject(objects) {
  let folders = 0;
  let files = 0;
  objects.forEach(object => {
    if (object.type.includes("folder")) {
      folders++;
    } else {
      files++;
    }
  })

  if (folders == 0) {
    if (files == 1) {
      return `1 files`
    } else {
      return `${files} files`
    }    
  } else if (files == 0) {
    if (folders == 1) {
      return `1 folder`
    } else {
      return `${folders} folders`
    }
  } else {
    if (folders == 1) {
      return `1 folder, ${files} files`
    } else if (files == 1) {
      return `${folders} folders, 1 file`
    } else {
      return `${folders} folders, ${files} files`
    }
  }
}

export default function Home({ pinned, listing }) {
  const router = useRouter()
  const slug = router.query.path || []

  return (
    <Layout home>
      <Head>
        <title>{siteTitle} - Home</title>
      </Head>
      <Container className={styles.main}>
        <div className={styles.header}>
          <h1>box/</h1>
          <Container className={styles.metadata}>
            <Row>
              <Col className="px-0">
                <p>Contains: {countObject(listing.contents)}</p>
              </Col>
              <Col className="px-0 d-grid gap-2 d-md-flex justify-content-md-end">
                <ModalObject type="create" path={slug} button="Add" />
                <ModalObject type="share" path={slug} button="Share" />
                <ModalObject type="delete" path={slug} button="Delete" />
              </Col>
            </Row>
          </Container>         
        </div>
        <section>
          <table className="table">
            <thead>
              <tr>
                <th className="header-object-name">Name</th>
                <th className="header-object-type">Type</th>
              </tr>
            </thead>
            <tbody>
              {(pinned.pinned.length == 0)? pinned.pinned.map(({name, type}) => {
                return <tr key={`${name}-pinned-row`}>
                  <td className="content-object-name"><Link href={`/[...path]`} as={`/${name}`}>{name}</Link></td>
                  <td className="content-object-type">{type}</td>
                </tr>
              }) : ""}
              {pinned.regular.map(({name, type}) => {
                return <tr key={`${name}-row`}>
                  <td className="content-object-name"><Link href={`/[...path]`} as={`/${name}`}>{name}</Link></td>
                  <td className="content-object-type">{type}</td>
                </tr>
              })}
            </tbody>
          </table>
        </section>
      </Container>
    </Layout>
  )
}
