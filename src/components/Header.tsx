'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <Image
              src="/logo.png"
              alt="CigarMap.net"
              width={200}
              height={60}
              className="h-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/cities"
              className="text-secondary-foreground/80 hover:text-primary transition-colors"
            >
              Cities
            </Link>
            <Link
              href="/about"
              className="text-secondary-foreground/80 hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-secondary-foreground/80 hover:text-primary transition-colors"
            >
              Contact
            </Link>
            <Button asChild>
              <Link href="/add-lounge">Add a Lounge</Link>
            </Button>
            <Button asChild className="bg-orange hover:bg-orange-dark text-white">
              <Link href="/login">Sign In</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-secondary-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/cities"
                className="text-secondary-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cities
              </Link>
              <Link
                href="/about"
                className="text-secondary-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-secondary-foreground/80 hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Button asChild className="w-full">
                <Link href="/add-lounge" onClick={() => setMobileMenuOpen(false)}>
                  Add a Lounge
                </Link>
              </Button>
              <Button asChild className="w-full bg-orange hover:bg-orange-dark text-white">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
