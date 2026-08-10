import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../styles/Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="hero-content">
              <div className="logo-container">
                <h1 className="logo">Text2Clip</h1>
              </div>
              <h2 className="tagline">Transform Text into Stunning Videos</h2>
              <p className="description">
                Generate professional-quality videos from simple text prompts. 
                Powered by AI, Text2Clip makes video creation effortless.
              </p>
              <div className="cta-buttons">
                <Link to="/signup">
                  <Button variant="primary" size="lg" className="get-started-btn">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline-light" size="lg" className="login-btn">
                    Login
                  </Button>
                </Link>
              </div>
            </Col>
            <Col lg={6} className="hero-image-container">
              <div className="hero-image">
                <div className="floating-element video-icon"></div>
                <div className="floating-element text-icon"></div>
                <div className="floating-element ai-icon"></div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="features-section">
        <Container>
          <h2 className="section-title">How It Works</h2>
          <Row>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon input-icon"></div>
                <h3>1. Enter Your Topic</h3>
                <p>Simply type in your topic or idea. Our AI understands context and nuance.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon process-icon"></div>
                <h3>2. AI Processing</h3>
                <p>Our advanced AI generates scenes, visuals, and transitions automatically.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="feature-card">
                <div className="feature-icon output-icon"></div>
                <h3>3. Download Your Video</h3>
                <p>Get a professional-quality video ready to share on any platform.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="testimonials-section">
        <Container>
          <h2 className="section-title">What Our Users Say</h2>
          <Row>
            <Col md={4}>
              <div className="testimonial-card">
                <div className="quote">"Text2Clip saved me hours of video editing. I can now create content in minutes!"</div>
                <div className="author">- Sarah J., Content Creator</div>
              </div>
            </Col>
            <Col md={4}>
              <div className="testimonial-card">
                <div className="quote">"The quality of videos is impressive. My marketing team relies on it daily."</div>
                <div className="author">- Michael T., Marketing Director</div>
              </div>
            </Col>
            <Col md={4}>
              <div className="testimonial-card">
                <div className="quote">"As a teacher, this tool has revolutionized how I create educational content."</div>
                <div className="author">- Lisa M., Educator</div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <footer className="landing-footer">
        <Container>
          <Row>
            <Col md={6}>
              <h3 className="footer-logo">Text2Clip</h3>
              <p>© 2025 Text2Clip. All rights reserved.</p>
            </Col>
            <Col md={6} className="footer-links">
              <a href="#" className="footer-link">Terms of Service</a>
              <a href="#" className="footer-link">Privacy Policy</a>
              <a href="#" className="footer-link">Contact Us</a>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Landing;
