import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown, Image } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton.jsx';
import logo from '../assets/logo.png';
import '../styles/navbar.css';

export default function EmpowerMedNavbar() {
  const { user, isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
  if (isLoading) return null;
  console.log('Auth0 user:', user, 'isAuthenticated:', isAuthenticated);
{isAuthenticated && user && (
  <NavDropdown
    title={
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Image
          src={user.picture}
          roundedCircle
          width={38}
          height={38}
          alt="avatar"
        />
        <span style={{ color: '#3D52A0', fontWeight: 600 }}>
          {user.name || user.given_name || user.nickname || user.email}
        </span>
      </div>
    }
    id="user-nav-dropdown"
    align="end"
  >
    <LinkContainer to="/account">
      <NavDropdown.Item>Account Settings</NavDropdown.Item>
    </LinkContainer>
    <NavDropdown.Item as="div">
      <LogoutButton />
    </NavDropdown.Item>
  </NavDropdown>
)}


  return (
    <Navbar expand="lg" fixed="top" className="empowermed-navbar">
      <Container>
        <Navbar.Brand href="/" className="navbar-logo">
          <img src={logo} alt="EmpowerMEd Logo" className="navbar-logo-img" />
          <span>EmpowerMEd</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav className="align-items-center gap-3">
            <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
            <LinkContainer to="/membership"><Nav.Link>Membership</Nav.Link></LinkContainer>
            <LinkContainer to="/products"><Nav.Link>Products</Nav.Link></LinkContainer>
            <LinkContainer to="/blog"><Nav.Link>Blog</Nav.Link></LinkContainer>
            <LinkContainer to="/education"><Nav.Link>Educational Hub</Nav.Link></LinkContainer>
            <LinkContainer to="/about"><Nav.Link>About</Nav.Link></LinkContainer>

            <div className="nav-buttons">
              {!isAuthenticated && (
                <>
                  <Button
                    variant="light"
                    className="nav-btn login-btn"
                    onClick={() => loginWithRedirect()}
                  >
                    Login
                  </Button>
                  <Button
                    variant="success"
                    className="nav-btn signup-btn"
                    onClick={() => loginWithRedirect({ screen_hint: 'signup' })}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {isAuthenticated && user && (
                <NavDropdown
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Image
                        src={user.picture}
                        roundedCircle
                        width={38}
                        height={38}
                        alt="avatar"
                      />
                      <span style={{ color: '#3D52A0', fontWeight: 600 }}>
                        {user.given_name || user.name}
                      </span>
                    </div>
                  }
                  id="user-nav-dropdown"
                  align="end"
                >
                  <LinkContainer to="/account">
                    <NavDropdown.Item>Account Settings</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item as="div">
                    <LogoutButton />
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
