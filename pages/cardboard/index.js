import Head from 'next/head'
import Link from 'next/link'
import fetch from 'node-fetch'
import ModalObject from '../../components/modal'

import Layout, { currentUser, siteTitle } from '../../components/layout'
import utilStyles from '../../scss/utils.module.scss'
// import { getApiData } from '../../lib/storage'

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
      <div className={utilStyles.container}>   
        <section className={utilStyles.section}>
          <p className={`${utilStyles.meta} ${utilStyles.borderBottom}`}>Shared Files</p>
          <table className={utilStyles.table}>
            <thead>
              <tr>
                <th>Id</th>
                <th>Object Path</th>
                <th>Permission</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
            {/* TODO: use modal window for remove and edit shared file */}
            {shared.objects.map(item => {
              return <tr key={`${item.ShareId}-row`}>
                <td>{item.ShareId}</td>
                <td>{item.Object}</td>
                <td>{(item.Permission == 0)? "Edit" : "View Only"}</td>
                <td><ModalObject type="permission" path={item} button="🛠" /></td>
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
      </div>
    </Layout>
  )
}
