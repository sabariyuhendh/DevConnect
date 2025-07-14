
import { Link } from 'react-router-dom';
import { Code2, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer 
      className="footer-container bg-black" 
      style={{ 
        border: 'none !important', 
        borderLeft: 'none !important', 
        borderRight: 'none !important',
        borderTop: 'none !important',
        borderBottom: 'none !important',
        background: '#000000 !important'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Code2 className="h-6 w-6 text-white" />
              <span className="text-lg font-bold text-white">DevConnect</span>
            </Link>
            <p className="text-zinc-400 text-sm mb-4 max-w-md">
              The professional social platform for developers. Connect, share knowledge, 
              and grow your career with fellow developers worldwide.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-zinc-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><Link to="/feed" className="hover:text-white transition-colors">Feed</Link></li>
              <li><Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link></li>
              <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
              <li><Link to="/create" className="hover:text-white transition-colors">Write</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-zinc-400">
          <p>&copy; 2024 DevConnect. All rights reserved.</p>
          <p>Made with ❤️ for developers</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
