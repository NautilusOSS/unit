import React from 'react';
import styled from 'styled-components';
import { Box, Typography } from '@mui/material';

interface BlockData {
  count: number;
  label: string;
}

const GraphContainer = styled(Box)<{ $isDarkTheme: boolean }>`
  width: 100%;
  height: 200px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 16px;
  background: ${props => props.$isDarkTheme ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
`;

const Bar = styled.div<{ $height: number; $isDarkTheme: boolean }>`
  flex: 1;
  height: ${props => props.$height}%;
  background: ${props => props.$isDarkTheme ? '#90caf9' : '#1976d2'};
  border-radius: 4px;
  transition: height 0.3s ease;
  position: relative;
  min-width: 20px;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }

  &:hover::after {
    content: '${props => props.title}';
    position: absolute;
    top: -30px;
    left: 50%;
    transform: translateX(-50%);
    background: ${props => props.$isDarkTheme ? '#333' : '#fff'};
    color: ${props => props.$isDarkTheme ? '#fff' : '#000'};
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1;
  }
`;

const Label = styled(Typography)<{ $isDarkTheme: boolean }>`
  color: ${props => props.$isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'};
  font-size: 12px;
  text-align: center;
  margin-top: 8px;
`;

interface BlockProductionGraphProps {
  data: BlockData[];
  isDarkTheme: boolean;
}

const BlockProductionGraph: React.FC<BlockProductionGraphProps> = ({ data, isDarkTheme }) => {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <Box>
      <GraphContainer $isDarkTheme={isDarkTheme}>
        {data.map((item, index) => (
          <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            <Bar
              $height={(item.count / maxCount) * 80}
              $isDarkTheme={isDarkTheme}
              title={`${item.count.toLocaleString()} blocks`}
            />
            <Label $isDarkTheme={isDarkTheme}>{item.label}</Label>
          </Box>
        ))}
      </GraphContainer>
    </Box>
  );
};

export default BlockProductionGraph; 