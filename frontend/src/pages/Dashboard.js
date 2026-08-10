import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = ({ user }) => {
  const [topic, setTopic] = useState('');
  const [numScenes, setNumScenes] = useState(1);
  const [taskId, setTaskId] = useState(null);
  const [progress, setProgress] = useState({ state: 'IDLE', status: 'Not started' });
  const [error, setError] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch recent videos (mock data for now)
    setRecentVideos([
      //{ id: 1, title: 'Space Exploration', date: '2025-03-30', thumbnail: 'https://via.placeholder.com/300x169?text=Space+Video' },
      //{ id: 2, title: 'Renewable Energy', date: '2025-03-28', thumbnail: 'https://via.placeholder.com/300x169?text=Energy+Video' },
      //{ id: 3, title: 'Artificial Intelligence', date: '2025-03-25', thumbnail: 'https://via.placeholder.com/300x169?text=AI+Video' },
    ]);
  }, []);

  useEffect(() => {
    let interval;
    if (taskId) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/progress/${taskId}`);// http://localhost:5000/progress/${taskId}
          setProgress(response.data);
          if (response.data.state === 'SUCCESS' || response.data.state === 'FAILURE') {
            clearInterval(interval);
          }
        } catch (err) {
          setError('Error checking progress');
          clearInterval(interval);
        }
      }, 2000); // Poll every 2 seconds
    }
    return () => clearInterval(interval);
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setProgress({ state: 'PENDING', status: 'Task queued' });
    // Google Analytics event for "Generate Clip"
    if (window.gtag) {
      window.gtag('event', 'generate_clip', {
        event_category: 'Video Generation',
        event_label: topic,
        value: numScenes,
      });
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate_clip`, {
        topic,
        num_scenes: parseInt(numScenes),
      });
      setTaskId(response.data.task_id);
      
      // Add to recent videos with a placeholder
      const newVideo = {
        id: Date.now(),
        title: topic,
        date: new Date().toISOString().split('T')[0],
        thumbnail: 'https://via.placeholder.com/300x169?text=Processing...',
        processing: true
      };
      
      setRecentVideos([newVideo, ...recentVideos]);
    } catch (err) {
      setError('Failed to start video generation');
      setProgress({ state: 'FAILURE', status: 'Error starting task' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/download/${taskId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'output_movie.mp4');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Update the recent video to show it's no longer processing
      const updatedVideos = recentVideos.map(video => {
        if (video.processing) {
          return { ...video, processing: false };
        }
        return video;
      });
      
      setRecentVideos(updatedVideos);
    } catch (err) {
      setError('Download failed');
    }
  };

  return (
    <div className="dashboard-page">
      <Container>
        <Row className="mb-5">
          <Col>
            <div className="dashboard-header">
              <h1>Create New Video</h1>
              <p className="text-muted">Generate professional videos from text in minutes</p>
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col lg={8}>
            <Card className="create-video-card">
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>What's your video about?</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter a topic or description for your video"
                      required
                      className="topic-input"
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Number of Scenes (1-6)</Form.Label>
                    <div className="scene-selector">
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <Button
                          key={num}
                          variant={numScenes === num ? "primary" : "outline-primary"}
                          className="scene-btn"
                          onClick={() => setNumScenes(num)}
                        >
                          {num}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                  <div className="generate-section d-flex align-items-center"> 
                    <Button 
                        type="submit" 
                        className="generate-btn"
                        disabled={loading || progress.state === 'PROGRESS'}
                    >
                        {loading ? (
                        <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Processing...
                        </>
                        ) : (
                        'Generate Video'
                        )}
                    </Button>
                    <span className="text-muted"> (This may take Few Moments!)</span>
                </div>
                </Form>
                
                {taskId && (
                  <div className="progress-section mt-4">
                    <h4>Progress: {progress.status}</h4>
                    <ProgressBar
                      now={
                        progress.state === 'PENDING' ? 10 :
                        progress.state === 'PROGRESS' ? (
                          progress.status === 'Generating scenes' ? 30 :
                          progress.status === 'Processing scenes' ? 60 :
                          progress.status === 'Creating video' ? 90 : 0
                        ) : progress.state === 'SUCCESS' ? 100 : 0
                      }
                      label={progress.state}
                      className="custom-progress"
                    />
                    
                    {progress.state === 'SUCCESS' && (
                      <Button onClick={handleDownload} className="download-btn mt-3">
                        <i className="bi bi-download me-2"></i>
                        Download Video
                      </Button>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card className="tips-card">
              <Card.Body>
                <h4>Tips for Great Videos</h4>
                <ul className="tips-list">
                  <li>Be specific about your topic</li>
                  <li>Include key points you want to cover</li>
                  <li>Specify tone (professional, casual, etc.)</li>
                  <li>More scenes = longer video</li>
                </ul>
                
                <div className="example-section">
                  <h5>Example:</h5>
                  <p className="example-text">
                    "A brief history of space exploration, covering the moon landing, 
                    Mars rovers, and future missions to Jupiter. Use a professional, 
                    educational tone with dramatic space visuals."
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col>
            <h2 className="recent-videos-title">Share with Social Media</h2>
          </Col>
        </Row>

        <Row>
          <Col>
            <div className="social-share-buttons d-flex flex-wrap justify-content-center p-3">
              <Button
                variant="primary"
                className="me-2"
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <i className="bi bi-facebook me-2"></i> Facebook
              </Button>
              <Button
                variant="info"
                className="me-2"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=Check+out+this+video!`, '_blank')}
              >
                <i className="bi bi-twitter me-2"></i> Twitter
              </Button>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <i className="bi bi-linkedin me-2"></i> LinkedIn
              </Button>
              <Button
                variant="success"
                className="me-2"
                onClick={() => window.open(`https://api.whatsapp.com/send?text=Check+out+this+video!+${encodeURIComponent(window.location.href)}`, '_blank')}
              >
                <i className="bi bi-whatsapp me-2"></i> WhatsApp
              </Button>
              <Button
                variant="danger"
                className="me-2"
                onClick={() => window.open(`https://www.instagram.com/`, '_blank')}
              >
                <i className="bi bi-instagram me-2"></i> Instagram
              </Button>
              <Button
                variant="dark"
                onClick={() => window.open(`https://www.tiktok.com/`, '_blank')}
              >
                <i className="bi bi-tiktok me-2"></i> TikTok
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mt-5">
          <Col>
            <h2 className="recent-videos-title">Your Recent Videos(Coming soon)</h2>
          </Col>
        </Row>
        
        <Row>
          {recentVideos.map(video => (
            <Col md={6} lg={4} key={video.id} className="mb-4">
              <Card className="video-card">
                <div className="video-thumbnail">
                  <img src={video.thumbnail} alt={video.title} />
                  {video.processing ? (
                    <div className="processing-overlay">
                      <Spinner animation="border" />
                      <span>Processing</span>
                    </div>
                  ) : (
                    <div className="play-button">
                      <i className="bi bi-play-fill"></i>
                    </div>
                  )}
                </div>
                <Card.Body>
                  <Card.Title>{video.title}</Card.Title>
                  <Card.Text className="text-muted">Created: {video.date}</Card.Text>
                  <div className="video-actions">
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-download me-1"></i> Download
                    </Button>
                    <Button variant="outline-danger" size="sm">
                      <i className="bi bi-trash me-1"></i> Delete
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        
      </Container>
    </div>
  );
};

export default Dashboard;
