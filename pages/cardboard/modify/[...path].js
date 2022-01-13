import Head from 'next/head'
import { useRouter } from 'next/router'
import fetch from 'node-fetch'
import Router from 'next/router'

import Layout, { currentUser, siteTitle } from '../../../components/layout'
import utilStyles from '../../../scss/utils.module.scss'
import { getMarkdownContent } from '../../../libs/getMarkdownContent'

export function getServerSideProps({params}) {
  const content = getMarkdownContent(params.path.join("/"))
  if (content === "Not Found") {
    return {
      notFound: true
    }
  }
  
  return {
    props: {
      content
    }
  }
}

export default function Modifier({content}) {
  const router = useRouter()
  const slug = router.query.path || []

  const submitData = e => {
    e.preventDefault()

    // encoding data as multipart/form-data
    const formData = new FormData();
    formData.append("path", e.target.path.value);
    formData.append("type", "text")
    formData.append("author", currentUser)
    formData.append("filename", e.target.path.value.match(/[a-zA-Z1-9]*\.[a-zA-Z1-9]*/gm).pop())
    formData.append("content", e.target.content.value)

    fetch('/api/upload', {
      method: 'PATCH',
      body: formData
    })

    // throw user to the selected folder
    Router.push(`/[...path]`, `/${slug.join("/")}`)
  }

  return (
    <Layout>
      <Head>
        <title>Editor - {siteTitle}</title>
      </Head>
      <div className={utilStyles.container}>    
        <section className={utilStyles.section}>
          <div className={utilStyles.header}>
            <span className={utilStyles.title}>Editing "{slug[slug.length - 1]}"</span>
            <div className={utilStyles.meta__container}>
              <div className={utilStyles.meta}>
                File location: {slug.join("/")}
              </div>
            </div>
          </div>
          
          <div className={utilStyles.editorContainer}>
            <form onSubmit={submitData}>
              <input value={slug.join("/")} name="path" hidden={true} readOnly={true} />
              <div className={utilStyles.editor}>
                <textarea name="content" defaultValue={content.content}></textarea>
                <button type="submit">Update</button>
              </div>              
            </form>
          </div>
        </section>
      </div>
    </Layout>
  )
}
