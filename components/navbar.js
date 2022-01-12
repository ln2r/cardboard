import '../scss/navbar.module.scss'
import { Navbar, Container, Nav } from 'react-bootstrap'

const Navigation = () => (
  <Navbar>
    <Container>
      <Navbar.Brand href="/">
        Cardboard
      </Navbar.Brand>
      <Nav className="me-auto">
        <Nav.Link href="/cardboard/">
          Shares
        </Nav.Link>
      </Nav>
    </Container>
  </Navbar>
)

export default Navigation;