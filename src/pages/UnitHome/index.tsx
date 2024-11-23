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
    <>
      <Box
        sx={{
          position: 'relative',
          height: '60vh',
          width: '100%',
          overflow: 'hidden',
          backgroundImage: isDarkMode
            ? 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgb(18, 18, 18) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, #ffffff 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(https://prod.cdn.highforge.io/m/313597/1.webp)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: isDarkMode ? 0.3 : 0.15,
            zIndex: 0,
            animation: 'pulse 15s ease-in-out infinite',
            filter: 'blur(0.5px) brightness(1.1) contrast(1.2)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDarkMode 
              ? 'radial-gradient(circle at 50% 50%, rgba(33,150,243,0.1) 0%, transparent 60%)'
              : 'radial-gradient(circle at 50% 50%, rgba(25,118,210,0.1) 0%, transparent 60%)',
            zIndex: 1,
            animation: 'glow 8s ease-in-out infinite',
            backgroundBlendMode: 'screen',
            mixBlendMode: 'overlay',
          },
          '@keyframes scanline': {
            '0%': {
              transform: 'translateY(-100%)',
            },
            '100%': {
              transform: 'translateY(100%)',
            }
          },
          '@keyframes flicker': {
            '0%': {
              opacity: 0.97,
            },
            '5%': {
              opacity: 0.95,
            },
            '10%': {
              opacity: 0.9,
            },
            '15%': {
              opacity: 0.95,
            },
            '20%': {
              opacity: 0.98,
            },
            '25%': {
              opacity: 0.95,
            },
            '30%': {
              opacity: 0.9,
            },
            '35%': {
              opacity: 0.95,
            },
            '40%': {
              opacity: 0.98,
            },
            '45%': {
              opacity: 0.95,
            },
            '50%': {
              opacity: 0.9,
            },
            '55%': {
              opacity: 0.95,
            },
            '60%': {
              opacity: 0.98,
            },
            '65%': {
              opacity: 0.95,
            },
            '70%': {
              opacity: 0.9,
            },
            '75%': {
              opacity: 0.95,
            },
            '80%': {
              opacity: 0.98,
            },
            '85%': {
              opacity: 0.95,
            },
            '90%': {
              opacity: 0.9,
            },
            '95%': {
              opacity: 0.95,
            },
            '100%': {
              opacity: 0.98,
            }
          },
          '&': {
            animation: 'flicker 0.15s infinite',
          },
          '& > *': {
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(255,255,255,0.1)',
              animation: 'scanline 6s linear infinite',
              zIndex: 2,
            }
          }
        }}
      >
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="h2" 
              component="h1" 
              align="center" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                fontWeight: 700,
                background: isDarkMode 
                  ? 'linear-gradient(45deg, #64B5F6 30%, #2196F3 90%)'
                  : 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
                textShadow: isDarkMode 
                  ? '0 2px 4px rgba(0,0,0,0.5)'
                  : '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Welcome to Unit
            </Typography>
            <Typography 
              variant="h5" 
              align="center" 
              sx={{ 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'text.primary',
                maxWidth: '800px',
                mb: 4,
                textShadow: isDarkMode 
                  ? '0 1px 2px rgba(0,0,0,0.5)'
                  : '0 1px 2px rgba(0,0,0,0.1)'
              }} 
              paragraph
            >
              Your gateway to Unit, Dork and Lil Chubs
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        <Box sx={{ mt: 8, mb: 8 }}>
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
                  <Box 
                    component="img"
                    src={token.icon}
                    alt={token.title}
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 2,
                      borderRadius: '50%',
                      padding: 1,
                      background: isDarkMode 
                        ? 'linear-gradient(45deg, rgba(33,150,243,0.1), rgba(33,150,243,0.2))'
                        : 'linear-gradient(45deg, rgba(25,118,210,0.1), rgba(25,118,210,0.2))',
                      boxShadow: isDarkMode 
                        ? '0 0 20px rgba(33,150,243,0.2)'
                        : '0 0 20px rgba(25,118,210,0.2)',
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
                          borderColor: isDarkMode ? 'rgba(33,150,243,0.5)' : undefined,
                          color: isDarkMode ? '#2196F3' : undefined,
                          borderRadius: 2,
                          '&:hover': {
                            borderColor: isDarkMode ? '#2196F3' : undefined,
                            backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : undefined,
                            transform: 'translateY(-2px)',
                            transition: 'all 0.2s ease-in-out'
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
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      '&::after': {
                        opacity: 0.7,
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '200px',
                      backgroundImage: `url(${project.backgroundImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: isDarkMode 
                        ? 'linear-gradient(180deg, rgba(28,28,28,0.9) 0%, rgba(28,28,28,0.95) 100%)'
                        : 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                      transition: 'opacity 0.3s',
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
    </>
  );
};

export default UnitHome; 