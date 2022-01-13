import Head from 'next/head'
import Link from 'next/link'
import React, { useState } from 'react'

import Layout, { currentUser, siteTitle } from '../../components/layout'
import utilStyles from '../../scss/utils.module.scss'

import { Document, Page, pdfjs } from "react-pdf"
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import { getObjectCount } from '../../libs/addons'
import { getSharedContent } from '../../libs/getSharedContent'

export async function getServerSideProps({ params }) {
  const api = await getSharedContent(params.shareid, currentUser);
  
  if (api.res === "Not Found") {
    return {
      notFound: true
    }
  }

  const response = {
    owner: api.owner,
    permission: api.permission,
    object: api.object.res
  };

  return {
    props: {
      response
    }
  }
}

export function onDocumentLoadSuccess({ numPages: nextNumPages }) {
  setNumPages(nextNumPages);
}

export function displayContent(object) {
  if (object.type == "directory") {
    return <div className={utilStyles.content}>
      <table className={utilStyles.table}>
        <thead>
          <tr>
            <th className={utilStyles.tableHeaderPin}>📌</th>
            <th className={utilStyles.tableHeaderName}>Name</th>
            <th className={utilStyles.tableHeaderType}>Type</th>
          </tr>
        </thead>
        <tbody>
        {object.contents.map(item => {
          return <tr key={`${item.name}-row`}>
            <td className={utilStyles.tableRowPin}>-</td>
            <td className={utilStyles.tableRowName} key={`${item.name}-data`}><Link href={`/[...path]`} as={`/${object.name}/${item.name}`}>{item.name}</Link></td>
            <td className={utilStyles.tableRowType}>{item.type}</td>
          </tr>
        })}
        </tbody>
      </table>
    </div>
  } else {
    let content;

    if (object.contents[0].type.includes('video')) {
      content = <video src={`/api/static?path=${object.name}`} controls track={object.name}></video>
    } else if (object.contents[0].type.includes('image')) {
      content = <img src={`/api/static?path=${object.name}`}/>
    } else if (object.contents[0].type.includes('markdown')){
      content = <div className={utilStyles.text} dangerouslySetInnerHTML={{__html: object.contents[0].content}} />
    } else if (object.contents[0].type.includes('text/plain')) {
      content = <textarea className={utilStyles.plain} value={object.contents[0].content} readOnly={true}></textarea>
    } else if (object.contents[0].type.includes('pdf')){
      const [file] = useState(`/api/static?path=${object.name}`);
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

      content = <div className={utilStyles.pdfViewer}>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
        <div>
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
      content = <a className={utilStyles.download} href={`/api/download?path=${object.name}`}>Download File</a>
    }

    return <div className={utilStyles.content}>
      {content}
    </div>
  }
}

// TODO: modal window
function showModal() {
  console.log(`clicked`)
}

export default function Shared({response}) {
  const options = (type, content) => {
    switch (type) {
      case "file": 
        if (content.includes("text") || content.includes("markdown")) {
          return <div><Link href={`/cardboard/modify/[...path]`} as={`/cardboard/modify/${response.object.name}`}>Edit File</Link> - <a href={`/api/download?path=${response.object.name}`}>Download</a></div>
        } else {
          return <a href={`/api/download?path=${response.object.name}`}>Download</a>
        }
      case "directory":
        return <div><Link href={`/cardboard/create/[...path]`} as={`/cardboard/create/folder/${response.object.name}`}>Create Folder</Link> - <Link href={`/cardboard/create/[...path]`} as={`/cardboard/create/file/${response.object.name}`}>Upload File</Link> - <Link href={`/cardboard/create/[...path]`} as={`/cardboard/create/text/${response.object.name}`}>Write File</Link></div>
      default:
        return ""
    }
  }

  return <Layout>
    <Head>
      <title>{ (response.object.contents)? response.object.contents[0].name : "Not Found"} - {siteTitle}</title>
    </Head>

    <div className={utilStyles.container}>
        <div className={utilStyles.header}>
          <span className={utilStyles.title}>
            {response.object.name}
          </span>
          <br />
          <div className={utilStyles.meta__container}>
            <div className={utilStyles.meta}>
              Contains: {getObjectCount(response.object.contents)}
            </div>
            {
              (response.permission == 0 || response.owner == {currentUser})? 
                <div className={utilStyles.options}>
                  <span>&nbsp;{options(response.object.type, (response.object.contents[0])? response.object.contents[0].type : "empty")}</span> -
                  <span>&nbsp;<a onClick={() => showModal()}>Delete</a></span>
                </div> 
                : 
                ""
            }
          </div>
        </div>
        {displayContent(response.object)}
      </div>
  </Layout>
}
