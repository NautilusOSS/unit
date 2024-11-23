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

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h2" component="h1" align="center" gutterBottom>
          Welcome to Unit Token
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
          Your gateway to Unit Dork and Chub on the Voi Network
        </Typography>

        <Typography 
          variant="h4" 
          align="center" 
          gutterBottom
          sx={{ mb: 4 }}
        >
          Tools
        </Typography>
        
        <Grid container spacing={4} justifyContent="center">
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
                  borderRadius: 2,
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
      </Box>
    </Container>
  );
};

export default UnitHome; 