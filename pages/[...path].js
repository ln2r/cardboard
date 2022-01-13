import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import ModalObject from '../components/modal'
import { Button, Container, Row, Col } from 'react-bootstrap'

import Layout, { siteTitle } from '../components/layout'
import styles from '../scss/layout.module.scss'
import { setTitleFormat } from '../libs/setTitleFormat'
import { getContent } from '../libs/getContent'

import { Document, Page, pdfjs } from "react-pdf"
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
// import '../node_modules/react-pdf/dist/esm/Page/AnnotationLayer.css'

// Dynamic routes can be extended to catch all paths by adding three dots (...) inside the brackets. For example:
// https://nextjs.org/learn/basics/dynamic-routes/dynamic-routes-details

export async function getServerSideProps({ params }) {
  let folder = await getContent(params.path.join("/"))

  if (folder.type === "invalid") {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      folder,
    }
  }
}

function countObject(objects) {
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
      return `1 files.`
    } else {
      return `${files} files.`
    }    
  } else if (files == 0) {
    if (folders == 1) {
      return `1 folder.`
    } else {
      return `${folders} folders.`
    }
  } else {
    if (folders == 1) {
      return `1 folder, ${files} files.`
    } else if (files == 1) {
      return `${folders} folders, 1 file.`
    } else {
      return `${folders} folders, ${files} files.`
    }
  }
}

function onDocumentLoadSuccess({ numPages: nextNumPages }) {
  setNumPages(nextNumPages);
}


function displayContent(object, path) {
  
  if (object.type == "directory") {
    return <Container className={styles.directory}>
      <div className={styles.header}>
        <h1>
          <Link href={`/`}>box</Link>/
          {setTitleFormat(path).map((url, index) => {
            return <React.Fragment key={`url-${index}`}><Link href={`/[...path]`} as={`${url.link}`}>{url.name}</Link>/</React.Fragment>
          })} 
          {path[path.length - 1]}
        </h1>
      </div>
      <Container>
        <Row>
          <Col className="px-0">
            <p>Contains: {countObject(object.contents)}</p>
          </Col>
          <Col className="px-0 d-grid gap-2 d-md-flex justify-content-md-end">
            <ModalObject type="create" path={path} button="Add" />
            <ModalObject type="share" path={path} button="Share" />
            <ModalObject type="delete" path={path} button="Delete" />
          </Col>
        </Row>
      </Container>
      <section>
        <table className="table">
          <thead>
            <tr>
              <th className="header-object-name">Name</th>
              <th className="header-object-type">Type</th>
            </tr>
          </thead>
          <tbody>
          {object.contents.map(item => {
            return <tr key={`${item.name}-row`}>
              <td className="content-object-name"><Link href={`/[...path]`} as={`/${path.join("/")}/${item.name}`}>{item.name}</Link></td>
              <td className="conent-object-type">{item.type}</td>
            </tr>
          })}
          </tbody>
        </table>
      </section>
    </Container>
  } else {
    let content;

    if (object.contents[0].type.includes('video')) {
      content = <video src={`/api/static?path=${path.join("/")}`} controls track={path.join("/")}></video>
    } else if (object.contents[0].type.includes('image')) {
      content = <img src={`/api/static?path=${path.join("/")}`}/>
    } else if (object.contents[0].type.includes('markdown')){
      content = <div className={styles.text} dangerouslySetInnerHTML={{__html: object.contents[0].content}} />
    } else if (object.contents[0].type.includes('text/plain')) {
      content = <textarea className={styles.plain} value={object.contents[0].content} readOnly={true}></textarea>
    } else if (object.contents[0].type.includes('pdf')){
      const [file] = useState(`/api/static?path=${path.join("/")}`);
      const [numPages, setNumPages] = useState(null);
      const [pageNumber, setPageNumber] = useState(1);
    
      function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setPageNumber(1);
      }
    
      function changePage(offset) {
        setPageNumber(prevPageNumber => prevPageNumber + offset);
      }
    
      function previousPage() {
        changePage(-1);
      }
    
      function nextPage() {
        changePage(1);
      }

      content = <div className={styles.pdfViewer}>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <div className={styles.pdfViewer}>
          <p>
            Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
          </p>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={previousPage}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={nextPage}
          >
            Next
          </button>
        </div>
      </div>
    } else {
      content = <a className={styles.download} href={`/api/download?path=${path.join("/")}`}>Download File</a>
    }

    return <Row className={styles.object}>
      <Col sm={8} className={styles.content_container}>
        {content}
      </Col>
      <Col sm={4} className={styles.header_container}>
        <div className="px-0 d-grid gap-2 d-md-flex">
          {(object.contents[0].type.includes("text") || object.contents[0].type.includes("markdown"))?
            <>
              <Button className={styles.button} variant="primary" href={`/cardboard/modify/${path.join("/")}`}>Edit</Button>
              <Button className={styles.button} variant="primary" href={`/api/download?path=${path.join("/")}`}>Download</Button>
            </>
          :
            <Button className={styles.button} variant="primary" href={`/api/download?path=${path.join("/")}`}>Download</Button>
          }
          <ModalObject type="create" path={path} button="Add" />
          <ModalObject type="share" path={path} button="Share" />
          <ModalObject type="delete" path={path} button="Delete" />
        </div>
        <div className={styles.header}>
          <h1>
            <Link href={`/`}>box</Link>/
            {setTitleFormat(path).map((url, index) => {
              return <React.Fragment key={`url-${index}`}><Link href={`/[...path]`} as={`${url.link}`}>{url.name}</Link>/</React.Fragment>
            })} 
            {path[path.length - 1]}
          </h1>
          
          <h2>Added</h2>
          <p>{object.contents[0].added}</p>
          <h2>Type</h2>
          <p>{object.contents[0].type}</p>
          <h2>Size</h2>
          <p>{Math.round(object.contents[0].size / 1000).toFixed(2)} KB</p>
          
        </div>    
      </Col>        
    </Row>
  }
}

export default function Folder({ folder }) {
  const router = useRouter()
  const path = router.query.path || []
  
  return (
    <Layout>
      <Head>
      <title>{path[path.length - 1]} - {siteTitle}</title>
      </Head>
      {displayContent(folder, path)}
    </Layout>
  )
}
