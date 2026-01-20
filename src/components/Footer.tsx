import Link from 'next/link'
import { MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">CigarMap</span>
            </Link>
            <p className="text-secondary-foreground/70 max-w-md">
              Your global directory for cigar lounges, cigar bars, and cigar culture.
              Discover the best cigar spots in every city.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cities" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  All Cities
                </Link>
              </li>
              <li>
                <Link href="/add-lounge" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Add a Lounge
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary-foreground/70 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 text-center text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} CigarMap.net. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
