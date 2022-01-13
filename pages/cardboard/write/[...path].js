import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Router from 'next/router'
import { Container, Form, Button } from 'react-bootstrap'
import React from 'react'

import Layout, { currentUser, siteTitle } from '../../../components/layout'
// import utilStyles from '../../../scss/utils.module.scss'
import styles from '../../../scss/layout.module.scss'
import { setTitleFormat } from '../../../libs/addons'

/**
 * TODO:
 * - add ability to remove selected object
 * - add progress bar on upload
 */

export default function Uploader() {
  const router = useRouter()
  const slug = router.query.path || []
  const path = slug.join("/").replace(/folder\/|file\/|text\//gm, "")

  const submitData = e => {
    e.preventDefault()
    const path = e.target.path.value;

    // appending / encoding data to multipart/form-data
    const formData = new FormData()

    formData.append("path", path)
    formData.append("type", "text")
    formData.append("author", currentUser)

    formData.append("filename", e.target.filename.value)
    formData.append("content", e.target.content.value)

    console.log(formData)

    fetch('/api/upload', {
      method: 'POST',
      body: formData
    })    

    // // throw user to the selected folder
    Router.push(`/${path}`)
  }

  return (
    <Layout>
      <Head>
        <title>Upload - {siteTitle}</title>
      </Head>
      <Form onSubmit={submitData}>
        <Container className={styles.editor_container}>
          <div className={styles.header}>
            <h1>
              <Link href={`/`}>box</Link>&nbsp;/&nbsp;
              {setTitleFormat(slug).map((url, index) => {
                return <React.Fragment key={`url-${index}`}><Link href={`/[...path]`} as={`${url.link}`}>{url.name}</Link>&nbsp;/&nbsp;</React.Fragment>
              })} 
              <input type="text" name="filename" />.md
            </h1>
          </div>
          <p>Writing new text file.</p>
          <section className={styles.editor}>
            <Form.Control 
              as="textarea"
              name="content"
            />
            <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
              <Button type="submit">Add</Button>
            </div>
        </section>
        </Container>        
      </Form>
      {/* <div className={styles.container}>    
        <section className={styles.section}>
          <div className={styles.header}>
            <span className={styles.title}>Writing New Text File</span>
            <div className={styles.meta__container}>
              <div className={styles.meta}>
                File location: <b>{path}</b>
              </div>
            </div>
          </div>
          
          <div className={styles.editorContainer}>
            <form onSubmit={submitData}>
              <input hidden={true} name="path" value={path} readOnly={true}/>
              <div className={styles.editor}>
                File Name: <input type="text" name="filename" />.md
                <textarea name="content"></textarea>
              </div>
              <br />
              <button type="submit">Upload</button>
            </form>
          </div>
        </section>
      </div> */}
    </Layout>
  )
}
