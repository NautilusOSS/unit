import React from 'react';
import { Box, Typography, Container, Grid, Paper, Button, Link } from '@mui/material';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

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

  const tokens = [
    {
      title: '$UNIT',
      description: 'The native token of the Unit ecosystem',
      arc200AppId: 420069,
      asaAssetId: 747374,
      unitAppId: 747368,
      icon: 'https://asset-verification.nautilus.sh/icons/420069.png'
    }
  ];

  const projects = [
    {
      title: 'Dorks',
      description: 'A very serious project about a growing problem. In this episode, the dorks find themselves in the new waters of Voi. With their numbers vastly diminished, they could one day recover...',
      link: 'https://highforge.io/project/dorks',
      backgroundImage: 'https://prod.cdn.highforge.io/i/https%3A%2F%2Fprod.cdn.highforge.io%2Fm%2F313597%2F15.json%23arc3?w=400'
    },
    {
      title: 'Lil Chubs',
      description: 'An approachable entry into the Dorks ecosystem, these girthy little things are just too cute. You\'ll be proud to show your chub off to your friends or family. 50 pieces appear in this drop, with more likely to come.',
      link: 'https://highforge.io/project/lil-chubs',
      backgroundImage: 'https://prod.cdn.highforge.io/i/https%3A%2F%2Fprod.cdn.highforge.io%2Fm%2F313705%2F11.json%23arc3?w=400'
    }
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Welcome to Unit
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
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgb(38, 38, 38)' : '#f5f5f5',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
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
          sx={{ mb: 4, mt: 8 }}
        >
          Tokens
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {tokens.map((token) => (
            <Grid item xs={12} sm={6} md={4} key={token.title}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: isDarkMode ? 'rgb(28, 28, 28)' : 'white',
                }}
              >
                <Box 
                  component="img"
                  src={token.icon}
                  alt={token.title}
                  sx={{
                    width: 64,
                    height: 64,
                    mb: 2,
                    borderRadius: '50%'
                  }}
                />
                <Typography 
                  variant="h5" 
                  component="h3" 
                  gutterBottom
                  sx={{ 
                    color: isDarkMode ? 'white' : 'text.primary'
                  }}
                >
                  {token.title}
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ 
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                    mb: 2
                  }}
                >
                  {token.description}
                </Typography>
                <Box sx={{ mt: 3, mb: 3, width: '100%' }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      mb: 2
                    }}
                  >
                    Get $UNIT on
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      component={Link}
                      href="https://voi.humble.sh/#/swap?poolId=429999"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : undefined,
                        color: isDarkMode ? 'white' : undefined,
                        '&:hover': {
                          borderColor: isDarkMode ? 'white' : undefined,
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
                        }
                      }}
                    >
                      Humble
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<OpenInNewIcon />}
                      component={Link}
                      href="https://voi.nomadex.app/0/0/2/420069"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.23)' : undefined,
                        color: isDarkMode ? 'white' : undefined,
                        '&:hover': {
                          borderColor: isDarkMode ? 'white' : undefined,
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : undefined,
                        }
                      }}
                    >
                      Nomadex
                    </Button>
                  </Box>
                </Box>
                <Box sx={{ mt: 'auto' }}>
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    ARC200 App ID: {token.arc200AppId}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    Unit App ID: {token.unitAppId}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ 
                      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                      fontFamily: 'monospace'
                    }}
                  >
                    ASA Asset ID: {token.asaAssetId}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ mb: 4, mt: 8 }}
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
                  borderRadius: 2,
                  backgroundImage: project.backgroundImage ? `url(${project.backgroundImage})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: isDarkMode ? 'rgb(38, 38, 38)' : '#f5f5f5',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                    '&::after': {
                      opacity: 0.7,
                    }
                  },
                  '&::after': project.backgroundImage ? {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: isDarkMode ? 'rgba(28, 28, 28, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                    borderRadius: 2,
                    transition: 'opacity 0.3s',
                  } : {},
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