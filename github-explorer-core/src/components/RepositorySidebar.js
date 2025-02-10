import React, { useState, useEffect, useRef } from 'react';

// PUBLIC_INTERFACE
const RepositorySidebar = ({ className }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const sections = ['Overview', 'README', 'Commit History', 'Contributors'];
  const observerRef = useRef(null);
  const sidebarRef = useRef(null);
  const transitionDuration = 300; // Duration in ms

  // Calculate and set sidebar width on mount and resize
  useEffect(() => {
    const updateSidebarWidth = () => {
      if (sidebarRef.current) {
        const containerWidth = sidebarRef.current.parentElement.offsetWidth;
        setSidebarWidth(window.innerWidth > 768 ? containerWidth * 0.2 : 280); // 20% of container width or 280px for mobile
      }
    };

    updateSidebarWidth();
    window.addEventListener('resize', updateSidebarWidth);
    return () => window.removeEventListener('resize', updateSidebarWidth);
  }, []);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '-10% 0px -85% 0px',
      threshold: 0
    };

    const handleIntersect = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersect, options);

    sections.forEach(section => {
      const element = document.getElementById(section.toLowerCase().replace(' ', '-'));
      if (element) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getHeaderOffset = () => {
    const header = document.querySelector('header');
    return header ? header.offsetHeight : 0;
  };

  const scrollToSection = (sectionId, event) => {
    if (event) {
      event.preventDefault();
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = getHeaderOffset();
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setActiveSection(sectionId);
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsTransitioning(true);
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    
    // Handle overlay visibility with proper timing
    if (newState) {
      setOverlayVisible(true);
    } else {
      // Delay hiding the overlay until the transition completes
      setTimeout(() => {
        setOverlayVisible(false);
      }, transitionDuration);
    }
    
    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  };

  // Handle click outside to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          !event.target.classList.contains('sidebar-toggle')) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav 
        ref={sidebarRef}
        className={`repository-sidebar ${className || ''} ${isMobileMenuOpen ? 'active' : ''} ${isTransitioning ? 'transitioning' : ''}`}
        style={{ width: window.innerWidth > 768 ? sidebarWidth : null }}
      >
        <ul>
          {sections.map((section) => {
            const sectionId = section.toLowerCase().replace(' ', '-');
            return (
              <li key={sectionId}>
                <button
                  className={`sidebar-link ${activeSection === sectionId ? 'active' : ''}`}
                  onClick={(e) => scrollToSection(sectionId, e)}
                >
                  {section}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        className="sidebar-toggle"
        onClick={toggleMobileMenu}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>
      <div
        className={`sidebar-overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => {
          setIsMobileMenuOpen(false);
          setTimeout(() => setOverlayVisible(false), transitionDuration);
        }}
        style={{ display: overlayVisible ? 'block' : 'none' }}
      />
    </>
  );
};

export default RepositorySidebar;
