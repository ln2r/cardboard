import React, { useCallback, useMemo, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Accordion from 'react-bootstrap/Accordion'
import { Modal, Button, Form, FloatingLabel } from 'react-bootstrap'
import fetch from 'node-fetch'
import Router from 'next/router'

import { currentUser } from '../components/layout'
import styles from '../scss/modal.module.scss'

export default function ModalObject ({type, button, path}) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  path = (path.length !== 0)? path : ["root"];

  // uploader stuff
  const baseStyle = {
    margin: '0.5rem 0 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    borderWidth: 2,
    borderRadius: 2,
    borderColor: '#eeeeee',
    borderStyle: 'dashed',
    backgroundColor: '#fafafa',
    color: '#bdbdbd',
    transition: 'border .3s ease-in-out'
  };
  
  const activeStyle = {
    borderColor: '#2196f3'
  };
  
  const acceptStyle = {
    borderColor: '#00e676'
  };
  
  const rejectStyle = {
    borderColor: '#ff1744'
  };

  const addFolder = e => {
    e.preventDefault()
    const path = e.target.path.value;

    // appending / encoding data to multipart/form-data
    const formData = new FormData()

    formData.append("path", path)    
    formData.append("author", currentUser)

    if (e.target.folder.value) {
      // handling folder
      formData.append("type", "folder")
      formData.append("objects", e.target.folder.value)

      fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(() => {
        // refresh the page
        Router.reload(window.location.pathname)
      }) 
    }
  }

  const addObjects = e => {
    e.preventDefault()
    const path = e.target.path.value;

    // appending / encoding data to multipart/form-data
    const formData = new FormData()

    formData.append("path", path)    
    formData.append("author", currentUser)

    if (content) {
      // handling file
      formData.append("type", "file")
      for (const object in files) {
        formData.append("objects", files[object])
      }

      fetch('/api/upload', {
        method: 'POST',
        body: formData
      }).then(() => {
        // refresh the page
        Router.reload(window.location.pathname)
      }) 
    }
  }

  const deleteObject = e => {
    e.preventDefault()

    const path = e.target.path.value
    const type = (!/\.[a-zA-Z0-9]*/gm.test(path))? "folder" : "file"

    if (!path) {
      return
    }
    
    // removing file name to get parent path
    let parentPath = path.split("\/")
        parentPath.pop()

    fetch('/api/remove', {
      method: 'DELETE',
      body: JSON.stringify({
        "path": path,
        "type": type
      }),
      headers: {'Content-Type': 'application/json'}
    }).then(() => {
      // return to parent
      Router.push(`/${parentPath.join("\/")}`)
    })
  }

  const shareObject = e => {
    e.preventDefault()

    if (!e.target.path.value || !e.target.owner.value || !e.target.permission.value) {
      return
    }

    fetch('/api/share/add', {
      method: 'POST',
      body: JSON.stringify({
        "path": e.target.path.value,
        "owner": e.target.owner.value,
        "permission": parseInt(e.target.permission.value)
      }),
      headers: {'Content-Type': 'application/json'}
    })
  }

  const changeShare = e => {
    e.preventDefault()

    console.log('updating permission')
    // modify share
    fetch('/api/share/update', {
      method: 'PATCH',
      body: JSON.stringify({
        "shareId": e.target.shareId.value,
        "permission": parseInt(e.target.permission.value)
      }),
      headers: {'Content-Type': 'application/json'}
    }).then(() => {
      // refresh the page
      Router.reload(window.location.pathname)
    })
  }

  const deleteShare = e => {
    e.preventDefault()

    console.log('delete share')
    // delete share
    fetch('/api/share/remove', {
      method: 'DELETE',
      body: JSON.stringify({
        "shareId": e.target.shareId.value
      }),
      headers: {'Content-Type': 'application/json'}
    }).then(() => {
      // refresh the page
      Router.reload(window.location.pathname)
    })
  }

  const [files, setFiles] = useState([]);

  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles.map(file => Object.assign(file, 
    //   preview: URL.createObjectURL(file)
    )));
  }, [])
  const {
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop
  })

  const style = useMemo(() => ({
    ...baseStyle,
    ...(isDragActive ? activeStyle : {}),
    ...(isDragAccept ? acceptStyle : {}),
    ...(isDragReject ? rejectStyle : {})
  }), [
    isDragActive,
    isDragReject,
    isDragAccept
  ]);

  const thumbs = files.map((file, index) => (
    <li key={`file-${index}`}>📄 [{Math.round(file.size / 1024)} KB] {file.name} - <code>{file.type? file.type : "file/unknown"}</code></li>
  ));  

  const uploader = () => {
    return <div {...getRootProps({ style })}>
      <input {...getInputProps()}/>
      {
        isDragActive ?
          <p>Drop the File!</p> :
          <p>Drop File Here to Upload!</p>
      }
    </div>
  }

  // getting content type
  let title;
  let content;
  switch (type) {
    case "create":
      title = "Add Object"
      content = 
        <>
          <Modal.Body>
            <Accordion>              
              <Accordion.Item eventKey="0">
                <Accordion.Header>Folder</Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={addFolder}>
                    <p>Adding folder in <strong>{path.join("\/")}</strong>/</p>
                    <FloatingLabel label="Folder Name">
                      < Form.Control name="folder" />
                    </FloatingLabel>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
                      <Button className={styles.button} variant="primary" type="submit" onClick={handleClose}>
                        Add Folder
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Objects</Accordion.Header>
                <Accordion.Body>
                  <Form onSubmit={addObjects}>
                    <p>Adding object in <strong>{path.join("\/")}</strong>/</p>
                      <input hidden={true} name="path" value={path.join("\/")} readOnly={true}/>
                      {uploader()}
                      <div>
                        <ul>
                          {thumbs}
                        </ul>                
                      </div>
                    <a href={`/cardboard/write/${path.join("\/")}`}>Write a text file instead.</a>
                    <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
                      <Button className={styles.button} variant="primary" type="submit" onClick={handleClose}>
                        Add Objects
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>              
            </Accordion>
          </Modal.Body>
        </>
    break;
    case "delete":
      title = "Delete Object"
      content = <>
        <Form onSubmit={deleteObject}>
          <Modal.Body>
            <p>Delete <strong>/{path.join("\/")}</strong>?</p>
            <input type="text" hidden={true} readOnly={true} value={path.join("\/")} name="path"/>
          </Modal.Body>
          <Modal.Footer>
            <Button className={styles.button} variant="danger" type="submit" onClick={handleClose}>
              Remove Object
            </Button>
            <Button className={styles.button} variant="primary" onClick={handleClose}>
              Cancel
            </Button>
          </Modal.Footer>
        </Form>
      </>
    break;
    case "share":
      title = "Share Object"
      content = <>
        <Form onSubmit={shareObject}>
          <Modal.Body>
            <p>Sharing <strong>{path.join("\/")}</strong></p>
            <input type="text" hidden={true} readOnly={true} value={currentUser} name="owner"/>
            <input type="text" hidden={true} readOnly={true} value={path.join("\/")} name="path"/>
            <FloatingLabel label="Anyone with links can">
              <Form.Select name="permission">
                <option value="0">Edit</option>
                <option value="1">View Only</option>
              </Form.Select>
            </FloatingLabel>
          </Modal.Body>
          <Modal.Footer>
            <Button className={styles.button} variant="primary" type="submit" onClick={handleClose}>
              Share
            </Button>
          </Modal.Footer>
        </Form>
      </>
    break;
    case "permission":
      title = "Modify Shared Object"
      content = <>
        <Modal.Body>
          <Accordion>              
            <Accordion.Item eventKey="0">
              <Accordion.Header>Permission</Accordion.Header>
              <Accordion.Body>
                <Form onSubmit={changeShare}>
                  <p>Changing <strong>{path.Object}</strong> share permission</p>
                  <input type="text" hidden={true} readOnly={true} value={path.ShareId} name="shareId" />
                  <FloatingLabel label="Anyone with links can">
                    <Form.Select name="permission">
                      <option value="0">Edit</option>
                      <option value="1">View Only</option>
                    </Form.Select>
                  </FloatingLabel>
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
                    <Button className={styles.button} variant="primary" type="submit" onClick={handleClose}>
                      Change
                    </Button>
                  </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Remove</Accordion.Header>
              <Accordion.Body>
                <Form onSubmit={deleteShare}>
                  <p>Remove <strong>{path.Object}</strong> from being shared?</p>
                  <input type="text" hidden={true} readOnly={true} value={path.ShareId} name="shareId" />
                  <div className="d-grid gap-2 d-md-flex justify-content-md-end mt-2">
                  <Button className={styles.button} variant="danger" type="submit" onClick={handleClose}>
                    Remove Object
                  </Button>
                  <Button className={styles.button} variant="primary" onClick={handleClose}>
                    Cancel
                  </Button>
                  </div>
                </Form>
              </Accordion.Body>
            </Accordion.Item>              
          </Accordion>    
        </Modal.Body>
      </>
    break;
    default:
      title = "Modal Window Test"
      content = <>
        <Modal.Body>
          How?
        </Modal.Body>
      </>
  }

  return (
    <>
      <Button className={styles.button} variant="primary" onClick={handleShow}>
        {button}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        {content}
      </Modal>
    </>
  )
}