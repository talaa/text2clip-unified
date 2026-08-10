import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  updateProfile
} from 'firebase/auth';
import '../styles/Auth.css';

const Auth = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to app
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/app');
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update profile with name
        await updateProfile(userCredential.user, {
          displayName: name
        });
        navigate('/app');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setError(null);
    setLoading(true);

    try {
      await signInWithPopup(auth, provider);
      navigate('/app');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="text-center mb-4">
              <Link to="/" className="auth-logo">Text2Clip</Link>
            </div>
            
            <Card className="auth-card">
              <Card.Body>
                <h2 className="text-center mb-4">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleEmailAuth}>
                  {!isLogin && (
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        required={!isLogin}
                      />
                    </Form.Group>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 mb-3 auth-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
                  </Button>
                </Form>
                
                <div className="divider">
                  <span>OR</span>
                </div>
                
                <div className="social-auth">
                  <Button 
                    variant="outline-primary" 
                    className="w-100 mb-3 google-btn"
                    onClick={() => handleSocialAuth(new GoogleAuthProvider())}
                    disabled={loading}
                  >
                    <i className="bi bi-google"></i> Continue with Google
                  </Button>
                  
                  <Button 
                    variant="outline-dark" 
                    className="w-100 github-btn"
                    onClick={() => handleSocialAuth(new GithubAuthProvider())}
                    disabled={loading}
                  >
                    <i className="bi bi-github"></i> Continue with GitHub
                  </Button>
                </div>
              </Card.Body>
            </Card>
            
            <div className="text-center mt-4 auth-switch">
              {isLogin ? (
                <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
              ) : (
                <p>Already have an account? <Link to="/login">Login</Link></p>
              )}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;
