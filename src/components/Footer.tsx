import Link from 'next/link';
import { Brand } from './Brand';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-sm text-slate hover:text-ink transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate hover:text-ink transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="text-sm text-slate hover:text-ink transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/dashboard" className="text-sm text-slate hover:text-ink transition-colors">About</Link></li>
              <li><Link href="/pricing" className="text-sm text-slate hover:text-ink transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-slate hover:text-ink transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate hover:text-ink transition-colors">Terms</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">Contact</h3>
            <ul className="space-y-3">
              <li><Link href="mailto:support@inboxpilot.com" className="text-sm text-slate hover:text-ink transition-colors">Support</Link></li>
              <li><Link href="/dashboard" className="text-sm text-slate hover:text-ink transition-colors">Help Center</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-line">
          <Brand />
          <p className="text-sm text-slate mt-4 md:mt-0">
            © {currentYear} InboxPilot
          </p>
        </div>
      </div>
    </footer>
  );
}