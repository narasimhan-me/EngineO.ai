import Link from 'next/link';

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-slate-600 hover:text-sky-600 text-sm transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-slate-600 hover:text-sky-600 text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-slate-600 hover:text-sky-600 text-sm transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-sky-600 text-sm transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://docs.seoengine.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 hover:text-sky-600 text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-slate-600 hover:text-sky-600 text-sm transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-slate-900 font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <span className="text-slate-400 text-sm cursor-not-allowed">Privacy Policy</span>
              </li>
              <li>
                <span className="text-slate-400 text-sm cursor-not-allowed">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {currentYear} SEOEngine.io. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:support@seoengine.io"
                className="text-slate-500 hover:text-sky-600 text-sm transition-colors"
              >
                support@seoengine.io
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
