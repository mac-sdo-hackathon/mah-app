import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 1000,
          width: 40,
          height: 40,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
        }}
      >
        {isDarkMode ? '☀️' : '🌙'}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;