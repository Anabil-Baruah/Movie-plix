import React, { useState, useEffect } from "react";
import { SlMenu } from "react-icons/sl";
import { VscChromeClose } from "react-icons/vsc";
import { FiUser, FiLogOut } from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../store/authSlice";
import { clearUserProfile } from "../../store/userProfileSlice";
import { Dropdown, Avatar, message } from "antd";
import "./header.scss";

import ContentWrapper from "../contentWrapper/ContentWrapper";
// import logo from "../../assets/movix-logo.svg";
import logo from "../../assets/MoviePlix-logo.svg";

const Header = () => {
  const [show, setShow] = useState("top");
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location])

  const controllNavbar = () => {
    // console.log(window.scrollY)
    if (window.scrollY > 200) {
      if (window.scrollY > lastScrollY && !mobileMenu) {
        setShow("hide")
      } else {
        setShow("show")
      }
    } else {
      setShow("top")
    }
    setLastScrollY(window.scrollY)
  }

  useEffect(() => {
    window.addEventListener("scroll", controllNavbar)
    return () => {
      window.removeEventListener("scroll", controllNavbar)
    }
  }, [lastScrollY])

  const openMobileMenu = () => {
    setMobileMenu(true);
  }

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearUserProfile());
    message.success('Logged out successfully');
    navigate('/');
  }

  const navigationHandler = (type) => {
    if (type === "movie") {
      navigate("/explore/movie");
    } 
    else if(type === "auth"){
      navigate("/authPage");
    }
    else {
      navigate("/explore/tv");
    }
    setMobileMenu(false)
  }

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser />
          <span>{user?.username || 'Profile'}</span>
        </div>
      ),
      onClick: () => {
        navigate('/profile');
        setMobileMenu(false);
      }
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiLogOut />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout
    }
  ];

  return (
    <header className={`header ${mobileMenu ? "mobileView" : ""} ${show}`}>
      <ContentWrapper>
        <div className="logo"
          onClick={() => navigate(`/`)}
        >
          <img src={logo} alt="" />
        </div>
        <ul className="menuItems">
          <li className="menuItem" onClick={() => { navigationHandler("movie") }}>Movies</li>
          <li className="menuItem" onClick={() => { navigationHandler("tv") }}>TV shows</li>
          <li className="menuItem" onClick={() => navigate('/subscriptions')}>Subscriptions</li>
          {isAuthenticated ? (
            <li className="menuItem">
              <Dropdown 
                menu={{ items: userMenuItems }} 
                placement="bottomRight"
                trigger={['click']}
              >
                <div className="userAvatar">
                  <Avatar 
                    size="default"
                    style={{ 
                      backgroundColor: 'var(--pink)',
                      cursor: 'pointer'
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </Avatar>
                </div>
              </Dropdown>
            </li>
          ) : (
            <li className="menuItem" onClick={() => { navigationHandler("auth") }}>Sign in</li>
          )}
          
        </ul>

        <div className="mobileMenuItems">
          {mobileMenu ? (<VscChromeClose onClick={() => { setMobileMenu(false) }} />) :
            (<SlMenu onClick={openMobileMenu} />)}
        </div>
      </ContentWrapper>
    </header>
  );
};

export default Header;
