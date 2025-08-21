'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function UserHomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation isAdmin={false} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Welcome to Compass Complaint Center
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Your satisfaction is our priority. Have a concern or complaint? 
              We're here to help resolve it quickly and efficiently.
            </p>
            <div className="space-x-4">
              <Link
                href="/submit-complaint"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>📝</span>
                <span>Submit a Complaint</span>
              </Link>
              <Link
                href="#how-it-works"
                className="border border-white/30 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                <span>ℹ️</span>
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How Our Complaint System Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've made it simple for you to report issues and track their resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                1. Submit Your Complaint
              </h3>
              <p className="text-gray-600">
                Fill out our simple form with details about your concern. 
                Include the title, description, category, and priority level.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⏳</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                2. We Review & Process
              </h3>
              <p className="text-gray-600">
                Our admin team receives instant email notifications and 
                reviews your complaint promptly to begin resolution.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                3. Resolution & Follow-up
              </h3>
              <p className="text-gray-600">
                We work to resolve your issue and update the status. 
                You'll be notified when your complaint is resolved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🚀</div>
              <h3 className="font-semibold text-gray-900 mb-2">Fast Response</h3>
              <p className="text-sm text-gray-600">
                Instant email notifications ensure quick response times
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="font-semibold text-gray-900 mb-2">Easy to Use</h3>
              <p className="text-sm text-gray-600">
                Simple, intuitive interface works on all devices
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
              <p className="text-sm text-gray-600">
                Your information is protected with enterprise-grade security
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparent</h3>
              <p className="text-sm text-gray-600">
                Clear categorization and priority system for efficient handling
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Submit Your Complaint?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Don't let issues go unresolved. Submit your complaint now and get the help you deserve.
          </p>
          <Link
            href="/submit-complaint"
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-lg font-medium text-lg transition-colors inline-flex items-center space-x-2"
          >
            <span>📝</span>
            <span>Submit Complaint Now</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400 mb-4">
              © 2025 Compass Complaint Center. All rights reserved.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="/admin" className="text-gray-400 hover:text-white">
                Admin Portal
              </a>
              <span className="text-gray-600">|</span>
              <a href="/submit-complaint" className="text-gray-400 hover:text-white">
                Submit Complaint
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
