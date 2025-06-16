import './Footer.css';
import "tailwindcss";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 text-center py-6 mt-auto">
        &copy; {new Date().getFullYear()} DisasterAlert. All rights reserved.
    </footer>
  );
}

export default Footer;
