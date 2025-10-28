import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import '../styles/navbar.css';

export default function EmpowerMedNavbar() {
  return (
    <Navbar expand="lg" fixed="top" className="empowermed-navbar">
      <Container>
        <Navbar.Brand href="/" className="navbar-logo">
          <img src="./src/assets/logo.png" alt="EmpowerMEd Logo" className="navbar-logo-img" />
          <span>EmpowerMEd</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="navbar-toggle" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3">
            <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
            <LinkContainer to="/membership"><Nav.Link>Membership</Nav.Link></LinkContainer>
            <LinkContainer to="/products"><Nav.Link>Products</Nav.Link></LinkContainer>
            <LinkContainer to="/blog"><Nav.Link>Blog</Nav.Link></LinkContainer>
            <LinkContainer to="/education"><Nav.Link>Educational Hub</Nav.Link></LinkContainer>
            <LinkContainer to="/about"><Nav.Link>About</Nav.Link></LinkContainer>

            <div className="nav-buttons">
              <LinkContainer to="/appointment">
                <Button variant="outline-light" className="nav-btn book-btn">
                  Book Appointment
                </Button>
              </LinkContainer>
              <LinkContainer to="/login">
                <Button variant="light" className="nav-btn login-btn">
                  Login
                </Button>
              </LinkContainer>
              <LinkContainer to="/signup">
                <Button variant="success" className="nav-btn signup-btn">
                  Sign Up
                </Button>
              </LinkContainer>
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
