import React from 'react';
import { Box, Typography, Container, Grid, Paper } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

const UnitHome: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const tools = [
    {
      title: 'Unit Converter',
      description: 'Convert between different units',
      path: '/converter'
    }
  ];

  const projects = [
    {
      title: 'Dorks',
      description: 'A very serious project about a growing problem. In this episode, the dorks find themselves in the new waters of Voi. With their numbers vastly diminished, they could one day recover...',
      link: 'https://highforge.io/project/dorks',
    },
    {
      title: 'Lil Chubs',
      description: 'An approachable entry into the Dorks ecosystem, these girthy little things are just too cute. You\'ll be proud to show your chub off to your friends or family. 50 pieces appear in this drop, with more likely to come.',
      link: 'https://highforge.io/project/lil-chubs',
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Voiager Tools
        </Typography>
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            mb: 8
          }} 
          paragraph
        >
          Your gateway to Unit, Dork and Lil Chubs
        </Typography>

        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ mb: 4 }}
        >
          Tools
        </Typography>
        
        <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
          {tools.map((tool) => (
            <Grid item xs={12} sm={6} md={4} key={tool.title}>
              <Paper
                onClick={() => navigate(tool.path)}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: isDarkMode ? 'rgb(28, 28, 28)' : 'white',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: isDarkMode 
                      ? '0 8px 24px rgba(0,0,0,0.4)' 
                      : '0 8px 24px rgba(0,0,0,0.1)',
                    backgroundColor: isDarkMode ? 'rgb(38, 38, 38)' : '#f8f8f8',
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    color: isDarkMode ? 'white' : 'text.primary'
                  }}
                >
                  {tool.title}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                  }}
                >
                  {tool.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ 
            mb: 4,
            mt: 12,
            fontWeight: 600,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 60,
              height: 3,
              backgroundColor: isDarkMode ? '#2196F3' : '#1976D2',
              borderRadius: 1
            }
          }}
        >
          Projects
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {projects.map((project) => (
            <Grid item xs={12} sm={6} key={project.title}>
              <Paper
                onClick={() => window.open(project.link, '_blank')}
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: isDarkMode ? 'rgb(28, 28, 28)' : 'white',
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    backgroundColor: isDarkMode ? 'rgb(38, 38, 38)' : '#f8f8f8',
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom
                    sx={{ 
                      color: isDarkMode ? 'white' : 'text.primary'
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'
                    }}
                  >
                    {project.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default UnitHome; 