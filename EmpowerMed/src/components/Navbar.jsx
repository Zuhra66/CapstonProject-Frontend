import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

export default function EmpowerMedNavbar() {
  return (
    <Navbar bg="light" expand="lg" fixed="top">
      <Container>
        <Navbar.Brand href="/">EmpowerMed</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
            <LinkContainer to="/membership"><Nav.Link>Membership</Nav.Link></LinkContainer>
            <LinkContainer to="/products"><Nav.Link>Products</Nav.Link></LinkContainer>
            <LinkContainer to="/blog"><Nav.Link>Blog</Nav.Link></LinkContainer>
            <LinkContainer to="/education"><Nav.Link>Educational Hub</Nav.Link></LinkContainer>
            <LinkContainer to="/about"><Nav.Link>About</Nav.Link></LinkContainer>
          </Nav>
          <div className="d-flex gap-2">
            <LinkContainer to="/appointment"><Button variant="outline-success">Book Appointment</Button></LinkContainer>
            <LinkContainer to="/login"><Button variant="outline-primary">Login</Button></LinkContainer>
            <LinkContainer to="/signup"><Button variant="success">Sign Up</Button></LinkContainer>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
