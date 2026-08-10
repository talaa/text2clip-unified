import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import '../styles/Navbar.css';

const Navbar = ({ user }) => {
  const location = useLocation();
  
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Redirect to home page after logout
        window.location.href = '/';
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  // Don't show navbar on landing page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <BootstrapNavbar expand="lg" className="custom-navbar" variant="dark">
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/" className="brand">
          <span className="brand-text">Text2Clip</span>
        </BootstrapNavbar.Brand>
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            {user ? (
              <>
                <Nav.Link as={Link} to="/app" className="nav-link">Dashboard</Nav.Link>
                <div className="user-info">
                  <img 
                    src={user.photoURL || 'https://via.placeholder.com/30'} 
                    alt="User" 
                    className="user-avatar"
                  />
                  <span className="user-name">{user.displayName}</span>
                </div>
                <Button 
                  variant="outline-light" 
                  className="logout-btn" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="nav-link">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" className="nav-link">Sign Up</Nav.Link>
              </>
            )}
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;
