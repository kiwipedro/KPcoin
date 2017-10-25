  var toggleNavbarLinks = function () {
    var navbarLinks = document.getElementsByClassName('nav__links')[0];
    navbarLinks.classList.add('nav__links--toggled');
    if (navbarLinks.classList.contains('nav__links--open')) {
      navbarLinks.classList.remove('nav__links--open');
    } else {
      navbarLinks.classList.add('nav__links--open');
    }
  }
  
