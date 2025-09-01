import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, FileText, AlertTriangle, Shield, Users } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Mail className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">InboxPilot</span>
          </div>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Terms and conditions for using InboxPilot
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Last updated: January 2024
          </p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Agreement to Terms</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement between you and 
                InboxPilot ("we", "us", or "our") regarding your use of the InboxPilot email organization service 
                (the "Service").
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800">
                  <strong>By accessing or using our Service, you agree to be bound by these Terms.</strong> 
                  If you do not agree to these Terms, please do not use our Service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle>Service Description</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                InboxPilot is an AI-powered email organization service that helps you automatically 
                categorize and organize your Gmail emails. Our Service includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>AI-powered email categorization and labeling</li>
                <li>Automatic organization of your Gmail inbox</li>
                <li>Email analytics and insights</li>
                <li>Subscription management and billing</li>
                <li>Customer support</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of the Service 
                at any time with reasonable notice.
              </p>
            </CardContent>
          </Card>

          {/* Account Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>Account Requirements</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Eligibility</h4>
                <p className="text-gray-600">
                  You must be at least 13 years old to use our Service. If you are under 18, 
                  you must have parental consent to use the Service.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Account Security</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>You must provide accurate and complete information when creating your account</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You may not share your account credentials with others</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Gmail Integration</h4>
                <p className="text-gray-600">
                  To use our Service, you must connect a valid Gmail account and grant us the necessary 
                  permissions to read and modify your emails for organization purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span>Acceptable Use Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Prohibited Activities</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Use the Service for any illegal or unauthorized purpose</li>
                    <li>Attempt to reverse engineer or hack the Service</li>
                    <li>Upload or transmit malicious code or viruses</li>
                    <li>Interfere with the operation of the Service</li>
                    <li>Access other users' accounts or data</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold">Content Restrictions</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>Use the Service to process emails containing illegal content</li>
                    <li>Attempt to categorize emails for fraudulent purposes</li>
                    <li>Use the Service to spam or send unsolicited communications</li>
                  </ul>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-red-800">
                  <strong>Violation Notice:</strong> Violation of these terms may result in immediate 
                  suspension or termination of your account without notice.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing and Payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Subscription Plans</h4>
                <p className="text-gray-600 mb-3">
                  We offer both free and paid subscription plans. Paid plans are billed monthly and 
                  automatically renewed unless cancelled.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Payment Terms</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>All payments are processed through our payment partner, Lemon Squeezy</li>
                  <li>Payments are due monthly in advance</li>
                  <li>All fees are non-refundable except as required by law</li>
                  <li>We may change our pricing with 30 days' notice</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Cancellation</h4>
                <p className="text-gray-600">
                  You may cancel your subscription at any time. Your access to paid features will 
                  continue until the end of your current billing period, after which your account 
                  will revert to the free plan.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data and Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>Data Usage and Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Email Processing</h4>
                <p className="text-gray-600 mb-3">
                  By using our Service, you grant us permission to:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Read your emails to analyze and categorize them</li>
                  <li>Create and apply labels in your Gmail account</li>
                  <li>Store categorization results and metadata</li>
                  <li>Use anonymized data to improve our AI models</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Privacy Commitment</h4>
                <p className="text-gray-600">
                  We are committed to protecting your privacy. Our data practices are governed by our 
                  Privacy Policy, which is incorporated into these Terms by reference.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-green-800">
                  <strong>Important:</strong> We never store your actual email content and only process 
                  emails in memory for categorization purposes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Limitations and Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <span>Limitations and Disclaimers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Service Availability</h4>
                <p className="text-gray-600">
                  We strive to provide reliable service but cannot guarantee 100% uptime. 
                  The Service may be temporarily unavailable due to maintenance, updates, or unforeseen issues.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">AI Accuracy</h4>
                <p className="text-gray-600">
                  While our AI categorization is highly accurate, we cannot guarantee perfect results. 
                  You should review and adjust categorizations as needed.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Third-Party Services</h4>
                <p className="text-gray-600">
                  Our Service integrates with Gmail and other third-party services. We are not responsible 
                  for the availability or functionality of these external services.
                </p>
              </div>

              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>DISCLAIMER:</strong> THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT 
                  WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Liability and Indemnification */}
          <Card>
            <CardHeader>
              <CardTitle>Liability and Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Limitation of Liability</h4>
                <p className="text-gray-600">
                  To the maximum extent permitted by law, InboxPilot shall not be liable for any indirect, 
                  incidental, special, or consequential damages arising from your use of the Service.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Maximum Liability</h4>
                <p className="text-gray-600">
                  Our total liability to you for all claims related to the Service shall not exceed 
                  the amount you paid us in the twelve months prior to the event giving rise to the liability.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Indemnification</h4>
                <p className="text-gray-600">
                  You agree to indemnify and hold harmless InboxPilot from any claims arising from 
                  your use of the Service or violation of these Terms.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Termination by You</h4>
                <p className="text-gray-600">
                  You may terminate your account at any time by contacting us or through your account settings. 
                  Upon termination, your right to use the Service will cease immediately.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Termination by Us</h4>
                <p className="text-gray-600">
                  We may terminate or suspend your account immediately if you violate these Terms or 
                  engage in conduct that we deem harmful to the Service or other users.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Effect of Termination</h4>
                <p className="text-gray-600">
                  Upon termination, we will delete your account data in accordance with our Privacy Policy. 
                  Some provisions of these Terms will survive termination.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* General Provisions */}
          <Card>
            <CardHeader>
              <CardTitle>General Provisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Changes to Terms</h4>
                <p className="text-gray-600">
                  We may update these Terms from time to time. We will notify you of significant changes 
                  and obtain your consent where required by law.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Governing Law</h4>
                <p className="text-gray-600">
                  These Terms are governed by the laws of [Your Jurisdiction]. Any disputes will be 
                  resolved in the courts of [Your Jurisdiction].
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Entire Agreement</h4>
                <p className="text-gray-600">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between 
                  you and InboxPilot regarding the Service.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Email:</strong> legal@inboxpilot.com</p>
                <p><strong>Support:</strong> support@inboxpilot.com</p>
                <p><strong>Address:</strong> InboxPilot Legal Team, [Your Address]</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <Button className="px-8">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}