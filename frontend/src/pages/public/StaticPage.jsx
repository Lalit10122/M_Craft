import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';

const StaticPage = () => {
  const { slug } = useParams();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/pages/${slug}`);
        setPageData(res.data.data);
      } catch (error) {
        console.error('Failed to load page:', error);
        setPageData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [slug]);

  if (loading) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>Loading...</div>;

  if (!pageData) return (
    <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
      <h1>Page Not Found</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>The page you are looking for does not exist.</p>
    </div>
  );

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '60vh' }}>
      <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', textAlign: 'center' }}>{pageData.title}</h1>
      <div 
        className="html-content"
        style={{ lineHeight: 1.6, color: '#333' }}
        dangerouslySetInnerHTML={{ __html: pageData.content }}
      />
    </div>
  );
};

export default StaticPage;
