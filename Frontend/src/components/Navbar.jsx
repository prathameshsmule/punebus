import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './navbar.css';
import EnquiryForm from "../pages/EnquiryForm";

const ModalPortal = ({ children, onClose }) => {
  const [container] = useState(() => {
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      document.body.appendChild(root);
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'modal-container';
    return { root, wrapper };
  });

  useEffect(() => {
    const { root, wrapper } = container;
    root.appendChild(wrapper);

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight || '';
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) document.body.style.paddingRight = `${scrollBarWidth}px`;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);

    return () => {
      try { root.removeChild(wrapper); } catch {}
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-backdrop" role="dialog" aria-modal="true" onMouseDown={handleBackdropClick}>
      <div className="modal-box" tabIndex={-1} role="document">
        <button className="modal-close" aria-label="Close enquiry" onClick={onClose}>✕</button>
        <div className="modal-content" onMouseDown={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    container.wrapper
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [exiting, setExiting] = useState(false);

  const safeParse = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch { return null; }
  };

  const user = safeParse('user');
  const admin = safeParse('admin');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    navigate('/');
  };

  const toggleMobileMenu = () => setMobileMenuOpen((p) => !p);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path) => location.pathname === path;

  const openEnquiry = () => {
    setExiting(false);
    setShowEnquiry(true);
    closeMobileMenu();
  };

  const closeEnquiry = () => {
    setExiting(true);
    setTimeout(() => {
      setShowEnquiry(false);
      setExiting(false);
    }, 300);
  };

  const handleEnquirySuccess = () => {
    setExiting(true);
    setTimeout(() => {
      setShowEnquiry(false);
      setExiting(false);
    }, 300);
  };

  const firstFocusRef = useRef(null);
  useEffect(() => {
    if (showEnquiry) {
      setTimeout(() => {
        const el = document.querySelector('.modal-content input, .modal-content textarea, .modal-content select');
        if (el) el.focus();
      }, 80);
    }
  }, [showEnquiry]);

  return (
    <>
      <header className="nav">
        <div className="container">

          {/* Brand Text */}
          <div className="brand">
            <Link to="/" onClick={closeMobileMenu} className="brand-link">
              PuneBus
            </Link>
          </div>

          <div
            className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            role="button"
          >
            <span></span><span></span><span></span>
          </div>

          <nav className={`links ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/" onClick={closeMobileMenu} className={isActive('/') ? 'active' : ''}>Home</Link>
            <Link to="/services" onClick={closeMobileMenu} className={isActive('/services') ? 'active' : ''}>Services</Link>
            <Link to="/register" onClick={closeMobileMenu} className={isActive('/register') ? 'active' : ''}>Register</Link>

            {/* ✅ ADMIN — ONLY EMOJI */}
            {!admin && (
              <Link
                to="/admin/login"
                onClick={closeMobileMenu}
                className={isActive('/admin/login') ? 'active with-icon' : 'with-icon'}
                aria-label="Admin Login"
              >
                🛡️
              </Link>
            )}

            {admin && (
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className={isActive('/admin') ? 'active with-icon' : 'with-icon'}
                aria-label="Admin Dashboard"
              >
                🛡️
              </Link>
            )}

            {(user || admin) && (
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            )}

            <button
              className="btn-enquiry highlight with-icon"
              onClick={openEnquiry}
              aria-haspopup="dialog"
            >
              Enquiry
            </button>
          </nav>
        </div>
      </header>

      {showEnquiry && (
        <ModalPortal onClose={closeEnquiry}>
          <div className={`enquiry-inner ${exiting ? 'slide-out' : 'slide-in'}`}>
            <EnquiryForm onSuccess={handleEnquirySuccess} />
          </div>
        </ModalPortal>
      )}
    </>
  );
};

export default Navbar;
