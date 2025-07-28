import React, { useEffect } from 'react';
import { createPageUrl } from '@/utils';

// This is a temporary component to redirect to the main chat page.
// It ensures that anyone visiting the root URL of the site is taken to the right place.
export default function HomePage() {
  useEffect(() => {
    // Redirect to the main Chat page as soon as the component loads.
    window.location.href = createPageUrl('Chat');
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      backgroundColor: '#f8f9fa'
    }}>
      <p style={{ fontSize: '1.2rem', color: '#6c757d' }}>
        Redirecting to the AI Booking Assistant...
      </p>
    </div>
  );
}