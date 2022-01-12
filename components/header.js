import Link from 'next/link'
import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { getObjectCount } from '../lib/addons'

import styles from '../scss/directory.module.scss'

import ModalObject from './modal'

function setTitleFormat(path){
  const currentDirectory = path;
  let links = []

  let currentLink = ``
  for(let i=0; i<(currentDirectory.length - 1); i++) {
    currentLink = `${currentLink}/${currentDirectory[i]}`;
    links.push({
      name: currentDirectory[i],
      link: currentLink
    }) 
  }

  return links
}

export default function Header({object, path}) {
  return <div className={styles.header}>
    <h1>
      <Link href={`/`}>box</Link>/
      {setTitleFormat(path).map((url, index) => {
        return <React.Fragment key={`url-${index}`}><Link href={`/[...path]`} as={`${url.link}`}>{url.name}</Link>/</React.Fragment>
      })} 
      {path[path.length - 1]}
    </h1>
    <Container>
      <Row>
        <Col className="px-0">
          <p>Contains: {getObjectCount(object.contents)}</p>
        </Col>
        <Col className="px-0 d-grid gap-2 d-md-flex justify-content-md-end">
          <ModalObject type="create" path={path} button="Add" />
          <ModalObject type="share" path={path} button="Share" />
          <ModalObject type="delete" path={path} button="Delete" />
        </Col>
      </Row>
    </Container>
  </div>
}