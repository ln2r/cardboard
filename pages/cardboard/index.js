import Head from 'next/head'
import fetch from 'node-fetch'
import ModalObject from '../../components/modal'
import { Container } from 'react-bootstrap'

import Layout, { currentUser, siteTitle } from '../../components/layout'
import utilStyles from '../../scss/utils.module.scss'
import styles from '../../scss/layout.module.scss'
// import { getApiData } from '../../libs/storage'

export async function getServerSideProps() {
  // const sync = await getApiData('/api/sync')
  let synced = []
  if (currentUser === "ln2r") {
    synced = await fetch("http://localhost:3000/api/sync", {
      method: "GET"
    })
    synced = await synced.json()
  }

  let shared = await fetch(`http://localhost:3000/api/share/list/${currentUser}`, {
    method: "GET"
  })
  shared = await shared.json()

  return {
    props: {
      synced,
      shared
    }
  }
}

function showSyncData(sync) {
  let synced = []

  if (sync.added.length != 0) {
    sync.added.map((object, index) => {
      synced.push(<li key={`synced-${index}`}>{`- Added "${object.name}"`}</li>)
    })
  }

  if (sync.removed.length != 0) {
    sync.removed.map((object, index) => {
      synced.push(<li key={`synced-${index}`}>{`- Removed "${object}"`}</li>)
    })
  }

  if (synced.length != 0) {
    return synced
  } else {
    return <li><em>No new files added or removed.</em></li>
  }
}

export default function Admin({ synced, shared }) {
  
  return (
    <Layout>
      <Head>
        <title>My Cardboard - {siteTitle}</title>
      </Head>
      <Container className="directory">
        <div className={styles.header}>
          <h1>
            Shared Files
          </h1>
        </div>
        <section>
          <table className="table">
            <thead>
              <tr>
                <th className="header-object-name">Id</th>
                <th className="header-object-name">Path</th>
                <th className="header-object-name">Permission</th>
              </tr>
            </thead>
            <tbody>
            {shared.objects.map(item => {
              return <tr key={`${item.name}-row`}>
                <td className="content-object-name">{item.ShareId}</td>
                <td className="content-object-name">{item.Object}</td>
                <td className="content-object-name">{(item.Permission == 0)? "Edit" : "View Only"}</td>
                <td className="content-object-name"><ModalObject type="permission" path={item} button="🛠" /></td>
              </tr>
            })}
            </tbody>
          </table>
        </section>
        {(synced.length == 0)? 
            "" 
          : 
          <section className={`${utilStyles.section} ${utilStyles.sync}`}>
            <p className={`${utilStyles.meta} ${utilStyles.borderBottom}`}>File Synced</p>
            <ul className={utilStyles.list}>
              {showSyncData(synced)}
            </ul>
          </section> 
        }
      </Container>
    </Layout>
  )
}
